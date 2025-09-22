import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', '*.js', '!eslint.config.js'],
  },
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      import: importPlugin,
    },
    rules: {
      // Base ESLint rules
      ...js.configs.recommended.rules,
      
      // TypeScript rules
      ...tsPlugin.configs.recommended.rules,
      
      // Airbnb-inspired rules for Node.js
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-template': 'error',
      'object-shorthand': 'error',
      'arrow-spacing': 'error',
      'comma-dangle': ['error', 'always-multiline'],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'indent': ['error', 2],
      'max-len': ['error', { code: 100 }],
      'eol-last': ['error', 'always'],
      'no-trailing-spaces': 'error',
      
      // TypeScript specific rules
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      
      // Import rules
      'import/extensions': ['error', 'ignorePackages', { ts: 'never' }],
      'import/prefer-default-export': 'off',
      'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index'
          ],
          'newlines-between': 'never'
        }
      ],
      
      // Node.js specific
      'class-methods-use-this': 'off',
      'consistent-return': 'off',
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
  },
];
