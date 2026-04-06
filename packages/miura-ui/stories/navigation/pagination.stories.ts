import { MiuraElement, html, css, state } from '@miurajs/miura-element';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../../src/navigation/pagination.js';

class PaginationDemo extends MiuraElement {
  @state({ default: 1 })
  private _currentPage!: number;

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
        margin-bottom: 1rem;
      }
      .info {
        margin-top: 1rem;
        padding: 1rem;
        background: var(--mui-surface-subtle);
        border-radius: var(--mui-radius-sm);
        font-size: var(--mui-text-sm);
        color: var(--mui-text-secondary);
      }
    `;
  }

  template() {
    return html`
      <div>
        <div class="demo-section">
          <h3>Basic Pagination</h3>
          <mui-pagination 
            current-page=${this._currentPage}
            total-pages="10"
            @page-change=${(e: CustomEvent) => {
              this._currentPage = e.detail.page;
            }}
          ></mui-pagination>
          <div class="info">Current page: ${this._currentPage} of 10</div>
        </div>

        <div class="demo-section">
          <h3>With First/Last Buttons</h3>
          <mui-pagination 
            current-page="5"
            total-pages="20"
            show-first-last
          ></mui-pagination>
        </div>

        <div class="demo-section">
          <h3>Compact (No Prev/Next)</h3>
          <mui-pagination 
            current-page="3"
            total-pages="10"
            show-prev-next="false"
          ></mui-pagination>
        </div>

        <div class="demo-section">
          <h3>Size Variants</h3>
          <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div>
              <p><strong>Small</strong></p>
              <mui-pagination size="sm" current-page="3" total-pages="10"></mui-pagination>
            </div>
            <div>
              <p><strong>Medium (Default)</strong></p>
              <mui-pagination size="md" current-page="3" total-pages="10"></mui-pagination>
            </div>
            <div>
              <p><strong>Large</strong></p>
              <mui-pagination size="lg" current-page="3" total-pages="10"></mui-pagination>
            </div>
          </div>
        </div>

        <div class="demo-section">
          <h3>Many Pages</h3>
          <mui-pagination 
            current-page="25"
            total-pages="100"
            max-visible="7"
            show-first-last
          ></mui-pagination>
          <div class="info">
            Shows ellipsis (...) for large page counts. Current implementation uses smart 
            range calculation to show pages around the current selection.
          </div>
        </div>

        <div class="demo-section">
          <h3>Edge Cases</h3>
          <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div>
              <p><strong>Single Page</strong></p>
              <mui-pagination current-page="1" total-pages="1"></mui-pagination>
            </div>
            <div>
              <p><strong>Two Pages</strong></p>
              <mui-pagination current-page="1" total-pages="2"></mui-pagination>
            </div>
            <div>
              <p><strong>First Page of Many</strong></p>
              <mui-pagination current-page="1" total-pages="50"></mui-pagination>
            </div>
            <div>
              <p><strong>Last Page of Many</strong></p>
              <mui-pagination current-page="50" total-pages="50"></mui-pagination>
            </div>
          </div>
        </div>

        <div class="demo-section">
          <h3>Disabled State</h3>
          <mui-pagination 
            current-page="5"
            total-pages="10"
            disabled
          ></mui-pagination>
        </div>
      </div>
    `;
  }
}

customElements.define('pagination-demo', PaginationDemo);

const meta: Meta<PaginationDemo> = {
  title: 'MiuraUI/Navigation/Pagination',
  component: 'pagination-demo',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
# Pagination

Navigation component for multi-page content with intelligent ellipsis handling.

## Features

- **Smart Range Calculation**: Shows relevant pages with ellipsis for large datasets
- **First/Last Buttons**: Optional quick navigation to boundaries
- **Prev/Next Buttons**: Configurable previous/next navigation
- **Size Variants**: sm, md, lg sizes
- **Keyboard Accessible**: Full ARIA support
- **Max Visible Pages**: Configurable number of visible page buttons
- **Event Emission**: Emits page-change events with page number

## Usage

\`\`\`html
<mui-pagination 
  current-page="1"
  total-pages="10"
  @page-change=\${(e) => console.log(e.detail.page)}
></mui-pagination>
\`\`\`

## Algorithm

The component uses smart range calculation to show:
- First page (always visible)
- Last page (always visible)
- Pages around current selection
- Ellipsis (...) for gaps

This ensures optimal UX even with 100+ pages.
        `
      }
    }
  }
};

export default meta;
type Story = StoryObj<PaginationDemo>;

export const Default: Story = {
  args: {}
};
