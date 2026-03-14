import type { StorybookConfig } from "@storybook/web-components-vite";

import { join, dirname } from "path";
import baseViteConfig from "../vite.config";

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, "package.json")));
}

type AliasEntry = { find: string | RegExp; replacement: string };

const toAliasArray = (alias?: typeof baseViteConfig.resolve extends { alias: infer T } ? T : any) => {
  if (!alias) return [] as AliasEntry[];
  if (Array.isArray(alias)) {
    return alias as AliasEntry[];
  }
  return Object.entries(alias).map(([find, replacement]) => ({ find, replacement })) as AliasEntry[];
};

const config: StorybookConfig = {
  stories: [
    "../packages/miura-ui/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../packages/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: [getAbsolutePath("@storybook/addon-essentials")],
  framework: {
    name: getAbsolutePath("@storybook/web-components-vite"),
    options: {},
  },
  async viteFinal(config) {
    const baseAliasEntries = toAliasArray(baseViteConfig.resolve?.alias);
    const existingEntries = toAliasArray(config.resolve?.alias);
    const baseFindKeys = new Set(baseAliasEntries.map((entry) => entry.find.toString()));

    config.resolve = {
      ...(config.resolve ?? {}),
      alias: [
        ...baseAliasEntries,
        ...existingEntries.filter((entry) => !baseFindKeys.has(entry.find.toString())),
      ],
    };

    return config;
  },
};
export default config;
