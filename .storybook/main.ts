import type { StorybookConfig } from "@storybook/web-components-vite";

const config: StorybookConfig = {
    stories: [
        "../stories/**/*.mdx",
        "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
        "../packages/*/stories/**/*.stories.@(js|jsx|ts|tsx)",
    ],
    docs: {
        autodocs: true,
    },
    addons: ["@storybook/addon-essentials"],
    framework: {
        name: "@storybook/web-components-vite",
        options: {},
    },
    viteFinal: async (config) => {
        // Add aliases for the monorepo packages - only if they exist
        const fs = await import('fs');
        const path = await import('path');

        const aliasArray: Array<{ find: string; replacement: string }> = [];

        // Add sub-path exports FIRST (more specific paths must come before less specific)
        const serverPath = path.resolve(process.cwd(), 'packages/miura-element/server.ts');
        if (fs.existsSync(serverPath)) {
            aliasArray.push({ find: '@miurajs/miura-element/server', replacement: serverPath });
        }

        const packages = [
            'miura-element',
            'miura-debugger',
            'miura-framework',
            'miura-render',
            'miura-router',
            'miura-data-flow',
            'miura-security',
            'miura-ui',
            'miura-ai',
            'miura-i18n',
            'miura-computing',
            'miura-vite',
        ];

        for (const pkg of packages) {
            const pkgPath = path.resolve(process.cwd(), `packages/${pkg}/index.ts`);
            if (fs.existsSync(pkgPath)) {
                aliasArray.push({ find: `@miurajs/${pkg}`, replacement: pkgPath });
            }
        }

        // Convert existing alias config to array format if needed
        const existingAliases = config.resolve?.alias;
        let mergedAliases: Array<{ find: string | RegExp; replacement: string }> = [];

        if (Array.isArray(existingAliases)) {
            mergedAliases = [...existingAliases];
        } else if (existingAliases && typeof existingAliases === 'object') {
            for (const [key, value] of Object.entries(existingAliases)) {
                mergedAliases.push({ find: key, replacement: value as string });
            }
        }

        // Add our aliases at the beginning for priority
        mergedAliases = [...aliasArray, ...mergedAliases];

        config.resolve = {
            ...(config.resolve ?? {}),
            alias: mergedAliases,
        };

        return config;
    },
};

export default config;
