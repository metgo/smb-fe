module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: ['./metgo-eslintrule.json'],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  rules: {
    'camelcase': 'off', 
    '@typescript-eslint/camelcase': [
      'off',
    ],
  },
};
