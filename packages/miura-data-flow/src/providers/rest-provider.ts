import { DataProvider, ProviderFactory } from './provider';

// ── Error type ────────────────────────────────────────────────────────────────

export class RestError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body: unknown,
    public readonly url: string,
  ) {
    super(`[${status}] ${statusText} — ${url}`);
    this.name = 'RestError';
  }
}

// ── Interceptors ──────────────────────────────────────────────────────────────

export type RequestInterceptor = (
  url: string,
  init: RequestInit,
) => RequestInit | Promise<RequestInit>;

export type ResponseInterceptor = (
  response: Response,
  url: string,
) => Response | Promise<Response>;

// ── Pagination ────────────────────────────────────────────────────────────────

export interface PaginationConfig {
  /** Strategy for adding pagination params to the request */
  strategy: 'query' | 'header' | 'cursor';
  /** Query param name for page number (query strategy) */
  pageParam?: string;
  /** Query param name for page size (query strategy) */
  pageSizeParam?: string;
  /** Default page size */
  pageSize?: number;
  /** Extract total count from response (used to determine if more pages exist) */
  totalExtractor?: (response: Response, body: unknown) => number;
  /** Extract next cursor from response body (cursor strategy) */
  cursorExtractor?: (body: unknown) => string | null;
}

export interface PageResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  nextCursor?: string | null;
}

// ── Cache ─────────────────────────────────────────────────────────────────────

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

// ── Provider options ──────────────────────────────────────────────────────────

export interface RetryConfig {
  /** Maximum number of retry attempts (default: 3) */
  maxAttempts: number;
  /** Initial delay in ms before first retry (default: 300) */
  initialDelay: number;
  /** Multiplier applied to delay on each subsequent attempt (default: 2) */
  backoffFactor: number;
  /** HTTP status codes that should trigger a retry (default: [429, 500, 502, 503, 504]) */
  retryOn: number[];
}

export interface RestProviderOptions {
  /** Base URL — path segments are appended to this */
  baseUrl: string;
  /** Default headers merged into every request */
  headers?: Record<string, string>;
  /** Request timeout in ms (default: 30_000) */
  timeout?: number;
  /** Retry configuration */
  retry?: Partial<RetryConfig>;
  /** Response cache TTL in ms — set to 0 to disable (default: 0) */
  cacheTtl?: number;
  /** Pagination defaults */
  pagination?: PaginationConfig;
  /** Called before every request — use to inject auth headers, sign requests, etc. */
  requestInterceptors?: RequestInterceptor[];
  /** Called after every successful response — use to unwrap envelopes, normalise shapes, etc. */
  responseInterceptors?: ResponseInterceptor[];
}

// ── Query/mutation option shapes ──────────────────────────────────────────────

export interface QueryOptions {
  endpoint: string;
  params?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export interface GetOptions {
  endpoint: string;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export interface MutateOptions<T> {
  endpoint: string;
  data: T;
  method?: 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export interface PaginatedQueryOptions extends QueryOptions {
  page?: number;
  cursor?: string;
}

// ── Implementation ────────────────────────────────────────────────────────────

class RestProvider<T> implements DataProvider<T> {
  private readonly retryConfig: RetryConfig;
  private readonly cache = new Map<string, CacheEntry<unknown>>();

  constructor(private readonly options: RestProviderOptions) {
    this.retryConfig = {
      maxAttempts: 3,
      initialDelay: 300,
      backoffFactor: 2,
      retryOn: [429, 500, 502, 503, 504],
      ...options.retry,
    };
  }

  // ── Public API ─────────────────────────────────────────────────

  async query(options: QueryOptions): Promise<T[]> {
    const url = this.buildUrl(options.endpoint, options.params);
    const cached = this.getCache<T[]>(url);
    if (cached) return cached;

    const response = await this.request(url, { method: 'GET', headers: this.mergeHeaders(options.headers) }, options.signal);
    const data: T[] = await response.json();
    this.setCache(url, data);
    return data;
  }

  async get(id: string, options: GetOptions): Promise<T> {
    const url = this.buildUrl(`${options.endpoint}/${id}`);
    const cached = this.getCache<T>(url);
    if (cached) return cached;

    const response = await this.request(url, { method: 'GET', headers: this.mergeHeaders(options.headers) }, options.signal);
    const data: T = await response.json();
    this.setCache(url, data);
    return data;
  }

  async mutate(options: MutateOptions<T>): Promise<T> {
    const url = this.buildUrl(options.endpoint);
    this.invalidateCachePrefix(options.endpoint);

    const response = await this.request(
      url,
      {
        method: options.method ?? 'POST',
        headers: this.mergeHeaders(options.headers),
        body: JSON.stringify(options.data),
      },
      options.signal,
    );
    return response.json();
  }

  async put(id: string, data: T, options: GetOptions): Promise<T> {
    return this.mutate({ endpoint: `${options.endpoint}/${id}`, data, method: 'PUT', headers: options.headers, signal: options.signal });
  }

  async delete(id: string, options: GetOptions): Promise<void> {
    const url = this.buildUrl(`${options.endpoint}/${id}`);
    this.invalidateCachePrefix(options.endpoint);
    await this.request(url, { method: 'DELETE', headers: this.mergeHeaders(options.headers) }, options.signal);
  }

  async queryPage(options: PaginatedQueryOptions): Promise<PageResult<T>> {
    const pagination = this.options.pagination;
    const params: Record<string, string | number | boolean> = { ...options.params };

    if (pagination?.strategy === 'query') {
      const pageParam = pagination.pageParam ?? 'page';
      const sizeParam = pagination.pageSizeParam ?? 'pageSize';
      params[pageParam] = options.page ?? 1;
      params[sizeParam] = pagination.pageSize ?? 20;
    } else if (pagination?.strategy === 'cursor' && options.cursor) {
      params['cursor'] = options.cursor;
    }

    const url = this.buildUrl(options.endpoint, params);
    const response = await this.request(url, { method: 'GET', headers: this.mergeHeaders(options.headers) }, options.signal);
    const body: T[] | { data: T[]; [k: string]: unknown } = await response.json();

    const data: T[] = Array.isArray(body) ? body : (body.data as T[]);
    const total = pagination?.totalExtractor?.(response, body) ?? data.length;
    const pageSize = (pagination?.pageSize ?? 20);
    const page = options.page ?? 1;
    const nextCursor = pagination?.cursorExtractor?.(body) ?? null;

    return {
      data,
      total,
      page,
      pageSize,
      hasMore: nextCursor != null || page * pageSize < total,
      nextCursor,
    };
  }

  // ── Core fetch with interceptors, retry, and timeout ───────────

  private async request(
    url: string,
    init: RequestInit,
    signal?: AbortSignal,
  ): Promise<Response> {
    let resolvedInit = await this.applyRequestInterceptors(url, init);

    const timeoutMs = this.options.timeout ?? 30_000;
    const attempt = async (attemptsLeft: number, delay: number): Promise<Response> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      // Merge caller signal with our timeout signal
      const combinedSignal = signal
        ? this.mergeSignals(signal, controller.signal)
        : controller.signal;

      try {
        const response = await fetch(url, { ...resolvedInit, signal: combinedSignal });
        clearTimeout(timeoutId);

        if (!response.ok && this.retryConfig.retryOn.includes(response.status) && attemptsLeft > 0) {
          await this.sleep(delay);
          return attempt(attemptsLeft - 1, delay * this.retryConfig.backoffFactor);
        }

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new RestError(response.status, response.statusText, body, url);
        }

        return this.applyResponseInterceptors(response, url);
      } catch (err) {
        clearTimeout(timeoutId);
        if (err instanceof RestError) throw err;
        // Network / abort error — retry if attempts remain
        if (attemptsLeft > 0 && !(signal?.aborted)) {
          await this.sleep(delay);
          return attempt(attemptsLeft - 1, delay * this.retryConfig.backoffFactor);
        }
        throw err;
      }
    };

    return attempt(this.retryConfig.maxAttempts - 1, this.retryConfig.initialDelay);
  }

  private async applyRequestInterceptors(url: string, init: RequestInit): Promise<RequestInit> {
    let result = init;
    for (const interceptor of this.options.requestInterceptors ?? []) {
      result = await interceptor(url, result);
    }
    return result;
  }

  private async applyResponseInterceptors(response: Response, url: string): Promise<Response> {
    let result = response;
    for (const interceptor of this.options.responseInterceptors ?? []) {
      result = await interceptor(result, url);
    }
    return result;
  }

  // ── Helpers ────────────────────────────────────────────────────

  private buildUrl(path: string, params?: Record<string, string | number | boolean>): string {
    const base = this.options.baseUrl.replace(/\/$/, '');
    const normalised = path.startsWith('/') ? path : `/${path}`;
    const url = `${base}${normalised}`;
    if (!params || Object.keys(params).length === 0) return url;
    const qs = new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)]),
    ).toString();
    return `${url}?${qs}`;
  }

  private mergeHeaders(extra?: Record<string, string>): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      ...this.options.headers,
      ...extra,
    };
  }

  private mergeSignals(a: AbortSignal, b: AbortSignal): AbortSignal {
    const controller = new AbortController();
    const abort = () => controller.abort();
    a.addEventListener('abort', abort, { once: true });
    b.addEventListener('abort', abort, { once: true });
    return controller.signal;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ── Cache helpers ──────────────────────────────────────────────

  private getCache<R>(key: string): R | null {
    if (!this.options.cacheTtl) return null;
    const entry = this.cache.get(key) as CacheEntry<R> | undefined;
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  private setCache(key: string, data: unknown): void {
    if (!this.options.cacheTtl) return;
    this.cache.set(key, { data, expiresAt: Date.now() + this.options.cacheTtl });
  }

  private invalidateCachePrefix(prefix: string): void {
    const normalised = this.buildUrl(prefix);
    for (const key of this.cache.keys()) {
      if (key.startsWith(normalised)) this.cache.delete(key);
    }
  }
}

// ── Factory ───────────────────────────────────────────────────────────────────

export class RestProviderFactory implements ProviderFactory {
  create<T>(options: RestProviderOptions): DataProvider<T> {
    return new RestProvider<T>(options);
  }
}