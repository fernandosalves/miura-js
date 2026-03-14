import type { Meta, StoryObj } from '@storybook/web-components';
import { WorkerBridge } from '@miura/miura-computing';

// ── Inline worker via Blob URL ─────────────────────────────────────────────────
// This avoids needing a separate worker file in Storybook.

const WORKER_SRC = `
const handlers = {};

function expose(h) {
  Object.assign(handlers, h);
  self.addEventListener('message', async (e) => {
    const msg = e.data;
    if (!msg?.__miura) return;
    const { id, method, payload } = msg;
    const handler = handlers[method];
    if (!handler) {
      self.postMessage({ __miura:true, id, type:'error', message:'No handler: '+method });
      return;
    }
    try {
      const result = handler(payload);
      if (result != null && typeof result === 'object' && (Symbol.asyncIterator in result || Symbol.iterator in result)) {
        for await (const chunk of result) {
          self.postMessage({ __miura:true, id, type:'chunk', chunk, done:false });
        }
        self.postMessage({ __miura:true, id, type:'chunk', chunk:undefined, done:true });
      } else {
        const value = await result;
        self.postMessage({ __miura:true, id, type:'result', result:value });
      }
    } catch(err) {
      self.postMessage({ __miura:true, id, type:'error', message:err.message, stack:err.stack });
    }
  });
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

expose({
  add: ({ a, b }) => a + b,

  fibonacci: ({ n }) => {
    let a = 0, b = 1;
    for (let i = 0; i < n; i++) { [a, b] = [b, a + b]; }
    return a;
  },

  sortBenchmark: ({ size }) => {
    const arr = Array.from({ length: size }, () => Math.random());
    const t0 = performance.now();
    arr.sort((a, b) => a - b);
    return { size, ms: +(performance.now() - t0).toFixed(2) };
  },

  async *tokenise({ text, delay: ms = 80 }) {
    const words = text.split(' ');
    for (const word of words) {
      await delay(ms);
      yield word + ' ';
    }
  },

  failingTask: () => {
    throw new Error('Simulated worker error');
  },
});
`;

function makeWorker(): Worker {
    const blob = new Blob([WORKER_SRC], { type: 'application/javascript' });
    return new Worker(URL.createObjectURL(blob));
}

// ── Shared styles ──────────────────────────────────────────────────────────────

const STYLES = `
* { box-sizing: border-box; }
body, :host { font-family: system-ui, sans-serif; }
.demo {
    max-width: 720px; padding: 1.5rem;
    display: flex; flex-direction: column; gap: 1.25rem;
}
.card {
    border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;
    background: white;
}
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
.badge-blue   { background: #3b82f6; }
.badge-purple { background: #8b5cf6; }
.badge-red    { background: #ef4444; }
.badge-green  { background: #22c55e; color: #0f172a; }
.card-body { padding: 1rem; }
.row { display: flex; gap: .5rem; align-items: center; flex-wrap: wrap; margin-bottom: .75rem; }
label { font-size: .85rem; color: #475569; font-weight: 500; }
input[type=number], input[type=text] {
    border: 1px solid #cbd5e1; border-radius: 6px;
    padding: .35rem .65rem; font-size: .85rem; width: 90px;
}
input[type=text] { width: 280px; }
button {
    background: #4f46e5; color: white; border: none; border-radius: 6px;
    padding: .4rem .9rem; font-size: .85rem; cursor: pointer; font-weight: 500;
}
button:hover { background: #4338ca; }
button:disabled { opacity: .5; cursor: not-allowed; }
button.danger { background: #ef4444; }
button.danger:hover { background: #dc2626; }
.result {
    font-family: monospace; font-size: .85rem; background: #f8fafc;
    border: 1px solid #e2e8f0; border-radius: 6px; padding: .6rem .75rem;
    color: #1e293b; min-height: 2rem;
}
.result.streaming { white-space: pre-wrap; min-height: 3rem; }
.result.error { background: #fef2f2; border-color: #fecaca; color: #b91c1c; }
.result.ok    { border-color: #bbf7d0; background: #f0fdf4; }
.status-row { display: flex; align-items: center; gap: .5rem; margin-top: .5rem; }
.status-dot {
    width: 8px; height: 8px; border-radius: 50%; background: #94a3b8;
    transition: background .2s;
}
.status-dot.idle       { background: #22c55e; }
.status-dot.busy       { background: #f59e0b; }
.status-dot.error      { background: #ef4444; }
.status-dot.terminated { background: #6b7280; }
.status-label { font-size: .8rem; color: #64748b; }
`;

// ── Story builder ──────────────────────────────────────────────────────────────

function buildDemo(): HTMLElement {
    const wrap = document.createElement('div');
    const style = document.createElement('style');
    style.textContent = STYLES;
    wrap.appendChild(style);

    const demo = document.createElement('div');
    demo.className = 'demo';
    wrap.appendChild(demo);

    const bridge = new WorkerBridge(makeWorker());

    // ── Status indicator ──────────────────────────────────────────────────────
    const statusRow = document.createElement('div');
    statusRow.className = 'status-row';
    statusRow.innerHTML = `<div class="status-dot idle" id="dot"></div><span class="status-label" id="status-label">idle</span>`;
    demo.appendChild(statusRow);

    bridge.status.subscribe(s => {
        const dot = statusRow.querySelector<HTMLElement>('#dot')!;
        const label = statusRow.querySelector<HTMLElement>('#status-label')!;
        dot.className = `status-dot ${s}`;
        label.textContent = s;
    });

    // ── Card: call() — single result ──────────────────────────────────────────
    const card1 = document.createElement('div');
    card1.className = 'card';
    card1.innerHTML = `
        <div class="card-header">
            <h3>call() — single result</h3>
            <span class="badge badge-blue">add / fibonacci / sort</span>
        </div>
        <div class="card-body">
            <div class="row">
                <label>add(</label>
                <input type="number" id="a" value="6" style="width:60px">
                <label>+</label>
                <input type="number" id="b" value="7" style="width:60px">
                <label>)</label>
                <button id="btn-add">Run add()</button>
            </div>
            <div class="row">
                <label>fibonacci(n=</label>
                <input type="number" id="fib-n" value="30" style="width:70px">
                <label>)</label>
                <button id="btn-fib">Run fibonacci()</button>
            </div>
            <div class="row">
                <label>sortBenchmark(size=</label>
                <input type="number" id="sort-n" value="100000" style="width:90px">
                <label>)</label>
                <button id="btn-sort">Run sortBenchmark()</button>
            </div>
            <div class="result" id="call-result">result will appear here…</div>
        </div>
    `;
    demo.appendChild(card1);

    const callResult = card1.querySelector<HTMLElement>('#call-result')!;

    function showResult(el: HTMLElement, text: string, ok = true) {
        el.textContent = text;
        el.className = `result ${ok ? 'ok' : 'error'}`;
    }

    card1.querySelector('#btn-add')!.addEventListener('click', async () => {
        const a = +(card1.querySelector<HTMLInputElement>('#a')!.value);
        const b = +(card1.querySelector<HTMLInputElement>('#b')!.value);
        try {
            const result = await bridge.call<number>('add', { a, b });
            showResult(callResult, `add(${a}, ${b}) = ${result}`);
        } catch (e: any) { showResult(callResult, e.message, false); }
    });

    card1.querySelector('#btn-fib')!.addEventListener('click', async () => {
        const n = +(card1.querySelector<HTMLInputElement>('#fib-n')!.value);
        try {
            const result = await bridge.call<number>('fibonacci', { n });
            showResult(callResult, `fibonacci(${n}) = ${result}`);
        } catch (e: any) { showResult(callResult, e.message, false); }
    });

    card1.querySelector('#btn-sort')!.addEventListener('click', async () => {
        const size = +(card1.querySelector<HTMLInputElement>('#sort-n')!.value);
        callResult.textContent = 'sorting off-thread…';
        callResult.className = 'result';
        try {
            const r = await bridge.call<{ size: number; ms: number }>('sortBenchmark', { size });
            showResult(callResult, `sorted ${r.size.toLocaleString()} items in ${r.ms} ms (off-thread)`);
        } catch (e: any) { showResult(callResult, e.message, false); }
    });

    // ── Card: stream() — async generator ─────────────────────────────────────
    const card2 = document.createElement('div');
    card2.className = 'card';
    card2.innerHTML = `
        <div class="card-header">
            <h3>stream() — async generator</h3>
            <span class="badge badge-purple">tokenise</span>
        </div>
        <div class="card-body">
            <div class="row">
                <input type="text" id="stream-text" value="miura framework is fast and lightweight">
                <label>delay</label>
                <input type="number" id="stream-delay" value="80" style="width:65px">
                <label>ms</label>
                <button id="btn-stream">Stream tokens</button>
                <button id="btn-stop" disabled>Stop</button>
            </div>
            <div class="result streaming" id="stream-result">tokens will stream here…</div>
        </div>
    `;
    demo.appendChild(card2);

    const streamResult = card2.querySelector<HTMLElement>('#stream-result')!;
    const btnStream = card2.querySelector<HTMLButtonElement>('#btn-stream')!;
    const btnStop = card2.querySelector<HTMLButtonElement>('#btn-stop')!;
    let stopStream = false;

    btnStream.addEventListener('click', async () => {
        stopStream = false;
        streamResult.textContent = '';
        streamResult.className = 'result streaming';
        btnStream.disabled = true;
        btnStop.disabled = false;

        const text = (card2.querySelector<HTMLInputElement>('#stream-text')!).value;
        const delay = +(card2.querySelector<HTMLInputElement>('#stream-delay')!).value;

        try {
            for await (const chunk of bridge.stream<string>('tokenise', { text, delay })) {
                if (stopStream) break;
                streamResult.textContent += chunk;
            }
            streamResult.className = 'result streaming ok';
        } catch (e: any) {
            streamResult.textContent = e.message;
            streamResult.className = 'result streaming error';
        } finally {
            btnStream.disabled = false;
            btnStop.disabled = true;
        }
    });

    btnStop.addEventListener('click', () => { stopStream = true; });

    // ── Card: error handling ──────────────────────────────────────────────────
    const card3 = document.createElement('div');
    card3.className = 'card';
    card3.innerHTML = `
        <div class="card-header">
            <h3>Error handling</h3>
            <span class="badge badge-red">failures</span>
        </div>
        <div class="card-body">
            <div class="row">
                <button id="btn-fail">Trigger worker error</button>
                <button id="btn-unknown">Unknown method</button>
            </div>
            <div class="result" id="err-result">error will appear here…</div>
        </div>
    `;
    demo.appendChild(card3);

    const errResult = card3.querySelector<HTMLElement>('#err-result')!;

    card3.querySelector('#btn-fail')!.addEventListener('click', async () => {
        try {
            await bridge.call('failingTask');
        } catch (e: any) {
            showResult(errResult, `Caught: ${e.message}`, false);
        }
    });

    card3.querySelector('#btn-unknown')!.addEventListener('click', async () => {
        try {
            await bridge.call('doesNotExist');
        } catch (e: any) {
            showResult(errResult, `Caught: ${e.message}`, false);
        }
    });

    return wrap;
}

// ── Meta ───────────────────────────────────────────────────────────────────────

const meta: Meta = {
    title: 'miura-computing/WorkerBridge',
    parameters: {
        docs: {
            description: {
                component: `
**\`@miura/miura-computing\`** — Reactive Web Worker bridge.

Move CPU-heavy work off the main thread with a typed \`call()\` / \`stream()\` protocol.
The worker is created from an inline Blob URL here; in real apps point to a compiled worker file.
                `,
            },
        },
    },
};

export default meta;
type Story = StoryObj;

export const WorkerBridgeDemo: Story = {
    name: 'WorkerBridge — call / stream / errors',
    render: () => buildDemo(),
    parameters: {
        docs: {
            description: {
                story: `
Demonstrates all three \`WorkerBridge\` capabilities:
- **\`call()\`** — single off-thread result (add, fibonacci, sort benchmark)
- **\`stream()\`** — async generator token streaming with stop support
- **Error handling** — worker errors and unknown-method rejections

The status indicator (dot) reflects the reactive \`bridge.status\` signal.
                `,
            },
        },
    },
};
