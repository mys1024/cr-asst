import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    name: 'files-to-lint',
    files: ['**/*.{js,mjs,ts,mts}'],
  },
  {
    name: 'files-to-ignore',
    ignores: ['**/dist/**', '**/coverage/**', '**/.pnpm-store/**'],
  },
  eslint.configs.recommended,
  tseslint.configs.strict,
);
