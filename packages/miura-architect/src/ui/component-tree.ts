import { MiuraElement, css, html } from '@miurajs/miura-element';
import type { ComponentInfo } from '../types.js';
import type { ContentTreeItem } from '@miurajs/miura-ui/workspace';

export class MiuraArchitectComponentTree extends MiuraElement {
  static properties = {
    components: { type: Array, default: () => [] },
    selectedId: { type: String, default: '' },
  };

  declare components: ComponentInfo[];
  declare selectedId: string;

  static styles = css`
    :host { display: block; padding: var(--mui-space-3); }
  `;

  private buildItems(parentId: string | null = null): ContentTreeItem[] {
    return this.components
      .filter((component) => component.parentId === parentId)
      .map((component) => ({
        id: component.id,
        label: component.tag,
        icon: 'file',
        children: this.buildItems(component.id),
      }));
  }

  template() {
    return html`
      <mui-content-tree
        .items=${this.buildItems(null)}
        .active=${this.selectedId}
        @item-select=${(event: CustomEvent<{ id: string }>) =>
          this.emit('select', { id: event.detail.id }, { bubbles: true, composed: true })}
      ></mui-content-tree>
    `;
  }
}

if (!customElements.get('miura-architect-component-tree')) {
  customElements.define('miura-architect-component-tree', MiuraArchitectComponentTree);
}
