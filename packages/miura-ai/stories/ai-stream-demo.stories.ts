import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html, css, component } from '@miurajs/miura-element';
import '@miurajs/miura-ai'; // auto-registers StreamDirective as '#stream'

/**
 * miura-ai — `#stream` directive
 *
 * This story demonstrates the planned API surface using simulated ReadableStreams.
 * When `#stream` is implemented, the manual reader loop in these demos will be
 * replaced by a single directive attribute binding.
 *
 * Planned usage:
 *   html`<div #stream=${readableStream}></div>`
 *   html`<div #stream=${eventSource}></div>`
 *   html`<div #stream=${webSocket}></div>`
 */

// ── Styles ─────────────────────────────────────────────────────────────────────

const STYLES = `
* { box-sizing: border-box; }
body, :host { font-family: system-ui, sans-serif; }
.demo { max-width: 760px; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
.card { border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; background: white; }
.card-header {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    color: white; padding: .75rem 1rem;
    display: flex; align-items: center; justify-content: space-between;
}
.card-header h3 { margin: 0; font-size: .95rem; }
.badge {
    font-size: .7rem; font-weight: 700; padding: .15rem .5rem;
    border-radius: 4px; text-transform: uppercase; letter-spacing: .05em;
}
.badge-violet { background: #7c3aed; }
.badge-teal   { background: #0d9488; }
.badge-orange { background: #ea580c; }
.badge-planned { background: #374151; color: #d1fae5; font-style: italic; }
.card-body { padding: 1rem; }
.row { display: flex; gap: .5rem; align-items: center; flex-wrap: wrap; margin-bottom: .75rem; }
label { font-size: .85rem; color: #475569; font-weight: 500; }
select, input[type=number] {
    border: 1px solid #cbd5e1; border-radius: 6px;
    padding: .35rem .65rem; font-size: .85rem;
}
button {
    background: #4f46e5; color: white; border: none; border-radius: 6px;
    padding: .4rem .9rem; font-size: .85rem; cursor: pointer; font-weight: 500;
}
button:hover { background: #4338ca; }
button:disabled { opacity: .5; cursor: not-allowed; }
.stream-box {
    background: #0f172a; color: #e2e8f0; border-radius: 8px;
    padding: 1rem 1.25rem; font-size: .9rem; line-height: 1.7;
    min-height: 80px; position: relative; font-family: system-ui;
    white-space: pre-wrap;
}
.stream-box .cursor {
    display: inline-block; width: 2px; height: 1em;
    background: #38bdf8; margin-left: 2px; vertical-align: text-bottom;
    animation: blink 1s step-end infinite;
}
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
.stream-box[data-done] .cursor { display: none; }
.meta { font-size: .75rem; color: #64748b; margin-top: .5rem; display: flex; gap: 1rem; }
.code-snippet {
    background: #1e293b; color: #7dd3fc; font-family: monospace; font-size: .8rem;
    border-radius: 6px; padding: .75rem 1rem; margin-top: .75rem;
    border-left: 3px solid #3b82f6;
}
.comment { color: #475569; }
.directive { color: #a78bfa; }
.attr { color: #86efac; }
.planned-notice {
    background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px;
    padding: .75rem 1rem; font-size: .85rem; color: #92400e;
    display: flex; align-items: center; gap: .5rem;
}
`;

// ── Simulated ReadableStream factory ──────────────────────────────────────────

const SAMPLE_RESPONSES: Record<string, string> = {
    explain: `miura is a lightweight Web Components framework built around reactive properties and declarative template bindings. Components extend MiuraElement, define their data via static properties, and return an html\`...\` template. The framework handles DOM updates, keyed list diffing, async rendering, and structural directives like #if and #for — all without a virtual DOM.`,
    haiku: `Cherry blossoms fall\nthrough silent autumn shadows —\ncode flows like water`,
    json: `{\n  "framework": "miura",\n  "version": "1.0.0",\n  "features": [\n    "reactive-properties",\n    "aot-compiler",\n    "keyed-diffing",\n    "structural-directives"\n  ],\n  "compiler": "AOT",\n  "license": "MIT"\n}`,
};

function makeStream(text: string, chunkMs: number): ReadableStream<string> {
    const words = text.split('');
    let i = 0;
    return new ReadableStream<string>({
        pull(ctrl) {
            return new Promise(resolve => {
                setTimeout(() => {
                    if (i < words.length) {
                        ctrl.enqueue(words[i++]);
                        resolve();
                    } else {
                        ctrl.close();
                        resolve();
                    }
                }, chunkMs);
            });
        },
    });
}

// ── Shared stream renderer ────────────────────────────────────────────────────

async function pipeToBox(
    stream: ReadableStream<string>,
    box: HTMLElement,
    onChunk?: (text: string) => void,
): Promise<void> {
    box.removeAttribute('data-done');
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    box.appendChild(cursor);

    const reader = (stream as ReadableStream<string>).getReader();
    let total = '';
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            total += value;
            // update text node before cursor
            let textNode = box.firstChild as Text | null;
            if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
                textNode = document.createTextNode('');
                box.insertBefore(textNode, cursor);
            }
            textNode.nodeValue = total;
            onChunk?.(total);
        }
    } finally {
        reader.releaseLock();
        box.setAttribute('data-done', '');
    }
}

// ── Story 1: ReadableStream (simulated LLM response) ─────────────────────────

function buildStreamCard(): HTMLElement {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
        <div class="card-header">
            <h3>ReadableStream — simulated LLM response</h3>
            <span class="badge badge-violet">character streaming</span>
        </div>
        <div class="card-body">
            <div class="row">
                <label>Prompt:</label>
                <select id="prompt">
                    <option value="explain">Explain miura framework</option>
                    <option value="haiku">Write a haiku</option>
                    <option value="json">Return JSON config</option>
                </select>
                <label>Speed:</label>
                <input type="number" id="speed" value="18" style="width:60px">
                <label>ms/char</label>
                <button id="btn-stream">Stream response</button>
            </div>
            <div class="stream-box" id="stream-box"></div>
            <div class="meta">
                <span id="char-count">0 chars</span>
                <span id="status">idle</span>
            </div>
            <div class="code-snippet">
<span class="comment">// Planned #stream directive API:</span>
<br><span class="directive">#stream</span>=<span class="attr">\${readableStream}</span>
<br><span class="comment">// vs current manual approach in this demo:</span>
<br>pipeToBox(readableStream, element)
            </div>
        </div>
    `;

    const box      = card.querySelector<HTMLElement>('#stream-box')!;
    const btn      = card.querySelector<HTMLButtonElement>('#btn-stream')!;
    const charCount = card.querySelector<HTMLElement>('#char-count')!;
    const status   = card.querySelector<HTMLElement>('#status')!;

    btn.addEventListener('click', async () => {
        btn.disabled = true;
        status.textContent = 'streaming…';
        box.textContent = '';

        const key   = (card.querySelector<HTMLSelectElement>('#prompt')!).value;
        const ms    = +(card.querySelector<HTMLInputElement>('#speed')!).value;
        const text  = SAMPLE_RESPONSES[key] ?? 'Hello, world!';
        const stream = makeStream(text, ms);

        let chars = 0;
        await pipeToBox(stream, box, t => {
            chars = t.length;
            charCount.textContent = `${chars} chars`;
        });

        status.textContent = `done — ${chars} chars`;
        btn.disabled = false;
    });

    return card;
}

// ── Story 2: SSE simulation ───────────────────────────────────────────────────

function buildSseCard(): HTMLElement {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
        <div class="card-header">
            <h3>SSE (Server-Sent Events) — simulated feed</h3>
            <span class="badge badge-teal">event stream</span>
        </div>
        <div class="card-body">
            <div class="row">
                <label>Interval:</label>
                <input type="number" id="interval" value="400" style="width:70px">
                <label>ms</label>
                <label>Events:</label>
                <input type="number" id="count" value="8" style="width:55px">
                <button id="btn-sse">Start feed</button>
                <button id="btn-clear">Clear</button>
            </div>
            <div class="stream-box" id="sse-box" style="min-height:120px;font-family:monospace;font-size:.8rem"></div>
            <div class="code-snippet">
<span class="comment">// Planned API — EventSource as stream source:</span>
<br><span class="directive">#stream</span>=<span class="attr">\${new EventSource('/api/events')}</span>
            </div>
        </div>
    `;

    const box  = card.querySelector<HTMLElement>('#sse-box')!;
    const btn  = card.querySelector<HTMLButtonElement>('#btn-sse')!;
    let running = false;

    card.querySelector('#btn-clear')!.addEventListener('click', () => { box.innerHTML = ''; });

    btn.addEventListener('click', async () => {
        if (running) return;
        running = true;
        btn.disabled = true;

        const interval = +(card.querySelector<HTMLInputElement>('#interval')!).value;
        const count    = +(card.querySelector<HTMLInputElement>('#count')!).value;

        const eventTypes = ['data', 'update', 'heartbeat', 'alert', 'metric'];
        const payloads   = ['{"temp":72.4}', '{"users":1042}', 'ping', '{"level":"warn","msg":"high load"}', '{"cpu":88}'];

        for (let i = 0; i < count; i++) {
            await new Promise(r => setTimeout(r, interval));
            const type    = eventTypes[i % eventTypes.length];
            const payload = payloads[i % payloads.length];
            const ts      = new Date().toLocaleTimeString();

            const line = document.createElement('div');
            line.style.cssText = 'padding:.15rem 0; border-bottom:1px solid rgba(255,255,255,.07)';
            line.innerHTML = `<span style="color:#475569">[${ts}]</span> <span style="color:#38bdf8">event:${type}</span> <span style="color:#86efac">data:${payload}</span>`;
            box.appendChild(line);
            box.scrollTop = box.scrollHeight;
        }

        running = false;
        btn.disabled = false;
    });

    return card;
}

// ── Story 3: Multi-stream chat ────────────────────────────────────────────────

function buildChatCard(): HTMLElement {
    const MESSAGES = [
        { role: 'user',      text: 'What is miura-element?' },
        { role: 'assistant', text: 'miura-element provides the MiuraElement base class for building reactive web components. It handles reactive properties, lifecycle hooks, computed properties, error boundaries, and integrates with the miura-render engine for declarative template binding.' },
        { role: 'user',      text: 'How does AOT work?' },
        { role: 'assistant', text: 'AOT mode generates JavaScript render and update functions at runtime using new Function(). These compiled functions cache element references so updates patch DOM properties directly — zero tree traversal on each render cycle.' },
    ];

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
        <div class="card-header">
            <h3>Chat interface — streamed responses</h3>
            <span class="badge badge-orange">multi-turn</span>
        </div>
        <div class="card-body">
            <div class="row">
                <button id="btn-play">Play conversation</button>
                <button id="btn-reset">Reset</button>
            </div>
            <div id="chat-log" style="display:flex;flex-direction:column;gap:.75rem;margin-bottom:.75rem"></div>
            <div class="planned-notice">
                ⚡ With <strong>#stream</strong>: each assistant message box would be
                <code style="background:#fef3c7;padding:.1rem .3rem;border-radius:3px">
                &lt;div class="bubble assistant" #stream=\${responseStream}&gt;&lt;/div&gt;
                </code>
            </div>
        </div>
    `;

    const log  = card.querySelector<HTMLElement>('#chat-log')!;
    const btn  = card.querySelector<HTMLButtonElement>('#btn-play')!;
    let playing = false;

    function addBubble(role: string): HTMLElement {
        const wrap = document.createElement('div');
        wrap.style.cssText = `display:flex;justify-content:${role === 'user' ? 'flex-end' : 'flex-start'}`;
        const bubble = document.createElement('div');
        bubble.style.cssText = `
            max-width:75%; padding:.6rem .9rem; border-radius:12px; font-size:.875rem;
            line-height:1.5; white-space:pre-wrap;
            background:${role === 'user' ? '#4f46e5' : '#f1f5f9'};
            color:${role === 'user' ? '#fff' : '#1e293b'};
        `;
        wrap.appendChild(bubble);
        log.appendChild(wrap);
        return bubble;
    }

    card.querySelector('#btn-reset')!.addEventListener('click', () => { log.innerHTML = ''; playing = false; btn.disabled = false; });

    btn.addEventListener('click', async () => {
        if (playing) return;
        playing = true;
        btn.disabled = true;
        log.innerHTML = '';

        for (const msg of MESSAGES) {
            await new Promise(r => setTimeout(r, 400));
            const bubble = addBubble(msg.role);

            if (msg.role === 'user') {
                bubble.textContent = msg.text;
            } else {
                const stream = makeStream(msg.text, 20);
                await pipeToBox(stream, bubble);
            }
        }

        playing = false;
    });

    return card;
}

// ── Full demo page ─────────────────────────────────────────────────────────────

function buildDemo(): HTMLElement {
    const wrap = document.createElement('div');
    const style = document.createElement('style');
    style.textContent = STYLES;
    wrap.appendChild(style);

    const demo = document.createElement('div');
    demo.className = 'demo';
    wrap.appendChild(demo);

    demo.appendChild(buildStreamCard());
    demo.appendChild(buildSseCard());
    demo.appendChild(buildChatCard());

    return wrap;
}

// ── Meta / stories ────────────────────────────────────────────────────────────

// ── Real MiuraElement component using #stream ─────────────────────────────────

@component({ tag: 'stream-demo-element' })
class StreamDemoElement extends MiuraElement {
    static properties = {
        stream: { type: Object, default: null },
    };
    declare stream: ReadableStream<string> | null;

    static get styles() {
        return css`
            :host { display: block; font-family: system-ui; }
            .bubble {
                background: #0f172a; color: #e2e8f0;
                border-radius: 8px; padding: .9rem 1.1rem;
                font-size: .9rem; line-height: 1.7; white-space: pre-wrap; min-height: 3rem;
            }
            .bubble[data-stream="active"] { border: 1px solid #38bdf8; }
            .bubble[data-stream="done"]   { border: 1px solid #4ade80; }
            .bubble[data-stream="error"]  { border: 1px solid #f87171; }
        `;
    }

    template() {
        return html`<div class="bubble" #stream=${this.stream}></div>`;
    }
}

function buildRealDirectiveDemo(): HTMLElement {
    const wrap = document.createElement('div');
    const style = document.createElement('style');
    style.textContent = STYLES;
    wrap.appendChild(style);

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
        <div class="card-header">
            <h3>Real #stream directive — MiuraElement binding</h3>
            <span class="badge badge-violet" style="background:#16a34a">LIVE</span>
        </div>
        <div class="card-body">
            <div class="row">
                <select id="prompt2">
                    <option value="explain">Explain miura framework</option>
                    <option value="haiku">Write a haiku</option>
                    <option value="json">Return JSON config</option>
                </select>
                <input type="number" id="speed2" value="18" style="width:60px">
                <label>ms/char</label>
                <button id="btn-real">Stream via #stream</button>
            </div>
            <stream-demo-element id="stream-el"></stream-demo-element>
            <div class="code-snippet" style="margin-top:.75rem">
<span class="comment">// template() inside StreamDemoElement:</span><br>
html\`&lt;div class="bubble" <span class="directive">#stream</span>=<span class="attr">${'{this.stream}'}</span>&gt;&lt;/div&gt;\`
            </div>
        </div>
    `;
    wrap.appendChild(card);

    const streamEl = card.querySelector<any>('#stream-el')!;
    const btn = card.querySelector<HTMLButtonElement>('#btn-real')!;

    btn.addEventListener('click', () => {
        const key  = (card.querySelector<HTMLSelectElement>('#prompt2')!).value;
        const ms   = +(card.querySelector<HTMLInputElement>('#speed2')!).value;
        const text = SAMPLE_RESPONSES[key] ?? 'Hello!';
        streamEl.stream = makeStream(text, ms);
    });

    return wrap;
}

const meta: Meta = {
    title: 'miura-ai/#stream directive',
    parameters: {
        docs: {
            description: {
                component: `
**\`@miurajsjs/miura-ai\`** — Progressive token streaming for the miura framework.

The \`#stream\` structural directive consumes a \`ReadableStream\`, SSE \`EventSource\`,
or \`WebSocket\` and progressively appends tokens to the bound element — no manual reader
loops, no scroll listeners, no re-renders.

\`\`\`typescript
import '@miurajsjs/miura-ai'; // registers #stream directive

template() {
  return html\`<div #stream=\${this.responseStream}></div>\`;
}
\`\`\`
                `,
            },
        },
    },
};

export default meta;
type Story = StoryObj;

export const RealDirective: Story = {
    name: '#stream — Live MiuraElement directive',
    render: () => buildRealDirectiveDemo(),
    parameters: {
        docs: {
            description: {
                story: 'A real `MiuraElement` component using `#stream=${this.stream}` as a binding. ' +
                    'Assigning a `ReadableStream` to `this.stream` triggers the directive, which progressively ' +
                    'appends each character token. `data-stream="active"` while streaming, `data-stream="done"` when complete.',
            },
        },
    },
};

export const StreamDirectiveDemo: Story = {
    name: '#stream — ReadableStream / SSE / Chat (simulated)',
    render: () => buildDemo(),
    parameters: {
        docs: {
            description: {
                story: 'Three UX scenarios (ReadableStream, SSE feed, multi-turn chat) built with manual ' +
                    'ReadableStreamDefaultReader loops — shows the streaming UX patterns that the #stream directive now handles automatically.',
            },
        },
    },
};
