# miura Mocks

`@miurajs/miura-mocks` provides a stateful mock server and sandbox for development and testing. It allows you to define complex API behaviors and state transitions without a real backend.

## Features

- **Stateful Mocking**: Maintain state across requests for realistic user flows.
- **Scenario Support**: Define different data scenarios (e.g., "Empty State", "Error State", "Success").
- **H3-based Server**: High-performance server powered by the [H3](https://github.com/unjs/h3) web framework.
- **File Watching**: Automatically reloads mock definitions when files change.
- **Persistence**: Supports persisting mock state across server restarts.

## Usage

```typescript
import { startMockServer } from '@miurajs/miura-mocks';

await startMockServer({
  port: 4000,
  fixtures: './mocks/fixtures',
  persistence: true
});
```

The mock server can be integrated into your development workflow via the Vite plugin provided in the package.
