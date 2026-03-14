export interface DataProvider<T> {
  // Queries data, for sources like GraphQL/REST
  query?(options: any): Promise<T[]>;

  // Mutates data, for sources like GraphQL/REST
  mutate?(options: any): Promise<T>;

  // Retrieves an object, for sources like S3
  get?(id: string, options?: any): Promise<T>;

  // Puts an object, for sources like S3
  put?(id: string, data: T, options?: any): Promise<T>;

  // Deletes an object
  delete?(id: string, options?: any): Promise<void>;

  // Subscribes to real-time updates if supported
  subscribe?(options: any, callback: (data: T) => void): () => void;
}

export interface ProviderFactory {
  create<T>(options: any): DataProvider<T>;
} 