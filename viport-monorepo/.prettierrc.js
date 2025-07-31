/** @type {import("prettier").Config} */
module.exports = {
  // Core formatting
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  quoteProps: "as-needed",
  trailingComma: "es5",
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: "always",
  endOfLine: "lf",
  
  // JSX specific
  jsxSingleQuote: false,
  
  // Other options
  embeddedLanguageFormatting: "auto",
  insertPragma: false,
  requirePragma: false,
  proseWrap: "preserve",
  htmlWhitespaceSensitivity: "css",
  vueIndentScriptAndStyle: false,
  
  // Plugin options
  plugins: [
    "prettier-plugin-organize-imports",
    "prettier-plugin-tailwindcss",
  ],
  
  // Tailwind CSS plugin options
  tailwindConfig: "./packages/config-tailwind/index.js",
  tailwindFunctions: ["cn", "cva", "clsx"],
  
  // File overrides
  overrides: [
    {
      files: "*.json",
      options: {
        tabWidth: 2,
        printWidth: 120,
      },
    },
    {
      files: "*.md",
      options: {
        tabWidth: 2,
        printWidth: 80,
        proseWrap: "always",
      },
    },
    {
      files: "*.mdx",
      options: {
        tabWidth: 2,
        printWidth: 80,
        proseWrap: "always",
      },
    },
    {
      files: "*.yaml",
      options: {
        tabWidth: 2,
        singleQuote: false,
      },
    },
    {
      files: "*.yml",
      options: {
        tabWidth: 2,
        singleQuote: false,
      },
    },
  ],
};