# `@miurajs/miura-ai`

Progressive streaming text rendering for the miura framework. First-class support for LLM token streams, SSE feeds, WebSocket messages, and browser `ReadableStream` — without any custom scroll logic or manual DOM updates.

## Features

- **`#stream` directive** — structural directive that consumes a `ReadableStream`, `EventSource`, `WebSocket`, or any `AsyncIterable<string>` and progressively appends tokens to the DOM
- **Blinking cursor** — optional typing cursor via `data-stream-cursor` attribute
- **Append mode** — `data-stream-append` preserves existing content across stream calls
- **Status attributes** — `data-stream="active|done|error"` on the host element for CSS-driven styling
- **Abort on re-assign** — assigning a new stream source cancels the previous one automatically

## Quick Start

```typescript
import '@miurajs/miura-ai'; // registers the #stream directive globally

@component({ tag: 'chat-message' })
class ChatMessage extends MiuraElement {
  declare stream: ReadableStream | null;
  static properties = { stream: { type: Object, default: null } };

  template() {
    return html`
      <div class="message" #stream=${this.stream}></div>
    `;
  }
}
```

Then from your app logic:

```typescript
// fetch + ReadableStream (OpenAI-style)
const response = await fetch('/api/chat', { method: 'POST', body: JSON.stringify(prompt) });
chatEl.stream = response.body!.pipeThrough(new TextDecoderStream());

// Server-Sent Events
chatEl.stream = new EventSource('/api/events');

// WebSocket
chatEl.stream = new WebSocket('wss://api.example.com/stream');
```

## Directive Attributes

| Attribute | Effect |
|---|---|
| `data-stream-cursor` | Show a blinking cursor while streaming |
| `data-stream-append` | Append to existing content instead of clearing on each new stream |

## Status Attributes (set by the directive)

| `data-stream` value | Meaning |
|---|---|
| `"active"` | Stream is open and receiving chunks |
| `"done"` | Stream closed normally |
| `"error"` | Stream threw or connection dropped |

```css
/* Style streaming state in CSS */
.message[data-stream="active"] { opacity: 0.8; }
.message[data-stream="done"]   { border-color: green; }
.message[data-stream="error"]  { color: red; }
```

## Accepted Stream Sources

| Type | Notes |
|---|---|
| `ReadableStream<string \| Uint8Array>` | `fetch().body`, OPFS, custom streams |
| `AsyncIterable<string>` | Async generators, custom adapters |
| `EventSource` | Server-Sent Events — each `message` event appended |
| `WebSocket` | Text and binary (UTF-8 decoded) frames |
| `null` / `undefined` | No-op — clears `data-stream` attribute |

## Manual Registration

```typescript
import { StreamDirective } from '@miurajs/miura-ai';
import { DirectiveManager } from '@miurajs/miura-render';

DirectiveManager.register('stream', StreamDirective);
```

## License

MIT
