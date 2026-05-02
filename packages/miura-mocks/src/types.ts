export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export interface MockContext {
  params: Record<string, string>;
  query: Record<string, any>;
  body: any;
  headers: Record<string, string>;
  db: MockDatabase;
  request: Request;
}

export interface MockResponse {
  status?: number;
  headers?: Record<string, string>;
  body?: any;
  delay?: number;
}

export type MockHandler = (ctx: MockContext) => MockResponse | Promise<MockResponse> | any;

export interface MockEndpoint {
  path: string;
  method?: HttpMethod | HttpMethod[];
  handler: MockHandler;
  description?: string;
  group?: string;
  file?: string;
}

export interface MockDatabase {
  get<T = any>(path: string): T | undefined;
  set(path: string, value: any): void;
  update(path: string, updater: (val: any) => any): void;
  push(path: string, value: any): void;
  delete(path: string): void;
  reset(): Promise<void>;
  save(): Promise<void>;
  load(): Promise<void>;
}

export interface MockConfig {
  dir: string;
  port: number;
  root: string;
  dbFile: string;
  watch?: boolean;
}

export interface MiuraMocksConfig {
  dir?: string; // Directory where mocks are defined
  port?: number;
  dbFile?: string; // Local JSON file for persistence
  watch?: boolean;
}

export interface MockHealth {
  status: 'ok';
  engine: 'miura-mocks';
  root: string;
  dir: string;
  dbFile: string;
  endpoints: number;
}
