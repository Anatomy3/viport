/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["@viport/config-eslint"],
  ignorePatterns: [
    "apps/**",
    "packages/**",
    "services/**",
  ],
  overrides: [
    {
      files: ["*.config.js", "*.config.ts"],
      env: {
        node: true,
      },
    },
  ],
};