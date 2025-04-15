import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginJsxA11y from "eslint-plugin-jsx-a11y";

/** @type {import('eslint').Linter.Config} */
export default [
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "warn",
      semi: "error",
      "prefer-const": "error",
      "no-var": "error",
      "react/react-in-jsx-scope": "off", // Disable for React 17+
      "react/jsx-filename-extension": [1, { extensions: [".ts", ".tsx"] }],
      "react-hooks/rules-of-hooks": "error", // Enforce React Hooks rules
      "react-hooks/exhaustive-deps": "warn", // Check Hook dependencies
      "jsx-a11y/alt-text": "error", // Enforce alt text for images
      "jsx-a11y/anchor-is-valid": "error", // Enforce valid anchor tags
    },
    languageOptions: {
      globals: globals.browser,
    },
    settings: {
      react: {
        version: "detect", // Automatically detect React version
      },
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginReact.configs.recommended,
  pluginReactHooks.configs.recommended,
  pluginJsxA11y.configs.recommended,
];
