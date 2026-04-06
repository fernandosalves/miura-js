import type { Preview } from "@storybook/web-components";
import '../packages/miura-ui/src/styles/design-system.css';

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