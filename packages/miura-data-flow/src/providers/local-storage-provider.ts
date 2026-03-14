import { DataProvider, ProviderFactory } from './provider';

class LocalStorageProvider<T> implements DataProvider<T> {
  private prefix: string;

  constructor(options: { prefix: string }) {
    this.prefix = options.prefix || 'miura';
  }

  private getKey(id: string): string {
    return `${this.prefix}:${id}`;
  }

  async get(id: string): Promise<T> {
    const item = localStorage.getItem(this.getKey(id));
    if (item === null) {
      throw new Error(`Item with id "${id}" not found in localStorage.`);
    }
    return JSON.parse(item);
  }

  async put(id: string, data: T): Promise<T> {
    localStorage.setItem(this.getKey(id), JSON.stringify(data));
    return data;
  }

  async delete(id: string): Promise<void> {
    localStorage.removeItem(this.getKey(id));
  }
}

export class LocalStorageProviderFactory implements ProviderFactory {
  create<T>(options: { prefix: string }): DataProvider<T> {
    return new LocalStorageProvider<T>(options);
  }
} 