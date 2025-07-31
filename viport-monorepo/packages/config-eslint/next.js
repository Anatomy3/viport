/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    "./index.js",
    "next/core-web-vitals",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:tailwindcss/recommended",
  ],
  plugins: ["react", "react-hooks", "jsx-a11y", "tailwindcss"],
  settings: {
    react: {
      version: "detect",
    },
    tailwindcss: {
      callees: ["cn", "cva"],
      config: "tailwind.config.js",
    },
  },
  rules: {
    // React
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react/no-unescaped-entities": "off",
    "react/display-name": "off",
    "react/jsx-key": "error",
    "react/jsx-no-duplicate-props": "error",
    "react/jsx-no-undef": "error",
    "react/jsx-uses-react": "off",
    "react/jsx-uses-vars": "error",
    "react/no-children-prop": "error",
    "react/no-danger-with-children": "error",
    "react/no-deprecated": "error",
    "react/no-direct-mutation-state": "error",
    "react/require-render-return": "error",
    "react/style-prop-object": "error",
    
    // React Hooks
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    
    // Accessibility
    "jsx-a11y/alt-text": "error",
    "jsx-a11y/anchor-has-content": "error",
    "jsx-a11y/anchor-is-valid": "error",
    "jsx-a11y/click-events-have-key-events": "warn",
    "jsx-a11y/no-static-element-interactions": "warn",
    "jsx-a11y/role-has-required-aria-props": "error",
    
    // Tailwind CSS
    "tailwindcss/classnames-order": "warn",
    "tailwindcss/enforces-negative-arbitrary-values": "warn",
    "tailwindcss/enforces-shorthand": "warn",
    "tailwindcss/migration-from-tailwind-2": "warn",
    "tailwindcss/no-arbitrary-value": "off",
    "tailwindcss/no-custom-classname": "off",
    "tailwindcss/no-contradicting-classname": "error",
    
    // Next.js specific
    "@next/next/no-img-element": "error",
    "@next/next/no-html-link-for-pages": "error",
    "@next/next/no-document-import-in-page": "error",
    "@next/next/no-head-import-in-document": "error",
  },
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      rules: {
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
      },
    },
    {
      files: ["**/*.stories.*"],
      rules: {
        "import/no-anonymous-default-export": "off",
      },
    },
  ],
};