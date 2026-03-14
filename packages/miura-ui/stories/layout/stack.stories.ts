import '../../src/layout/stack';

export default {
  title: 'miura-ui/Layout/Stack',
  component: 'mui-stack',
};

export const Horizontal = {
  render: () => `
    <mui-stack direction="row" gap="1em">
      <mui-button>One</mui-button>
      <mui-button>Two</mui-button>
      <mui-button>Three</mui-button>
    </mui-stack>
  `
};

export const Vertical = {
  render: () => `
    <mui-stack direction="column" gap="0.5em">
      <mui-button>One</mui-button>
      <mui-button>Two</mui-button>
      <mui-button>Three</mui-button>
    </mui-stack>
  `
}; 