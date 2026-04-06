import { MiuraElement, html, css, state } from '@miurajs/miura-element';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../../src/navigation/stepper.js';

class StepperDemo extends MiuraElement {
  @state({ default: 0 })
  private _currentStep!: number;

  static get styles() {
    return css`
      :host {
        display: block;
        padding: 20px;
        font-family: system-ui;
      }
      .demo-section {
        margin-bottom: 3rem;
      }
      h3 {
        margin-top: 0;
        margin-bottom: 1.5rem;
      }
      .controls {
        display: flex;
        gap: 1rem;
        margin-top: 2rem;
      }
      .button {
        padding: 0.5rem 1rem;
        background: var(--mui-primary);
        color: white;
        border: none;
        border-radius: var(--mui-radius-sm);
        cursor: pointer;
        font-size: var(--mui-text-sm);
      }
      .button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .button.secondary {
        background: var(--mui-surface);
        color: var(--mui-text);
        border: 1px solid var(--mui-border);
      }
    `;
  }

  private _next() {
    if (this._currentStep < 2) {
      this._currentStep++;
    }
  }

  private _prev() {
    if (this._currentStep > 0) {
      this._currentStep--;
    }
  }

  template() {
    return html`
      <div>
        <div class="demo-section">
          <h3>Horizontal Stepper</h3>
          <mui-stepper current-step=${this._currentStep}>
            <mui-step label="Account" description="Create your account"></mui-step>
            <mui-step label="Profile" description="Set up your profile"></mui-step>
            <mui-step label="Finish" description="Review and submit"></mui-step>
          </mui-stepper>
          <div class="controls">
            <button class="button secondary" @click=${this._prev.bind(this)} ?disabled=${this._currentStep === 0}>
              Previous
            </button>
            <button class="button" @click=${this._next.bind(this)} ?disabled=${this._currentStep === 2}>
              ${this._currentStep === 2 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>

        <div class="demo-section">
          <h3>Vertical Stepper</h3>
          <mui-stepper current-step="1" orientation="vertical">
            <mui-step label="Select campaign settings" description="Choose your campaign type and set your budget">
              <div style="padding: 1rem 0; color: var(--mui-text-secondary); font-size: var(--mui-text-sm);">
                Additional step content can go here. This could include forms, 
                instructions, or any other relevant information.
              </div>
            </mui-step>
            <mui-step label="Create an ad group" description="Define your target audience and keywords">
              <div style="padding: 1rem 0; color: var(--mui-text-secondary); font-size: var(--mui-text-sm);">
                Active step content is displayed here.
              </div>
            </mui-step>
            <mui-step label="Create an ad" description="Write compelling copy and choose visuals"></mui-step>
            <mui-step label="Review and launch" description="Double-check everything before launching"></mui-step>
          </mui-stepper>
        </div>

        <div class="demo-section">
          <h3>With Numbers</h3>
          <mui-stepper current-step="1" show-numbers>
            <mui-step label="Step 1" description="First step"></mui-step>
            <mui-step label="Step 2" description="Second step"></mui-step>
            <mui-step label="Step 3" description="Third step"></mui-step>
            <mui-step label="Step 4" description="Fourth step"></mui-step>
          </mui-stepper>
        </div>

        <div class="demo-section">
          <h3>With Custom Icons</h3>
          <mui-stepper current-step="1">
            <mui-step label="Shopping Cart" description="Review items" icon="🛒"></mui-step>
            <mui-step label="Shipping" description="Enter address" icon="📦"></mui-step>
            <mui-step label="Payment" description="Enter payment details" icon="💳"></mui-step>
            <mui-step label="Confirmation" description="Order complete" icon="✅"></mui-step>
          </mui-stepper>
        </div>

        <div class="demo-section">
          <h3>Clickable Steps</h3>
          <mui-stepper current-step="1" clickable>
            <mui-step label="Basic Info"></mui-step>
            <mui-step label="Contact"></mui-step>
            <mui-step label="Preferences"></mui-step>
            <mui-step label="Review"></mui-step>
          </mui-stepper>
          <div style="margin-top: 1rem; padding: 1rem; background: var(--mui-surface-subtle); border-radius: var(--mui-radius-sm); font-size: var(--mui-text-sm);">
            <strong>Try clicking on the steps!</strong> When <code>clickable</code> is enabled, 
            users can jump to any step directly.
          </div>
        </div>

        <div class="demo-section">
          <h3>Error State</h3>
          <mui-stepper current-step="1">
            <mui-step label="Personal Info" status="completed"></mui-step>
            <mui-step label="Verification" status="error" description="Please verify your email"></mui-step>
            <mui-step label="Complete"></mui-step>
          </mui-stepper>
        </div>

        <div class="demo-section">
          <h3>Status States</h3>
          <mui-stepper current-step="2">
            <mui-step label="Completed" status="completed"></mui-step>
            <mui-step label="Active" status="active"></mui-step>
            <mui-step label="Inactive" status="inactive"></mui-step>
            <mui-step label="Error" status="error"></mui-step>
          </mui-stepper>
        </div>

        <div class="demo-section">
          <h3>Minimal (Labels Only)</h3>
          <mui-stepper current-step="2" show-numbers>
            <mui-step label="Start"></mui-step>
            <mui-step label="In Progress"></mui-step>
            <mui-step label="Review"></mui-step>
            <mui-step label="Complete"></mui-step>
          </mui-stepper>
        </div>
      </div>
    `;
  }
}

customElements.define('stepper-demo', StepperDemo);

const meta: Meta<StepperDemo> = {
  title: 'MiuraUI/Navigation/Stepper',
  component: 'stepper-demo',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
# Stepper

Multi-step process indicator for wizards, forms, and guided workflows.

## Features

- **Orientations**: Horizontal and vertical layouts
- **Status States**: inactive, active, completed, error
- **Clickable Steps**: Optional navigation by clicking steps
- **Custom Icons**: Support for custom step icons
- **Numbers**: Optional step numbers
- **Descriptions**: Rich step descriptions
- **Connector Lines**: Visual progress indication
- **Responsive**: Works well on mobile and desktop

## Usage

\`\`\`html
<mui-stepper current-step="1" orientation="horizontal">
  <mui-step label="Account" description="Create account"></mui-step>
  <mui-step label="Profile" description="Set up profile"></mui-step>
  <mui-step label="Finish" description="Review"></mui-step>
</mui-stepper>
\`\`\`

## Best Practices

- Use **horizontal** for 3-5 steps
- Use **vertical** for >5 steps or with rich content
- Enable **clickable** only if users can truly jump between steps
- Use **error** status to indicate validation issues
- Provide clear descriptions for each step
        `
      }
    }
  }
};

export default meta;
type Story = StoryObj<StepperDemo>;

export const Default: Story = {
  args: {}
};
