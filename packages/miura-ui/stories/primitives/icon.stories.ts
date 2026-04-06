/**
 * Icon Component Stories
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { MiuraElement, html } from '@miurajs/miura-element';
import '../../src/primitives/icon.js';
import '../../src/primitives/icon-button.js';

class IconBasicDemo extends MiuraElement {
  template() {
    return html`
      <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
        <mui-icon name="home"></mui-icon>
        <mui-icon name="settings"></mui-icon>
        <mui-icon name="user"></mui-icon>
        <mui-icon name="search"></mui-icon>
        <mui-icon name="heart"></mui-icon>
        <mui-icon name="star"></mui-icon>
        <mui-icon name="bell"></mui-icon>
        <mui-icon name="mail"></mui-icon>
      </div>
    `;
  }
}

class IconSizesDemo extends MiuraElement {
  template() {
    return html`
      <div style="display: flex; gap: 24px; align-items: center;">
        <div style="text-align: center;">
          <mui-icon name="folder" size="xs"></mui-icon>
          <div style="font-size: 10px; color: #888; margin-top: 4px;">xs (12px)</div>
        </div>
        <div style="text-align: center;">
          <mui-icon name="folder" size="sm"></mui-icon>
          <div style="font-size: 10px; color: #888; margin-top: 4px;">sm (16px)</div>
        </div>
        <div style="text-align: center;">
          <mui-icon name="folder" size="md"></mui-icon>
          <div style="font-size: 10px; color: #888; margin-top: 4px;">md (20px)</div>
        </div>
        <div style="text-align: center;">
          <mui-icon name="folder" size="lg"></mui-icon>
          <div style="font-size: 10px; color: #888; margin-top: 4px;">lg (24px)</div>
        </div>
        <div style="text-align: center;">
          <mui-icon name="folder" size="xl"></mui-icon>
          <div style="font-size: 10px; color: #888; margin-top: 4px;">xl (32px)</div>
        </div>
      </div>
    `;
  }
}

class IconColorsDemo extends MiuraElement {
  template() {
    return html`
      <div style="display: flex; gap: 24px; align-items: center;">
        <mui-icon name="circle" color="primary"></mui-icon>
        <mui-icon name="circle" color="success"></mui-icon>
        <mui-icon name="circle" color="warning"></mui-icon>
        <mui-icon name="circle" color="error"></mui-icon>
        <mui-icon name="circle" color="muted"></mui-icon>
        <mui-icon name="circle" color="#ec4899"></mui-icon>
      </div>
    `;
  }
}

class IconSpinningDemo extends MiuraElement {
  template() {
    return html`
      <div style="display: flex; gap: 24px; align-items: center;">
        <mui-icon name="loader-2" spin></mui-icon>
        <mui-icon name="loader-2" spin size="lg"></mui-icon>
        <mui-icon name="refresh-cw" spin color="primary"></mui-icon>
      </div>
    `;
  }
}

class IconButtonsDemo extends MiuraElement {
  template() {
    return html`
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <div>
          <h4 style="margin: 0 0 12px; font-size: 14px; color: #666;">Ghost (default)</h4>
          <div style="display: flex; gap: 8px;">
            <mui-icon-button icon="settings" label="Settings"></mui-icon-button>
            <mui-icon-button icon="trash-2" label="Delete" color="error"></mui-icon-button>
            <mui-icon-button icon="plus" label="Add" color="primary"></mui-icon-button>
          </div>
        </div>
        
        <div>
          <h4 style="margin: 0 0 12px; font-size: 14px; color: #666;">Soft</h4>
          <div style="display: flex; gap: 8px;">
            <mui-icon-button icon="settings" variant="soft" label="Settings"></mui-icon-button>
            <mui-icon-button icon="trash-2" variant="soft" color="error" label="Delete"></mui-icon-button>
            <mui-icon-button icon="plus" variant="soft" color="primary" label="Add"></mui-icon-button>
          </div>
        </div>
        
        <div>
          <h4 style="margin: 0 0 12px; font-size: 14px; color: #666;">Outline</h4>
          <div style="display: flex; gap: 8px;">
            <mui-icon-button icon="settings" variant="outline" label="Settings"></mui-icon-button>
            <mui-icon-button icon="trash-2" variant="outline" color="error" label="Delete"></mui-icon-button>
            <mui-icon-button icon="plus" variant="outline" color="primary" label="Add"></mui-icon-button>
          </div>
        </div>
        
        <div>
          <h4 style="margin: 0 0 12px; font-size: 14px; color: #666;">Solid</h4>
          <div style="display: flex; gap: 8px;">
            <mui-icon-button icon="settings" variant="solid" label="Settings"></mui-icon-button>
            <mui-icon-button icon="trash-2" variant="solid" color="error" label="Delete"></mui-icon-button>
            <mui-icon-button icon="plus" variant="solid" color="primary" label="Add"></mui-icon-button>
          </div>
        </div>
        
        <div>
          <h4 style="margin: 0 0 12px; font-size: 14px; color: #666;">Sizes</h4>
          <div style="display: flex; gap: 8px; align-items: center;">
            <mui-icon-button icon="settings" size="xs" label="XS"></mui-icon-button>
            <mui-icon-button icon="settings" size="sm" label="SM"></mui-icon-button>
            <mui-icon-button icon="settings" size="md" label="MD"></mui-icon-button>
            <mui-icon-button icon="settings" size="lg" label="LG"></mui-icon-button>
          </div>
        </div>
        
        <div>
          <h4 style="margin: 0 0 12px; font-size: 14px; color: #666;">Round</h4>
          <div style="display: flex; gap: 8px;">
            <mui-icon-button icon="play" variant="solid" color="primary" round label="Play"></mui-icon-button>
            <mui-icon-button icon="pause" variant="outline" round label="Pause"></mui-icon-button>
            <mui-icon-button icon="skip-forward" variant="ghost" round label="Skip"></mui-icon-button>
          </div>
        </div>
        
        <div>
          <h4 style="margin: 0 0 12px; font-size: 14px; color: #666;">Loading</h4>
          <div style="display: flex; gap: 8px;">
            <mui-icon-button icon="save" loading label="Saving"></mui-icon-button>
            <mui-icon-button icon="save" variant="solid" color="primary" loading label="Saving"></mui-icon-button>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('icon-basic-demo', IconBasicDemo);
customElements.define('icon-sizes-demo', IconSizesDemo);
customElements.define('icon-colors-demo', IconColorsDemo);
customElements.define('icon-spinning-demo', IconSpinningDemo);
customElements.define('icon-buttons-demo', IconButtonsDemo);

const meta: Meta<IconBasicDemo> = {
  title: 'MiuraUI/Primitives/Icon',
  component: 'icon-basic-demo',
  parameters: {
    layout: 'padded',
  },
};

export default meta;

type Story = StoryObj<IconBasicDemo>;

/**
 * Basic Icons
 */
export const BasicIcons: Story = {
  args: {},
};

/**
 * Icon Sizes
 */
export const IconSizes: Story = {
  render: () => document.createElement('icon-sizes-demo'),
};

/**
 * Icon Colors
 */
export const IconColors: Story = {
  render: () => document.createElement('icon-colors-demo'),
};

/**
 * Spinning Icon (Loading)
 */
export const SpinningIcon: Story = {
  render: () => document.createElement('icon-spinning-demo'),
};

/**
 * Icon Buttons
 */
export const IconButtons: Story = {
  render: () => document.createElement('icon-buttons-demo'),
};
