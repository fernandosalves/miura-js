import { BaseDirective, DirectiveManager } from '@miura/miura-render';

// ── Types accepted as stream sources ──────────────────────────────────────────

type StreamSource =
    | ReadableStream<string | Uint8Array>
    | AsyncIterable<string>
    | EventSource
    | WebSocket
    | null
    | undefined;

// ── Helpers ───────────────────────────────────────────────────────────────────

const _decoder = new TextDecoder();

function _toAsyncIterable(source: StreamSource): AsyncIterable<string> | null {
    if (!source) return null;

    // ReadableStream
    if (source instanceof ReadableStream) {
        const reader = source.getReader();
        return {
            [Symbol.asyncIterator]() {
                return {
                    async next() {
                        const { done, value } = await reader.read();
                        if (done) {
                            reader.releaseLock();
                            return { done: true as const, value: undefined };
                        }
                        const text = typeof value === 'string' ? value : _decoder.decode(value as Uint8Array, { stream: true });
                        return { done: false, value: text };
                    },
                    return() {
                        reader.releaseLock();
                        return Promise.resolve({ done: true as const, value: undefined });
                    },
                };
            },
        };
    }

    // AsyncIterable (e.g. custom generators)
    if (Symbol.asyncIterator in source) {
        return source as AsyncIterable<string>;
    }

    // EventSource
    if (source instanceof EventSource) {
        return _eventSourceIterable(source);
    }

    // WebSocket
    if (source instanceof WebSocket) {
        return _webSocketIterable(source);
    }

    return null;
}

function _eventSourceIterable(es: EventSource): AsyncIterable<string> {
    return {
        [Symbol.asyncIterator]() {
            const queue: string[] = [];
            let _resolve: (() => void) | null = null;
            let _done = false;

            es.addEventListener('message', (e: MessageEvent) => {
                queue.push(e.data);
                _resolve?.();
                _resolve = null;
            });
            es.addEventListener('error', () => {
                _done = true;
                es.close();
                _resolve?.();
                _resolve = null;
            });

            return {
                async next() {
                    while (!_done && queue.length === 0) {
                        await new Promise<void>(r => { _resolve = r; });
                    }
                    if (queue.length > 0) {
                        return { done: false, value: queue.shift()! };
                    }
                    return { done: true as const, value: undefined };
                },
            };
        },
    };
}

function _webSocketIterable(ws: WebSocket): AsyncIterable<string> {
    return {
        [Symbol.asyncIterator]() {
            const queue: string[] = [];
            let _resolve: (() => void) | null = null;
            let _done = false;

            ws.addEventListener('message', (e: MessageEvent) => {
                const text = typeof e.data === 'string' ? e.data : _decoder.decode(e.data);
                queue.push(text);
                _resolve?.();
                _resolve = null;
            });
            ws.addEventListener('close', () => {
                _done = true;
                _resolve?.();
                _resolve = null;
            });
            ws.addEventListener('error', () => {
                _done = true;
                _resolve?.();
                _resolve = null;
            });

            return {
                async next() {
                    while (!_done && queue.length === 0) {
                        await new Promise<void>(r => { _resolve = r; });
                    }
                    if (queue.length > 0) {
                        return { done: false, value: queue.shift()! };
                    }
                    return { done: true as const, value: undefined };
                },
            };
        },
    };
}

// ── StreamDirective ───────────────────────────────────────────────────────────

/**
 * `#stream` — progressively append text tokens from a stream source to an element.
 *
 * Accepted sources:
 *  - `ReadableStream<string | Uint8Array>` (fetch `.body`, OPFS, custom)
 *  - `AsyncIterable<string>`              (async generators, SSE wrappers)
 *  - `EventSource`                        (Server-Sent Events)
 *  - `WebSocket`                          (binary or text frames)
 *  - `null` / `undefined`                 (no-op / clears previous state)
 *
 * Usage:
 * ```html
 * <div #stream=${readableStream}></div>
 * <p  #stream=${eventSource} data-stream-cursor></p>
 * ```
 *
 * Attributes set on the host element:
 *  - `data-stream="active"`  while streaming
 *  - `data-stream="done"`    when the stream closes normally
 *  - `data-stream="error"`   if the stream throws
 *
 * Options via host-element attributes (read once on `mount`):
 *  - `data-stream-cursor`    — show a blinking text cursor while streaming
 *  - `data-stream-append`    — append to existing content instead of clearing
 */
export class StreamDirective extends BaseDirective {
    private _abortCtrl: AbortController | null = null;
    private _cursor: HTMLSpanElement | null = null;
    private _showCursor = false;
    private _append = false;

    mount(element: Element): void {
        this.element = element;
        this._showCursor = element.hasAttribute('data-stream-cursor');
        this._append     = element.hasAttribute('data-stream-append');
    }

    update(value: unknown): void {
        this._stop();
        const source = value as StreamSource;
        if (!source) {
            this._setStatus('');
            return;
        }

        const iterable = _toAsyncIterable(source);
        if (!iterable) return;

        this._start(iterable);
    }

    unmount(): void {
        this._stop();
    }

    // ── Private ───────────────────────────────────────────────────────────────

    private _start(iterable: AsyncIterable<string>): void {
        const ctrl = new AbortController();
        this._abortCtrl = ctrl;

        if (!this._append) {
            (this.element as HTMLElement).textContent = '';
        }

        this._setStatus('active');

        if (this._showCursor) {
            this._cursor = document.createElement('span');
            this._cursor.setAttribute('data-stream-cursor', '');
            this._cursor.style.cssText =
                'display:inline-block;width:2px;height:1em;background:currentColor;' +
                'margin-left:1px;vertical-align:text-bottom;' +
                'animation:__miura_stream_blink 1s step-end infinite';
            _ensureCursorKeyframes();
            this.element!.appendChild(this._cursor);
        }

        (async () => {
            try {
                for await (const chunk of iterable) {
                    if (ctrl.signal.aborted) break;
                    this._appendText(chunk);
                }
                if (!ctrl.signal.aborted) {
                    this._setStatus('done');
                }
            } catch {
                if (!ctrl.signal.aborted) {
                    this._setStatus('error');
                }
            } finally {
                this._removeCursor();
            }
        })();
    }

    private _stop(): void {
        this._abortCtrl?.abort();
        this._abortCtrl = null;
        this._removeCursor();
    }

    private _appendText(text: string): void {
        const el = this.element as HTMLElement;
        if (this._cursor) {
            el.insertBefore(document.createTextNode(text), this._cursor);
        } else {
            el.appendChild(document.createTextNode(text));
        }
    }

    private _removeCursor(): void {
        this._cursor?.remove();
        this._cursor = null;
    }

    private _setStatus(status: string): void {
        if (!this.element) return;
        if (status) {
            this.element.setAttribute('data-stream', status);
        } else {
            this.element.removeAttribute('data-stream');
        }
    }
}

// ── Cursor keyframes (injected once) ─────────────────────────────────────────

let _keyframesInjected = false;
function _ensureCursorKeyframes(): void {
    if (_keyframesInjected || typeof document === 'undefined') return;
    _keyframesInjected = true;
    const style = document.createElement('style');
    style.textContent =
        '@keyframes __miura_stream_blink{0%,100%{opacity:1}50%{opacity:0}}';
    document.head.appendChild(style);
}

// ── Auto-register ─────────────────────────────────────────────────────────────

DirectiveManager.register('stream', StreamDirective);
