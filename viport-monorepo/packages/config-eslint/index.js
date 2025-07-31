/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: [
    "@typescript-eslint/recommended",
    "eslint:recommended",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "unused-imports"],
  rules: {
    // TypeScript
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/consistent-type-imports": [
      "warn",
      {
        prefer: "type-imports",
        fixStyle: "inline-type-imports",
      },
    ],
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-non-null-assertion": "warn",
    
    // Imports
    "unused-imports/no-unused-imports": "error",
    "unused-imports/no-unused-vars": [
      "warn",
      {
        vars: "all",
        varsIgnorePattern: "^_",
        args: "after-used",
        argsIgnorePattern: "^_",
      },
    ],
    
    // General
    "prefer-const": "error",
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "no-debugger": "error",
    "no-duplicate-imports": "error",
    "no-unused-expressions": "error",
    
    // Best practices
    "object-shorthand": "error",
    "prefer-template": "error",
    "no-var": "error",
    "prefer-arrow-callback": "error",
  },
  ignorePatterns: [
    "dist/",
    "build/",
    ".next/",
    ".turbo/",
    "node_modules/",
    "*.min.js",
    "public/",
    ".storybook/",
    "storybook-static/",
  ],
};