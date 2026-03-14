type Constructor<T = HTMLElement> = new (...args: any[]) => T & { connectedCallback?(): void; disconnectedCallback?(): void; };

/**
 * FormAssociatedMixin adds form association and validation helpers to custom elements.
 * Usage:
 *   class MyInput extends FormAssociatedMixin(MuiBase) { ... }
 */
export function FormAssociatedMixin<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    _internals: ElementInternals | null = null;
    formAssociated = false;

    connectedCallback() {
      super.connectedCallback?.();
      this.attachInternalsIfNeeded();
    }

    attachInternalsIfNeeded() {
      if ('attachInternals' in this && !this._internals) {
        // @ts-ignore
        this._internals = this.attachInternals();
        this.formAssociated = true;
      }
    }

    setCustomValidity(message: string) {
      this._internals?.setValidity({ customError: !!message }, message, this);
    }

    reportValidity(): boolean {
      return this._internals?.reportValidity() ?? true;
    }

    // Value sync stub: override in your component
    get value(): any {
      return (this as any)._value;
    }
    set value(val: any) {
      (this as any)._value = val;
      if (this._internals) {
        this._internals.setFormValue(val);
      }
    }
  };
} 