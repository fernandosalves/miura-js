import { MiuraElement, html, css } from '@miurajs/miura-element';

/**
 * <mui-stepper steps="3" activeStep="1">
 *   <div slot="step">Step 1</div>
 *   <div slot="step">Step 2</div>
 *   <div slot="step">Step 3</div>
 * </mui-stepper>
 */
export class MuiStepper extends MiuraElement {
  static properties = {
    steps: { type: Number },
    activeStep: { type: Number },
  };
  steps = 3;
  activeStep = 1;

  template() {
    const stepEls = Array.from(this.querySelectorAll('[slot="step"]'));
    return html`
      <div class="mui-stepper">
        ${Array.from({ length: this.steps }, (_, i) => html`
          <div class="mui-stepper-step${i + 1 === this.activeStep ? ' active' : ''}">
            ${stepEls[i] ? stepEls[i].innerHTML : `Step ${i + 1}`}
          </div>
        `)}
      </div>
    `;
  }
  styles = css`
    .mui-stepper {
      display: flex;
      gap: var(--mui-spacing-2);
      align-items: center;
    }
    .mui-stepper-step {
      padding: 0.5em 1em;
      border-radius: var(--mui-radius);
      background: #eee;
      color: #888;
      font-weight: 500;
      transition: background 0.2s, color 0.2s;
    }
    .mui-stepper-step.active {
      background: var(--mui-primary, #0078d4);
      color: #fff;
    }
  `;
}
customElements.define('mui-stepper', MuiStepper); 