module.exports = {
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parserOptions: {
        project: ['./tsconfig.json'], // Specify it only for TypeScript files
      },
    },
  ],
  extends: [
    'plugin:@next/next/recommended',
    '../../.eslintrc.base.json'
  ],
  rules: {
    '@next/next/no-html-link-for-pages': ['error', 'packages/depub.space/src/pages']
  }
}