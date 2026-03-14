import { DataProvider, ProviderFactory } from './provider';

const providerFactories = new Map<string, ProviderFactory>();

export const registerProvider = (name: string, factory: ProviderFactory) => {
  if (providerFactories.has(name)) {
    console.warn(`Provider with name "${name}" is already registered.`);
  }
  providerFactories.set(name, factory);
};

export const createProvider = <T>(
  name: string,
  options: any
): DataProvider<T> | undefined => {
  const factory = providerFactories.get(name);
  if (!factory) {
    throw new Error(`No provider registered with name "${name}"`);
  }
  return factory.create<T>(options);
}; 