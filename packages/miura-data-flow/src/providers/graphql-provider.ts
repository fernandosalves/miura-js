import { DataProvider, ProviderFactory } from './provider';
import { request } from 'graphql-request'; // Example dependency

export interface GraphQLProviderOptions {
  endpoint: string;
  headers?: Record<string, string>;
}

class GraphQLProvider<T> implements DataProvider<T> {
  private options: GraphQLProviderOptions;

  constructor(options: GraphQLProviderOptions) {
    this.options = options;
  }

  async query(options: { query: string; variables?: any }): Promise<any> {
    return request(
      this.options.endpoint,
      options.query,
      options.variables,
      this.options.headers
    );
  }

  async mutate(options: { mutation: string; variables?: any }): Promise<any> {
    return request(
      this.options.endpoint,
      options.mutation,
      options.variables,
      this.options.headers
    );
  }
}

export class GraphQLProviderFactory implements ProviderFactory {
  create<T>(options: GraphQLProviderOptions): DataProvider<T> {
    return new GraphQLProvider<T>(options);
  }
}
