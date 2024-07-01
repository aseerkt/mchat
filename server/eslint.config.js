const pluginJs = require('@eslint/js')
const globals = require('globals')
const tseslint = require('typescript-eslint')

module.exports = [
  { files: ['src/**/*.ts'], ignores: ['dist/**', 'drizzle', 'node_modules'] },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
]
