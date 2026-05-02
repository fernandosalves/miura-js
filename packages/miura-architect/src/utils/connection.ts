export interface ReconnectConfig {
  baseDelayMs?: number;
  maxDelayMs?: number;
  maxAttempts?: number;
}

export function nextReconnectDelay(attempt: number, config: ReconnectConfig = {}): number {
  const baseDelayMs = config.baseDelayMs ?? 1000;
  const maxDelayMs = config.maxDelayMs ?? 5000;
  const maxAttempts = config.maxAttempts ?? 8;
  const normalizedAttempt = Math.min(Math.max(1, attempt), maxAttempts);
  return Math.min(maxDelayMs, baseDelayMs * 2 ** (normalizedAttempt - 1));
}
