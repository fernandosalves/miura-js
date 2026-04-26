export interface DisclosureController {
  readonly open: boolean;
  toggle(): boolean;
  show(): boolean;
  hide(): boolean;
  subscribe(listener: (open: boolean) => void): () => void;
}

export function createDisclosure(initialOpen = false): DisclosureController {
  let open = initialOpen;
  const listeners = new Set<(open: boolean) => void>();

  function setOpen(next: boolean): boolean {
    if (open === next) return open;
    open = next;
    listeners.forEach((listener) => listener(open));
    return open;
  }

  return {
    get open() {
      return open;
    },
    toggle() {
      return setOpen(!open);
    },
    show() {
      return setOpen(true);
    },
    hide() {
      return setOpen(false);
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
