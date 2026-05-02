export function sanitizeForTransport(input: unknown, depth = 0): unknown {
  if (depth > 4) {
    return '[max-depth]';
  }

  if (input === null || input === undefined) {
    return input;
  }

  const valueType = typeof input;
  if (valueType === 'number' || valueType === 'string' || valueType === 'boolean') {
    return input;
  }

  if (valueType === 'function') {
    return '[function]';
  }

  if (input instanceof Date) {
    return input.toISOString();
  }

  if (Array.isArray(input)) {
    return input.slice(0, 50).map((entry) => sanitizeForTransport(entry, depth + 1));
  }

  if (valueType === 'object') {
    const record = input as Record<string, unknown>;
    const output: Record<string, unknown> = {};
    for (const key of Object.keys(record).slice(0, 60)) {
      const current = record[key];
      if (current instanceof Element) {
        output[key] = `[element:${current.tagName.toLowerCase()}]`;
      } else {
        output[key] = sanitizeForTransport(current, depth + 1);
      }
    }
    return output;
  }

  return String(input);
}
