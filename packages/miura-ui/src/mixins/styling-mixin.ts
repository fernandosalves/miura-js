type Constructor<T = HTMLElement> = new (...args: any[]) => T;

export function StylingMixin<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    applyStyling({ class: className, style, tokens }: {
      class?: string;
      style?: Record<string, string | number>;
      tokens?: Record<string, string>;
    }) {
      if (className) (this as HTMLElement).classList.add(...className.split(' '));
      if (style) Object.entries(style).forEach(([k, v]) => ((this as HTMLElement).style as any)[k] = v);
      if (tokens) Object.entries(tokens).forEach(([k, v]) => (this as HTMLElement).style.setProperty(k, v));
    }
  };
} 