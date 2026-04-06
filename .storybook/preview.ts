import type { Preview } from "@storybook/web-components";

// Inject MiuraUI design tokens as CSS variables
const style = document.createElement('style');
style.textContent = `
  :root {
    /* Colors */
    --mui-primary: #2563eb;
    --mui-primary-foreground: #fff;
    --mui-primary-hover: #1d4ed8;
    --mui-secondary: #7c3aed;
    --mui-secondary-foreground: #fff;
    --mui-success: #16a34a;
    --mui-warning: #d97706;
    --mui-danger: #dc2626;
    --mui-danger-foreground: #fff;
    --mui-neutral: #64748b;
    
    /* Text */
    --mui-text: #0f172a;
    --mui-text-secondary: #64748b;
    
    /* Surfaces */
    --mui-surface: #ffffff;
    --mui-surface-subtle: #f8fafc;
    --mui-surface-hover: #f1f5f9;
    --mui-border: #e2e8f0;
    --mui-border-hover: #cbd5e1;
    
    /* Spacing */
    --mui-space-1: 0.25rem;
    --mui-space-2: 0.5rem;
    --mui-space-3: 0.75rem;
    --mui-space-4: 1rem;
    --mui-space-6: 1.5rem;
    
    /* Radius */
    --mui-radius-sm: 4px;
    --mui-radius-md: 8px;
    --mui-radius-lg: 12px;
    
    /* Typography */
    --mui-text-xs: 0.75rem;
    --mui-text-sm: 0.875rem;
    --mui-text-md: 1rem;
    --mui-text-lg: 1.125rem;
    --mui-weight-medium: 500;
    --mui-weight-semibold: 600;
    
    /* Shadows */
    --mui-shadow-sm: 0 1px 2px rgba(15,23,42,0.08);
    --mui-shadow-md: 0 4px 12px rgba(15,23,42,0.12);
    --mui-shadow-lg: 0 12px 24px rgba(15,23,42,0.16);
    --mui-shadow-xl: 0 20px 40px rgba(15,23,42,0.20);
    
    /* Motion */
    --mui-duration-fast: 120ms;
    --mui-duration-normal: 200ms;
    --mui-duration-slow: 320ms;
    --mui-easing-standard: cubic-bezier(0.4,0,0.2,1);
    --mui-easing-emphasized: cubic-bezier(0.2,0,0,1);
    
    /* Z-index */
    --mui-z-dropdown: 1000;
    --mui-z-sticky: 1100;
    --mui-z-modal: 1200;
    --mui-z-popover: 1300;
    --mui-z-tooltip: 1400;
  }
  
  body {
    margin: 0;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
`;
document.head.appendChild(style);

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        method: 'alphabetical',
        order: [''],
        locales: '',
      },
    },
  },
};

export default preview;