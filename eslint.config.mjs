import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";

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
      "react/react-in-jsx-scope": "off", // Disable the rule for React 17+
      "react/jsx-filename-extension": [1, { extensions: [".ts", ".tsx"] }],
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
];
