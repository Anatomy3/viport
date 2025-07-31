/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "@typescript-eslint/recommended-requiring-type-checking",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
  },
  plugins: [
    "@typescript-eslint",
    "unused-imports",
    "simple-import-sort",
    "jsx-a11y",
  ],
  rules: {
    // TypeScript specific rules
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/no-unsafe-member-access": "error",
    "@typescript-eslint/no-unsafe-call": "error",
    "@typescript-eslint/no-unsafe-return": "error",
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/prefer-optional-chain": "error",
    "@typescript-eslint/no-unnecessary-condition": "error",
    "@typescript-eslint/no-non-null-assertion": "error",
    "@typescript-eslint/ban-ts-comment": "error",
    "@typescript-eslint/consistent-type-imports": [
      "error",
      {
        prefer: "type-imports",
        fixStyle: "inline-type-imports",
      },
    ],
    "@typescript-eslint/consistent-type-definitions": ["error", "type"],
    
    // Import sorting and unused imports
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
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
    
    // React specific rules
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
    "react/display-name": "error",
    "react/jsx-key": "error",
    "react/jsx-no-duplicate-props": "error",
    "react/jsx-no-undef": "error",
    "react/jsx-uses-react": "off",
    "react/jsx-uses-vars": "error",
    "react/no-children-prop": "error",
    "react/no-danger-with-children": "error",
    "react/no-deprecated": "error",
    "react/no-direct-mutation-state": "error",
    "react/no-find-dom-node": "error",
    "react/no-is-mounted": "error",
    "react/no-render-return-value": "error",
    "react/no-string-refs": "error",
    "react/no-unescaped-entities": "error",
    "react/no-unknown-property": "error",
    "react/require-render-return": "error",
    "react/self-closing-comp": "error",
    
    // React Hooks rules
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    
    // Accessibility rules
    "jsx-a11y/alt-text": "error",
    "jsx-a11y/anchor-has-content": "error",
    "jsx-a11y/anchor-is-valid": "error",
    "jsx-a11y/aria-activedescendant-has-tabindex": "error",
    "jsx-a11y/aria-props": "error",
    "jsx-a11y/aria-proptypes": "error",
    "jsx-a11y/aria-role": "error",
    "jsx-a11y/aria-unsupported-elements": "error",
    "jsx-a11y/heading-has-content": "error",
    "jsx-a11y/iframe-has-title": "error",
    "jsx-a11y/img-redundant-alt": "error",
    "jsx-a11y/no-access-key": "error",
    "jsx-a11y/no-distracting-elements": "error",
    "jsx-a11y/no-redundant-roles": "error",
    "jsx-a11y/role-has-required-aria-props": "error",
    "jsx-a11y/role-supports-aria-props": "error",
    "jsx-a11y/scope": "error",
    
    // General code quality rules
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "no-debugger": "error",
    "no-duplicate-imports": "error",
    "no-unused-expressions": "error",
    "prefer-const": "error",
    "no-var": "error",
    "object-shorthand": "error",
    "prefer-arrow-callback": "error",
    "prefer-template": "error",
    "template-curly-spacing": "error",
    "arrow-spacing": "error",
    "comma-dangle": ["error", "always-multiline"],
    "semi": ["error", "never"],
    "quotes": ["error", "single", { avoidEscape: true }],
    "jsx-quotes": ["error", "prefer-double"],
    
    // Next.js specific rules
    "@next/next/no-img-element": "error",
    "@next/next/no-page-custom-font": "error",
    "@next/next/no-unwanted-polyfillio": "error",
  },
  overrides: [
    {
      files: ["*.js", "*.jsx"],
      rules: {
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-return": "off",
      },
    },
    {
      files: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx"],
      env: {
        jest: true,
      },
      rules: {
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
      },
    },
  ],
  ignorePatterns: [
    "node_modules/",
    ".next/",
    "out/",
    "dist/",
    "build/",
    "*.config.js",
    "*.config.ts",
  ],
}