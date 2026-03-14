import { MiuraElement } from '@miura/miura-element';
import { ComponentDefinition, ComponentRegistry as IComponentRegistry } from './types.js';

/**
 * Component Registry - Manages all registered components
 */
export class ComponentRegistry implements IComponentRegistry {
  private components = new Map<string, ComponentDefinition>();

  register(definition: ComponentDefinition): void {
    if (this.components.has(definition.name)) {
      console.warn(`Component ${definition.name} is already registered. Overwriting...`);
    }
    
    this.components.set(definition.name, definition);
    
    // Register the custom element if not already registered
    if (!customElements.get(definition.name)) {
      customElements.define(definition.name, definition.element);
    }
  }

  get(name: string): typeof MiuraElement | undefined {
    const definition = this.components.get(name);
    return definition?.element;
  }

  getAll(): ComponentDefinition[] {
    return Array.from(this.components.values());
  }

  unregister(name: string): void {
    this.components.delete(name);
  }

  has(name: string): boolean {
    return this.components.has(name);
  }

  getNames(): string[] {
    return Array.from(this.components.keys());
  }

  getByTag(tag: string): ComponentDefinition | undefined {
    return this.components.get(tag);
  }
} 