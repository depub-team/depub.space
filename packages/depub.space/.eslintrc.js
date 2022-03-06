module.exports = {
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parserOptions: {
        project: ['./tsconfig.json'], // Specify it only for TypeScript files
      },
      rules: {
        '@next/next/no-html-link-for-pages': ['error', 'packages/depub.space/src/pages']
      }
    },
    {
      files: [
        'wdyr.ts',
      ],
      rules: {
        'import/no-extraneous-dependencies': 'off',
        'global-require': 'off',
        'no-console': 'off',
        '@typescript-eslint/no-var-requires': 'off'
      }
    },
    {
      files: [
        '**/*.stories.*'
      ],
      rules: {
        'import/no-anonymous-default-export': 'off',
        'import/no-extraneous-dependencies': 'off'
      }
    }
  ],
  extends: [
    'plugin:@next/next/recommended',
    '../../.eslintrc.base.json'
  ],
}