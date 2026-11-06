import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';

export default tseslint.config(
   {ignores: ['**/.local-dev/**', '**/.scratch/**', '**/.site/**', '**/dist/**', '**/node_modules/**', '**/kdbx-source.generated.cjs']},
   js.configs.recommended,
   ...tseslint.configs.recommended,
   {
      plugins: {'@stylistic': stylistic},
      rules: {
         'curly': ['error', 'all'],
         '@stylistic/quotes': ['error', 'single', {avoidEscape: true}],
         '@stylistic/brace-style': ['error', '1tbs', {allowSingleLine: false}],
         '@stylistic/object-curly-spacing': ['error', 'never'],
         '@typescript-eslint/explicit-member-accessibility': 'error',
         '@typescript-eslint/no-unused-vars': ['error', {argsIgnorePattern: '^_'}]
      }
   }
);
