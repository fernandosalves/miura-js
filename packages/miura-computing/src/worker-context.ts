import type {
    WorkerRequest,
    WorkerResponse,
    WorkerChunk,
    WorkerError,
    HandlerMap,
    AnyHandler,
} from './types.js';

/**
 * expose() — worker-side registration of task handlers.
 *
 * Call this once inside your worker file. Each handler is either:
 * - A regular function / async function  → returns a single result
 * - An async generator function          → streams chunks back to the main thread
 *
 * ── Worker file example ───────────────────────────────────────────────────────
 *
 *   import { expose } from '@miura/miura-computing/worker';
 *
 *   expose({
 *     // Single result
 *     add: ({ a, b }: { a: number; b: number }) => a + b,
 *
 *     // Async streaming — yields tokens one by one
 *     async *tokenise({ text }: { text: string }) {
 *       for (const word of text.split(' ')) {
 *         await delay(50);
 *         yield word;
 *       }
 *     },
 *
 *     // Heavy computation
 *     async processImage({ buffer }: { buffer: ArrayBuffer }) {
 *       const result = await runCpuBoundTask(buffer);
 *       return result;
 *     },
 *   });
 */
export function expose(handlers: HandlerMap): void {
    self.addEventListener('message', async (event: MessageEvent) => {
        const msg = event.data as WorkerRequest;
        if (!msg?.__miura) return;

        const { id, method, payload } = msg;
        const handler = handlers[method] as AnyHandler | undefined;

        if (!handler) {
            const err: WorkerError = {
                __miura: true,
                id,
                type: 'error',
                message: `WorkerContext: no handler registered for method "${method}"`,
            };
            (self as unknown as Worker).postMessage(err);
            return;
        }

        try {
            const result = (handler as any)(payload);

            // Async generator (streaming)
            if (_isAsyncIterable(result)) {
                for await (const chunk of result) {
                    const msg: WorkerChunk = {
                        __miura: true,
                        id,
                        type: 'chunk',
                        chunk,
                        done: false,
                    };
                    (self as unknown as Worker).postMessage(msg);
                }
                // Signal end of stream
                const done: WorkerChunk = {
                    __miura: true,
                    id,
                    type: 'chunk',
                    chunk: undefined,
                    done: true,
                };
                (self as unknown as Worker).postMessage(done);
            } else {
                // Regular promise / value
                const value = await result;
                const response: WorkerResponse = {
                    __miura: true,
                    id,
                    type: 'result',
                    result: value,
                };
                (self as unknown as Worker).postMessage(response);
            }
        } catch (err: unknown) {
            const error = err instanceof Error ? err : new Error(String(err));
            const msg: WorkerError = {
                __miura: true,
                id,
                type: 'error',
                message: error.message,
                stack: error.stack,
            };
            (self as unknown as Worker).postMessage(msg);
        }
    });
}

/**
 * Post a result back to the main thread with transferable objects.
 * Use inside handlers to transfer large buffers without copying.
 */
export function transfer<T>(value: T, transferables: Transferable[]): { value: T; transfer: Transferable[] } {
    return { value, transfer: transferables };
}

function _isAsyncIterable(v: unknown): v is AsyncIterable<unknown> {
    return v != null &&
        typeof v === 'object' &&
        (Symbol.asyncIterator in (v as object) || Symbol.iterator in (v as object));
}
