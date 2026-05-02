// @ts-check

import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['**/dist/**', '**/components/ui/**']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      'no-var': 'error',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
      'func-style': ['error', 'expression'],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],

      'no-restricted-syntax': [
        'error',
        {
          selector: 'ClassDeclaration',
          message:
            'Classes are not allowed. Use plain objects and functions (Functional approach).',
        },
        {
          selector: 'TSEnumDeclaration',
          message:
            'Enums are not allowed. Use Union types or Objects with "as const".',
        },
        {
          selector: 'TSInterfaceDeclaration',
          message: 'Interfaces are not allowed. Use "type" alias.',
        },
        {
          selector: 'TSModuleDeclaration',
          message: 'Namespaces are not allowed. Use ES Modules.',
        },
        {
          selector:
            'ForStatement, ForInStatement, WhileStatement, DoWhileStatement',
          message:
            'Imperative loops are not allowed. Use array methods (map, filter, reduce) or "for...of".',
        },
        {
          selector: 'SwitchStatement',
          message:
            'Switch statements are not allowed. Use object mapping or if/else blocks.',
        },
        {
          selector: 'UnaryExpression[operator="delete"]',
          message:
            'Do not use "delete". It mutates the object shape. Create a new object without the key.',
        },
      ],

      'max-depth': ['error', 2],
      'max-params': ['error', 2],
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    },
  },
]);
