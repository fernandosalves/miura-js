export type NanoStyle = CSSStyleSheet | string;

export abstract class MiuraNanoElement extends HTMLElement {
  protected readonly root: ShadowRoot;
  private cleanup?: () => void;

  constructor() {
    super();
    this.root = this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    this.renderNow();
    const mountedCleanup = this.mounted();
    if (typeof mountedCleanup === 'function') {
      this.cleanup = mountedCleanup;
    }
  }

  disconnectedCallback(): void {
    this.cleanup?.();
    this.cleanup = undefined;
  }

  attributeChangedCallback(name: string, oldValue: string | null, value: string | null): void {
    if (oldValue === value) return;
    this.updated(name, oldValue, value);
    this.renderNow();
  }

  protected mounted(): void | (() => void) {}

  protected updated(_name: string, _oldValue: string | null, _value: string | null): void {}

  protected abstract render(): Node | string | void;

  protected emit<T>(type: string, detail?: T, options: EventInit = {}): boolean {
    return this.dispatchEvent(new CustomEvent(type, {
      detail,
      bubbles: options.bubbles ?? true,
      composed: options.composed ?? true,
      cancelable: options.cancelable ?? false,
    }));
  }

  protected renderNow(): void {
    const output = this.render();
    if (output === undefined) return;

    this.root.replaceChildren();
    this.applyStyles();

    if (typeof output === 'string') {
      const template = document.createElement('template');
      template.innerHTML = output;
      this.root.append(template.content.cloneNode(true));
      return;
    }

    this.root.append(output);
  }

  private applyStyles(): void {
    const styles = (this.constructor as typeof MiuraNanoElement).styles;
    if (!styles) return;

    const list = Array.isArray(styles) ? styles : [styles];
    const sheets: CSSStyleSheet[] = [];
    const text: string[] = [];

    for (const style of list) {
      if (typeof style === 'string') {
        text.push(style);
      } else {
        sheets.push(style);
      }
    }

    if (sheets.length > 0 && 'adoptedStyleSheets' in Document.prototype) {
      this.root.adoptedStyleSheets = sheets;
    }

    if (text.length > 0) {
      const style = document.createElement('style');
      style.textContent = text.join('\n');
      this.root.append(style);
    }
  }

  static styles?: NanoStyle | NanoStyle[];
}

export function defineNanoElement(tagName: string, ctor: CustomElementConstructor): void {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, ctor);
  }
}
