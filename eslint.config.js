import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginJsxA11y from "eslint-plugin-jsx-a11y";
import boundaries from "eslint-plugin-boundaries";
import importPlugin from "eslint-plugin-import";

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  // Base JS/TS + React rules
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginReactHooks.configs.recommended,
  pluginJsxA11y.configs.recommended,

  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      globals: globals.browser,
    },
    settings: {
      react: { version: "detect" },
      "import/resolver": { typescript: {} },
    },
    plugins: {
      boundaries,
      import: importPlugin,
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "warn",
      semi: "error",
      "prefer-const": "error",
      "no-var": "error",
      "react/react-in-jsx-scope": "off",
      "react/jsx-filename-extension": ["warn", { extensions: [".ts", ".tsx"] }],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/anchor-is-valid": "error",

      // Import constraints
      "import/no-internal-modules": [
        "error",
        {
          allow: [
            "**/shared/**",
            "**/entities/**",
            "**/features/**",
            "**/widgets/**",
            "**/pages/**",
            "**/app/**",
          ],
        },
      ],

      // Boundaries rules for FSD + composers
      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          rules: [
            {
              from: "shared",
              disallow: [
                "shared",
                "entities",
                "features",
                "widgets",
                "pages",
                "app",
                "composers",
              ],
            },
            { from: "entities", allow: ["shared", "entities", "composers"] },
            {
              from: "entities",
              disallow: ["features", "widgets", "pages", "app"],
            },
            {
              from: "features",
              allow: ["shared", "entities", "features", "composers"],
            },
            { from: "features", disallow: ["widgets", "pages", "app"] },
            {
              from: "widgets",
              allow: ["shared", "entities", "features", "widgets", "composers"],
            },
            { from: "widgets", disallow: ["pages", "app"] },
            {
              from: "pages",
              allow: ["shared", "entities", "features", "widgets", "pages"],
            },
            { from: "pages", disallow: ["app", "composers"] },
            {
              from: "app",
              allow: [
                "shared",
                "entities",
                "features",
                "widgets",
                "pages",
                "app",
              ],
            },
            { from: "app", disallow: ["composers"] },
            {
              from: "composers",
              disallow: [
                "shared",
                "entities",
                "features",
                "widgets",
                "pages",
                "app",
                "composers",
              ],
            },
          ],
        },
      ],

      // Restrict deep imports bypassing public API
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@entities/*/*", "!@entities/*/index"],
              message: "Import is only allowed via public API (index.ts)",
            },
            {
              group: ["@features/*/*", "!@features/*/index"],
              message: "Import is only allowed via public API (index.ts)",
            },
            {
              group: ["@widgets/*/*", "!@widgets/*/index"],
              message: "Import is only allowed via public API (index.ts)",
            },
          ],
        },
      ],
    },
  },
];
