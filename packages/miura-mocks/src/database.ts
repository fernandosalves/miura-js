import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { mkdirSync } from 'node:fs';
import type { MockDatabase } from './types.js';

export class InMemoryDatabase implements MockDatabase {
  private data: Record<string, any> = {};
  private filePath: string;

  constructor(filePath: string = '.miura/mock-db.json') {
    this.filePath = filePath;
  }

  get<T = any>(path: string): T | undefined {
    if (!path || path === '') return this.data as T;
    const parts = path.split('.').filter(Boolean);
    let current = this.data;
    for (const part of parts) {
      if (current === undefined || current === null) return undefined;
      current = current[part];
    }
    return current as T;
  }

  set(path: string, value: any): void {
    if (!path || path === '') {
      this.data = value;
      return;
    }
    const parts = path.split('.').filter(Boolean);
    const last = parts.pop()!;
    let current = this.data;
    for (const part of parts) {
      if (!current[part] || typeof current[part] !== 'object') current[part] = {};
      current = current[part];
    }
    current[last] = value;
  }

  update(path: string, updater: (val: any) => any): void {
    const val = this.get(path);
    this.set(path, updater(val));
  }

  push(path: string, value: any): void {
    const list = this.get(path) || [];
    if (Array.isArray(list)) {
      list.push(value);
      this.set(path, list);
    }
  }

  delete(path: string): void {
    const parts = path.split('.');
    const last = parts.pop()!;
    let current = this.data;
    for (const part of parts) {
      if (!current[part]) return;
      current = current[part];
    }
    delete current[last];
  }

  async reset(): Promise<void> {
    this.data = {};
    await this.save();
  }

  async save(): Promise<void> {
    const dir = dirname(this.filePath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
  }

  async load(): Promise<void> {
    if (existsSync(this.filePath)) {
      try {
        this.data = JSON.parse(readFileSync(this.filePath, 'utf-8'));
      } catch (e) {
        console.error('Failed to load mock database:', e);
        this.data = {};
      }
    }
  }
}
