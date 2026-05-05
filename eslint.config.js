const { defineConfig, globalIgnores } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  globalIgnores([
    '.expo/*',
    'node_modules/*',
    'target/*',
    '.shadow-cljs/*',
    'out/*',
    'dist/*',
    'dist/**/*',
    'src/clj/*',
    'src/cljs/*',
    'lib/screens/*',
    '.clj-kondo/*',
    '.lsp/*',
  ]),
  expoConfig,
]);
