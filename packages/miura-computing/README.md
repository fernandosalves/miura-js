# `@miura/miura-computing`

Reactive Web Worker bridge for the miura framework. Move CPU-heavy work off the main thread without boilerplate — typed `call()` / `stream()` protocol, reactive status signal, zero-copy `Transferable` support.

## Features

- **`WorkerBridge`** — main-thread client: `call()` for single results, `stream()` async-generator for chunked results
- **`expose()`** — worker-side handler registration; handles the message protocol automatically
- **Reactive status** — `bridge.status.subscribe()` for `'idle' | 'busy' | 'error' | 'terminated'` state
- **Timeout support** — per-bridge configurable task timeout with automatic rejection
- **Zero-copy transfers** — pass `Transferable[]` (e.g. `ArrayBuffer`) to avoid serialisation overhead
- **Typed protocol** — generics on `call<TResult>()` and `stream<TChunk>()` for full TypeScript safety

## Installation

```bash
pnpm add @miura/miura-computing
```

## Usage

### Worker side — `expose()`

```typescript
// worker.ts
import { expose } from '@miura/miura-computing';

expose({
  // Single-result handler
  add(payload: { a: number; b: number }) {
    return payload.a + payload.b;
  },

  // Streaming handler — yield chunks via an async generator
  async *tokenise(payload: { text: string }) {
    for (const word of payload.text.split(' ')) {
      yield word;
      await new Promise(r => setTimeout(r, 10)); // simulate delay
    }
  },
});
```

### Main thread — `WorkerBridge`

```typescript
import { WorkerBridge } from '@miura/miura-computing';

const bridge = new WorkerBridge(
  new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' }),
  { timeout: 5000 } // optional: reject tasks that take > 5 s
);

// Single result
const sum = await bridge.call<number>('add', { a: 3, b: 4 }); // → 7

// Streaming result — async generator
for await (const token of bridge.stream<string>('tokenise', { text: 'hello world' })) {
  console.log(token); // 'hello', then 'world'
}

// Reactive status
const unsub = bridge.status.subscribe(s => console.log('worker:', s));
// s: 'idle' | 'busy' | 'error' | 'terminated'
unsub(); // unsubscribe

// Terminate
bridge.terminate();
```

### Zero-copy transfers

Pass a `Transferable[]` third argument to avoid serialising large buffers:

```typescript
const buffer = new ArrayBuffer(1024 * 1024); // 1 MB
await bridge.call('processBuffer', buffer, [buffer]); // zero-copy
```

## API

### `WorkerBridge`

| Method / Property | Description |
|---|---|
| `new WorkerBridge(worker, opts?)` | Create bridge. `opts.timeout` (ms, default 0 = no timeout), `opts.onError` callback |
| `call<T>(method, payload?, transfer?)` | Send task, await single `T` result |
| `stream<T>(method, payload?, transfer?)` | Send task, receive chunks as `AsyncGenerator<T>` |
| `status.peek()` | Current `WorkerStatus` (synchronous) |
| `status.subscribe(fn)` | Subscribe to status changes, returns unsubscribe function |
| `terminate()` | Terminate the worker and reject all pending tasks |

### `expose(handlers)`

Worker-side registration. `handlers` is a plain object mapping method names to functions. Handlers may be:
- Synchronous: `(payload) => result`
- Async (single result): `async (payload) => result`
- Async generator (streaming): `async function*(payload) { yield chunk; ... }`

```typescript
import { expose } from '@miura/miura-computing';

expose({
  heavyCalc: (n: number) => n ** 2,
  async fetchData(url: string) {
    const r = await fetch(url);
    return r.json();
  },
});
```

## Pending

- `@workerFn()` decorator — annotate a class method to automatically run in a worker
- Reactive result binding in templates — bind a worker result directly to a template expression

## License

MIT