import js from '@eslint/js';
import sveltePlugin from 'eslint-plugin-svelte';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    ignores: ['dist/', 'build/', '.vercel/', '.netlify/', 'pnpm-lock.yaml'],
  },

  js.configs.recommended,
  ...sveltePlugin.configs['flat/recommended'],

  {
    files: ['**/*.svelte'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    rules: {},
  },

  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': 'warn',
    },
  },

  prettierConfig,
]);
