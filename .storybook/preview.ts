import type { Preview } from "@storybook/web-components";
import '../packages/miura-ui/src/styles/design-system.css';
import {
  clearDebugLayers,
  clearDiagnostics,
  clearTimelineEvents,
  disableMiuraDebugger,
} from '@miurajs/miura-debugger';

const preview: Preview = {
  decorators: [
    (story, context) => {
      const debuggerEnabled = context.parameters?.miuraDebugger?.enabled === true;

      if (!debuggerEnabled) {
        disableMiuraDebugger();
      }
      clearDiagnostics();
      clearDebugLayers();
      clearTimelineEvents();
      return story();
    },
  ],
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
