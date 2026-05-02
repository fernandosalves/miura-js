import { MiuraElement, css, html } from '@miurajs/miura-element';
import type { ApplicationManifestComponent, ComponentInfo, ContextInfo, SignalInfo, StoreInfo } from '../types.js';
import '@miurajs/miura-ui/elements';

type InspectorTab = 'overview' | 'state' | 'manifest';

export class MiuraArchitectComponentInspector extends MiuraElement {
  static properties = {
    component: { type: Object, default: null },
    manifestComponent: { type: Object, default: null },
    signals: { type: Array, default: () => [] },
    contexts: { type: Array, default: () => [] },
    stores: { type: Array, default: () => [] },
  };

  static state() {
    return {
      activeTab: { type: String, default: 'overview' },
    };
  }

  declare component: ComponentInfo | null;
  declare manifestComponent: ApplicationManifestComponent | null;
  declare signals: SignalInfo[];
  declare contexts: ContextInfo[];
  declare stores: StoreInfo[];
  declare activeTab: InspectorTab;

  static styles = css`
    :host {
      display: block;
      min-height: 0;
      background: var(--mui-color-surface);
    }

    .empty {
      display: grid;
      place-items: center;
      gap: var(--mui-space-2);
      padding: var(--mui-space-10);
      color: var(--mui-color-text-muted);
      text-align: center;
    }

    .hero {
      display: grid;
      gap: var(--mui-space-3);
      padding: var(--mui-space-4);
      border-bottom: 1px solid var(--mui-color-border);
      background: color-mix(in srgb, var(--mui-color-surface-muted), transparent 18%);
    }

    .title-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: start;
      gap: var(--mui-space-3);
    }

    .eyebrow {
      margin-bottom: var(--mui-space-1);
      color: var(--mui-color-text-muted);
      font-size: var(--mui-text-xs);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .tag {
      color: var(--mui-color-text);
      font-family: var(--mui-font-mono);
      font-size: var(--mui-text-lg);
      font-weight: var(--mui-weight-bold);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .role {
      justify-self: end;
      padding: 2px 8px;
      border: 1px solid var(--mui-color-border);
      border-radius: var(--mui-radius-sm);
      color: var(--mui-color-text-muted);
      font-size: var(--mui-text-xs);
      font-family: var(--mui-font-mono);
      background: var(--mui-color-surface);
    }

    .metrics {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: var(--mui-space-2);
    }

    .metric {
      padding: var(--mui-space-3);
      border: 1px solid var(--mui-color-border);
      border-radius: var(--mui-radius-sm);
      background: var(--mui-color-surface);
    }

    .metric-value {
      font-family: var(--mui-font-mono);
      font-size: var(--mui-text-lg);
      color: var(--mui-color-accent);
    }

    .metric-label {
      margin-top: 2px;
      color: var(--mui-color-text-muted);
      font-size: var(--mui-text-xs);
    }

    mui-tabs {
      border-bottom: 1px solid var(--mui-color-border);
    }

    .content {
      display: grid;
      gap: var(--mui-space-4);
      padding: var(--mui-space-4);
    }

    .section {
      display: grid;
      gap: var(--mui-space-2);
    }

    .section-title {
      color: var(--mui-color-text-muted);
      font-size: var(--mui-text-xs);
      font-weight: var(--mui-weight-semibold);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .rows {
      display: grid;
      border: 1px solid var(--mui-color-border);
      border-radius: var(--mui-radius-sm);
      overflow: hidden;
    }

    .row {
      display: grid;
      grid-template-columns: minmax(120px, 0.8fr) minmax(0, 1fr);
      gap: var(--mui-space-3);
      padding: var(--mui-space-2) var(--mui-space-3);
      border-top: 1px solid var(--mui-color-border);
      font-size: var(--mui-text-xs);
      min-width: 0;
    }

    .row:first-child {
      border-top: 0;
    }

    .key {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--mui-color-text-muted);
      font-family: var(--mui-font-mono);
    }

    .value {
      min-width: 0;
      overflow-wrap: anywhere;
      color: var(--mui-color-text);
      font-family: var(--mui-font-mono);
    }

    .empty-section {
      padding: var(--mui-space-3);
      border: 1px solid var(--mui-color-border);
      border-radius: var(--mui-radius-sm);
      color: var(--mui-color-text-muted);
      font-size: var(--mui-text-xs);
    }
  `;

  template() {
    if (!this.component) {
      return html`
        <div class="empty">
          <mui-icon name="box" size="32"></mui-icon>
          <p>Select a component to inspect</p>
        </div>
      `;
    }

    const role = this.manifestComponent?.architect?.type ?? inferRole(this.component.tag);
    const file = this.manifestComponent?.file ?? 'runtime only';
    const stateCount = Object.keys(this.component.state ?? {}).length;
    const propertyCount = Object.keys(this.component.properties ?? {}).length;

    return html`
      <div class="hero">
        <div class="title-row">
          <div>
            <div class="eyebrow">${file}</div>
            <div class="tag">&lt;${this.component.tag}&gt;</div>
          </div>
          <span class="role">${role}</span>
        </div>
        <div class="metrics">
          ${this.renderMetric(this.component.updateCount ?? 0, 'updates')}
          ${this.renderMetric(stateCount, 'state fields')}
          ${this.renderMetric(propertyCount, 'properties')}
        </div>
      </div>

      <mui-tabs
        .items=${[
          { id: 'overview', label: 'Overview' },
          { id: 'state', label: 'Runtime' },
          { id: 'manifest', label: 'Manifest' },
        ]}
        .active=${this.activeTab}
        @tab-select=${(event: CustomEvent) => { this.activeTab = event.detail.id; }}
      ></mui-tabs>

      <div class="content">
        ${this.activeTab === 'overview' ? this.renderOverview() : ''}
        ${this.activeTab === 'state' ? this.renderRuntime() : ''}
        ${this.activeTab === 'manifest' ? this.renderManifest() : ''}
      </div>
    `;
  }

  private renderOverview() {
    const component = this.component!;
    return html`
      ${this.renderRows('identity', {
        id: component.id,
        tag: component.tag,
        parent: component.parentId ?? 'root',
        connected: component.connected ?? 'unknown',
        renderTime: `${component.renderTime ?? 0}ms`,
      })}
      ${this.renderRows('live relationships', {
        signals: this.signals.length,
        contexts: this.contexts.length,
        stores: this.stores.length,
        children: component.childIds?.length ?? this.manifestComponent?.children.length ?? 0,
      })}
      ${this.renderList('children', this.manifestComponent?.children ?? [], 'No static children detected')}
      ${this.renderList('stores', this.manifestComponent?.stores ?? [], 'No stores detected')}
    `;
  }

  private renderRuntime() {
    return html`
      ${this.renderRows('state', this.component?.state ?? {})}
      ${this.renderRows('properties', this.component?.properties ?? {})}
      ${this.renderRuntimeSignals()}
      ${this.renderRuntimeContexts()}
      ${this.renderRuntimeStores()}
    `;
  }

  private renderManifest() {
    const manifest = this.manifestComponent;
    if (!manifest) return html`<div class="empty-section">No manifest entry for this component.</div>`;
    return html`
      ${this.renderRows('component metadata', {
        className: manifest.className,
        file: manifest.file,
        type: manifest.architect?.type ?? 'component',
        display: manifest.architect?.display ?? 'auto',
      })}
      ${this.renderList('properties', manifest.properties.map((field) => `${field.name} · ${field.source}`), 'No static properties')}
      ${this.renderList('state', manifest.state.map((field) => `${field.name} · ${field.source}`), 'No static state')}
      ${this.renderList('signals', manifest.signals.map((field) => `${field.name} · ${field.source}`), 'No static signals')}
      ${this.renderList('api', manifest.api.map((endpoint) => `${endpoint.method ?? endpoint.source ?? 'api'} ${endpoint.path}`), 'No api endpoints')}
    `;
  }

  private renderRuntimeSignals() {
    return this.renderStructuredList(
      'runtime signals',
      this.signals.map((signal) => ({
        key: signal.label ?? signal.id,
        value: [
          signal.type ?? 'signal',
          `reads ${signal.readCount ?? 0}`,
          `writes ${signal.writeCount ?? 0}`,
          signal.value !== undefined ? formatValue(signal.value) : '',
        ].filter(Boolean).join(' · '),
      })),
      'No runtime signals connected to this component',
    );
  }

  private renderRuntimeContexts() {
    const componentId = this.component?.id;
    return this.renderStructuredList(
      'runtime contexts',
      this.contexts.map((context) => ({
        key: context.key,
        value: [
          context.providerId === componentId ? 'provider' : '',
          context.consumerIds?.includes(componentId ?? '') ? 'consumer' : '',
          context.value !== undefined ? formatValue(context.value) : '',
        ].filter(Boolean).join(' · '),
      })),
      'No runtime contexts connected to this component',
    );
  }

  private renderRuntimeStores() {
    return this.renderStructuredList(
      'runtime stores',
      this.stores.map((store) => ({
        key: store.key,
        value: [
          `${Object.keys(store.state ?? {}).length} fields`,
          `${store.dispatchHistory?.length ?? 0} dispatches`,
        ].join(' · '),
      })),
      'No runtime stores connected to this component',
    );
  }

  private renderMetric(value: string | number, label: string) {
    return html`
      <div class="metric">
        <div class="metric-value">${value}</div>
        <div class="metric-label">${label}</div>
      </div>
    `;
  }

  private renderRows(title: string, data: Record<string, unknown>) {
    const entries = Object.entries(data);
    return html`
      <section class="section">
        <div class="section-title">${title}</div>
        ${entries.length
          ? html`<div class="rows">${entries.map(([key, value]) => html`
              <div class="row">
                <div class="key">${key}</div>
                <div class="value">${formatValue(value)}</div>
              </div>
            `)}</div>`
          : html`<div class="empty-section">No ${title} data.</div>`}
      </section>
    `;
  }

  private renderList(title: string, items: string[], emptyLabel: string) {
    return this.renderStructuredList(
      title,
      items.map((item) => ({ key: item, value: '' })),
      emptyLabel,
    );
  }

  private renderStructuredList(title: string, items: Array<{ key: string; value: string }>, emptyLabel: string) {
    return html`
      <section class="section">
        <div class="section-title">${title}</div>
        ${items.length
          ? html`<div class="rows">${items.slice(0, 24).map((item) => html`
              <div class="row">
                <div class="key">${item.key}</div>
                <div class="value">${item.value}</div>
              </div>
            `)}</div>`
          : html`<div class="empty-section">${emptyLabel}</div>`}
      </section>
    `;
  }
}

function inferRole(tag: string): string {
  if (tag.endsWith('-app')) return 'application';
  if (tag.endsWith('-layout')) return 'layout';
  if (tag.endsWith('-page')) return 'page';
  if (tag.endsWith('-panel')) return 'component';
  return 'component';
}

function formatValue(value: unknown): string {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

if (!customElements.get('miura-architect-component-inspector')) {
  customElements.define('miura-architect-component-inspector', MiuraArchitectComponentInspector);
}
