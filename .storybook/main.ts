import type { StorybookConfig } from "@storybook/web-components-vite";

const config: StorybookConfig = {
  stories: [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../packages/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: ["@storybook/addon-essentials"],
  framework: {
    name: "@storybook/web-components-vite",
    options: {},
  },
  viteFinal: async (config) => {
    // Add aliases for the monorepo packages - only if they exist
    const fs = await import('fs');
    const path = await import('path');
    
    const aliases: Record<string, string> = {};
    
    const packages = [
      'miura-element',
      'miura-debugger', 
      'miura-framework',
      'miura-render',
      'miura-router',
      'miura-data-flow',
      'miura-security',
      'miura-ui'
    ];
    
    for (const pkg of packages) {
      const pkgPath = path.resolve(process.cwd(), `packages/${pkg}/index.ts`);
      if (fs.existsSync(pkgPath)) {
        aliases[`@miurajsjs/${pkg}`] = pkgPath;
      }
    }
    
    config.resolve = {
      ...(config.resolve ?? {}),
      alias: {
        ...config.resolve?.alias,
        ...aliases,
      },
    };

    return config;
  },
};

export default config;
