/** @type {import('prettier').Config} */
module.exports = {
  // Core formatting options
  semi: false,
  singleQuote: true,
  quoteProps: 'as-needed',
  jsxSingleQuote: false,
  trailingComma: 'all',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',
  
  // Line width and wrapping
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  
  // End of line
  endOfLine: 'lf',
  
  // Embedded language formatting
  embeddedLanguageFormatting: 'auto',
  
  // HTML whitespace sensitivity
  htmlWhitespaceSensitivity: 'css',
  
  // Vue files
  vueIndentScriptAndStyle: false,
  
  // Plugin configurations
  plugins: [
    'prettier-plugin-tailwindcss',
    '@ianvs/prettier-plugin-sort-imports',
  ],
  
  // Import sorting configuration
  importOrder: [
    '<BUILTIN_MODULES>', // Node.js built-in modules
    '<THIRD_PARTY_MODULES>', // Imports not matched by other special words or groups
    '', // Empty line
    '^@/(.*)$', // Internal modules
    '', // Empty line
    '^[./]', // Relative imports
  ],
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
  importOrderTypeScriptVersion: '5.0.0',
  
  // Tailwind CSS class sorting
  tailwindFunctions: ['clsx', 'cn', 'cva'],
  
  // Override configurations for specific file types
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 200,
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 100,
        proseWrap: 'always',
      },
    },
    {
      files: '*.yml',
      options: {
        tabWidth: 2,
      },
    },
    {
      files: '*.yaml',
      options: {
        tabWidth: 2,
      },
    },
  ],
}