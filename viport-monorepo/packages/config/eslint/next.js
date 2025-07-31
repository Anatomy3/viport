/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    "./base.js",
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
  },
  rules: {
    // React rules
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react/display-name": "off",
    "react/jsx-key": ["error", { checkFragmentShorthand: true }],
    "react/jsx-no-target-blank": ["error", { allowReferrer: true }],
    
    // React Hooks rules
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    
    // Accessibility rules
    "jsx-a11y/alt-text": "warn",
    "jsx-a11y/anchor-has-content": "warn",
    "jsx-a11y/anchor-is-valid": "warn",
    
    // Tailwind rules
    "tailwindcss/classnames-order": "warn",
    "tailwindcss/no-custom-classname": "off",
    "tailwindcss/no-contradicting-classname": "error",
    
    // Import rules
    "import/order": [
      "warn",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
        ],
        "newlines-between": "always",
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
      },
    ],
  },
  overrides: [
    {
      files: ["**/*.stories.*"],
      rules: {
        "import/no-anonymous-default-export": "off",
      },
    },
  ],
};