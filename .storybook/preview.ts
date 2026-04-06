import type { Preview } from "@storybook/web-components";


// Inject old admin design-system.css globally into Storybook
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = '/../../labworks/_old/old_src/design-system.css';
document.head.appendChild(link);

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