import { MiuraElement } from '@miurajs/miura-element';
import type { ComponentDefinition, ComponentRegistry as IComponentRegistry } from './types.js';

/**
 * Component Registry - Manages all registered components
 */
export class ComponentRegistry implements IComponentRegistry {
  private components = new Map<string, ComponentDefinition>();

  register(definition: ComponentDefinition): void {
    const existingDefinition = this.components.get(definition.name);
    const existingElement = customElements.get(definition.name);

    if (existingElement && existingElement !== definition.element) {
      throw new Error(
        `Component ${definition.name} is already defined in customElements with a different constructor.`,
      );
    }

    if (existingDefinition && existingDefinition.element !== definition.element) {
      throw new Error(
        `Component ${definition.name} is already registered with a different constructor.`,
      );
    }

    this.components.set(definition.name, definition);

    // Register the custom element if not already registered
    if (!existingElement) {
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
