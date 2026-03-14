import type { Preview } from "@storybook/web-components";

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