import { MiuraElement, html, css, component, property, state } from '@miurajs/miura-element';

/**
 * Stepper container for multi-step processes
 * Usage:
 * <mui-stepper current-step="1">
 *   <mui-step label="Account" description="Create your account"></mui-step>
 *   <mui-step label="Profile" description="Set up your profile"></mui-step>
 *   <mui-step label="Finish" description="Review and submit"></mui-step>
 * </mui-stepper>
 */
@component({ tag: 'mui-stepper' })
export class MuiStepper extends MiuraElement {
  @property({ type: Number, default: 0 })
  currentStep!: number;

  @property({ type: String, default: 'horizontal' })
  orientation!: 'horizontal' | 'vertical';

  @property({ type: Boolean, default: false })
  clickable!: boolean;

  @property({ type: Boolean, default: false })
  showNumbers!: boolean;

  static get styles() {
    return css`
      :host {
        display: block;
      }

      .stepper {
        display: flex;
        gap: 0;
      }

      :host([orientation="vertical"]) .stepper {
        flex-direction: column;
      }

      :host([orientation="horizontal"]) .stepper {
        flex-direction: row;
        align-items: center;
      }

      ::slotted(mui-step) {
        flex: 1;
      }

      :host([orientation="vertical"]) ::slotted(mui-step) {
        flex: none;
      }
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this._updateSteps();
  }

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('currentStep') || 
        changedProperties.has('clickable') || 
        changedProperties.has('showNumbers') ||
        changedProperties.has('orientation')) {
      this._updateSteps();
    }
  }

  private _updateSteps() {
    const steps = Array.from(this.querySelectorAll('mui-step')) as MuiStep[];
    steps.forEach((step, index) => {
      step.setAttribute('index', String(index));
      step.setAttribute('total', String(steps.length));
      step.setAttribute('orientation', this.orientation);
      
      if (index < this.currentStep) {
        step.setAttribute('status', 'completed');
      } else if (index === this.currentStep) {
        step.setAttribute('status', 'active');
      } else {
        step.setAttribute('status', 'inactive');
      }

      if (this.clickable && index !== this.currentStep) {
        step.setAttribute('clickable', '');
      } else {
        step.removeAttribute('clickable');
      }

      if (this.showNumbers) {
        step.setAttribute('show-number', '');
      } else {
        step.removeAttribute('show-number');
      }
    });
  }

  private _handleStepClick(e: CustomEvent) {
    if (this.clickable) {
      const index = e.detail.index;
      this.currentStep = index;
      this.emit('step-change', { step: index });
    }
  }

  template() {
    return html`
      <div class="stepper" @step-click=${this._handleStepClick.bind(this)}>
        <slot></slot>
      </div>
    `;
  }
}

/**
 * Individual step component
 * Usage inside mui-stepper:
 * <mui-step label="Account" description="Create your account"></mui-step>
 */
@component({ tag: 'mui-step' })
export class MuiStep extends MiuraElement {
  @property({ type: String, default: '' })
  label!: string;

  @property({ type: String, default: '' })
  description!: string;

  @property({ type: String, default: '' })
  icon!: string;

  @property({ type: String, default: 'inactive' })
  status!: 'inactive' | 'active' | 'completed' | 'error';

  @property({ type: Number, default: 0 })
  index!: number;

  @property({ type: Number, default: 0 })
  total!: number;

  @property({ type: Boolean, default: false })
  clickable!: boolean;

  @property({ type: Boolean, default: false })
  showNumber!: boolean;

  @property({ type: String, default: 'horizontal' })
  orientation!: 'horizontal' | 'vertical';

  static get styles() {
    return css`
      :host {
        display: flex;
        position: relative;
      }

      /* Horizontal layout */
      :host([orientation="horizontal"]) {
        flex-direction: column;
        align-items: center;
        flex: 1;
      }

      :host([orientation="horizontal"]) .content {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      /* Vertical layout */
      :host([orientation="vertical"]) {
        flex-direction: row;
        align-items: flex-start;
        padding-bottom: var(--mui-space-6);
      }

      :host([orientation="vertical"]) .content {
        display: flex;
        flex-direction: column;
        padding-left: var(--mui-space-4);
        flex: 1;
      }

      .indicator-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .indicator {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 2px solid var(--_indicator-color, var(--mui-border));
        background: var(--_indicator-bg, var(--mui-surface));
        color: var(--_indicator-text, var(--mui-text-secondary));
        font-size: var(--mui-text-sm);
        font-weight: var(--mui-weight-semibold);
        transition: all var(--mui-duration-normal) var(--mui-easing-emphasized);
        z-index: 1;
      }

      /* Status colors */
      :host([status="active"]) .indicator {
        --_indicator-color: var(--mui-primary);
        --_indicator-bg: var(--mui-primary);
        --_indicator-text: var(--mui-primary-foreground);
      }

      :host([status="completed"]) .indicator {
        --_indicator-color: var(--mui-success);
        --_indicator-bg: var(--mui-success);
        --_indicator-text: white;
      }

      :host([status="error"]) .indicator {
        --_indicator-color: var(--mui-danger);
        --_indicator-bg: var(--mui-danger);
        --_indicator-text: white;
      }

      /* Connector line - Horizontal */
      :host([orientation="horizontal"]:not(:last-child))::after {
        content: '';
        position: absolute;
        top: 16px;
        left: calc(50% + 20px);
        right: calc(-50% + 20px);
        height: 2px;
        background: var(--_connector-color, var(--mui-border));
        z-index: 0;
        transition: background var(--mui-duration-normal) var(--mui-easing-standard);
      }

      :host([orientation="horizontal"][status="completed"])::after {
        --_connector-color: var(--mui-success);
      }

      /* Connector line - Vertical */
      :host([orientation="vertical"]:not(:last-child))::before {
        content: '';
        position: absolute;
        top: 40px;
        left: 15px;
        bottom: 0;
        width: 2px;
        background: var(--_connector-color, var(--mui-border));
        transition: background var(--mui-duration-normal) var(--mui-easing-standard);
      }

      :host([orientation="vertical"][status="completed"])::before {
        --_connector-color: var(--mui-success);
      }

      .label {
        font-size: var(--mui-text-sm);
        font-weight: var(--mui-weight-semibold);
        color: var(--_label-color, var(--mui-text-secondary));
        margin-top: var(--mui-space-2);
        transition: color var(--mui-duration-normal) var(--mui-easing-standard);
      }

      :host([status="active"]) .label,
      :host([status="completed"]) .label {
        --_label-color: var(--mui-text);
      }

      .description {
        font-size: var(--mui-text-xs);
        color: var(--mui-text-secondary);
        margin-top: var(--mui-space-1);
      }

      /* Clickable state */
      :host([clickable]) {
        cursor: pointer;
      }

      :host([clickable]:hover) .indicator {
        border-color: var(--mui-primary);
        transform: scale(1.05);
        box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
      }

      :host([clickable]:hover) .label {
        color: var(--mui-primary);
      }

      :host([clickable]:focus-within) .indicator {
        outline: 2px solid var(--mui-primary);
        outline-offset: 2px;
      }

      /* Icons */
      .indicator svg {
        width: 16px;
        height: 16px;
      }
    `;
  }

  private _handleClick() {
    if (this.clickable) {
      this.emit('step-click', { index: this.index }, { bubbles: true, composed: true });
    }
  }

  private _renderIndicatorContent() {
    if (this.status === 'completed') {
      return html`
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <path d="M5 12l5 5L20 7"/>
        </svg>
      `;
    }

    if (this.status === 'error') {
      return html`
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      `;
    }

    if (this.icon) {
      return html`<span>${this.icon}</span>`;
    }

    if (this.showNumber) {
      return html`<span>${this.index + 1}</span>`;
    }

    return '';
  }

  template() {
    return html`
      <div class="indicator-wrapper" @click=${this._handleClick.bind(this)}>
        <div class="indicator">
          ${this._renderIndicatorContent()}
        </div>
      </div>
      <div class="content">
        ${this.label ? html`<div class="label">${this.label}</div>` : ''}
        ${this.description ? html`<div class="description">${this.description}</div>` : ''}
        <slot></slot>
      </div>
    `;
  }
}
