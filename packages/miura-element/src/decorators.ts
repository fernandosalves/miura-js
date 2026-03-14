import { MiuraElement } from "./miura-element";

export interface ComponentOptions {
  tag?: string;
}

export function component<T extends typeof MiuraElement>(options: ComponentOptions) {
  return function(target: T): T {
    // Register the element
    if (options.tag) {
      customElements.define(options.tag, target);
    }
    return target;
  };
} 