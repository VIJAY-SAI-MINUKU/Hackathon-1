module.exports = {
  env: { commonjs: true, es2021: true, node: true, jest: true },
  extends: [
    'eslint:recommended',
    'plugin:import/recommended',
    'prettier',
  ],
  parserOptions: { ecmaVersion: 'latest' },
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'import/order': ['warn', { 'newlines-between': 'always' }],
  },
};
