import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginJsxA11y from "eslint-plugin-jsx-a11y";
import boundaries from "eslint-plugin-boundaries";
import importPlugin from "eslint-plugin-import";

/** @type {import("eslint").Linter.Config[]} */
export default [
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
            "**/core/**",
            "**/utils/**",
            "**/infra/**",
            "**/domain/**",
          ],
        },
      ],

      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@entities/*/*", "!@entities/*/index"],
              message: "Import via public API (index.ts) only.",
            },
            {
              group: ["@features/*/*", "!@features/*/index"],
              message: "Import via public API (index.ts) only.",
            },
            {
              group: ["@widgets/*/*", "!@widgets/*/index"],
              message: "Import via public API (index.ts) only.",
            },
          ],
        },
      ],

      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          rules: [
            // core - самый базовый, нельзя импортировать ничего кроме себя
            {
              from: "core",
              disallow: [
                "utils",
                "infra",
                "domain",
                "shared",
                "entities",
                "features",
                "widgets",
                "pages",
                "app",
              ],
            },

            // utils могут импортировать core, но не infra/domain
            { from: "utils", allow: ["core", "utils"] },
            {
              from: "utils",
              disallow: [
                "infra",
                "domain",
                "shared",
                "entities",
                "features",
                "widgets",
                "pages",
                "app",
              ],
            },

            // infra может импортировать core и utils
            { from: "infra", allow: ["core", "utils", "infra"] },
            {
              from: "infra",
              disallow: [
                "domain",
                "shared",
                "entities",
                "features",
                "widgets",
                "pages",
                "app",
              ],
            },

            // domain может использовать core/utils/infra
            { from: "domain", allow: ["core", "utils", "infra", "domain"] },

            // старые слои (FSD)
            {
              from: "shared",
              allow: ["core", "utils", "infra", "domain", "shared"],
            },
            {
              from: "entities",
              allow: ["shared", "core", "utils", "infra", "domain", "entities"],
            },
            {
              from: "features",
              allow: [
                "shared",
                "entities",
                "features",
                "core",
                "utils",
                "infra",
                "domain",
              ],
            },
            {
              from: "widgets",
              allow: [
                "shared",
                "entities",
                "features",
                "widgets",
                "core",
                "utils",
                "infra",
                "domain",
              ],
            },
            {
              from: "pages",
              allow: [
                "shared",
                "entities",
                "features",
                "widgets",
                "pages",
                "core",
                "utils",
                "infra",
                "domain",
              ],
            },
            {
              from: "app",
              allow: [
                "shared",
                "entities",
                "features",
                "widgets",
                "pages",
                "app",
                "core",
                "utils",
                "infra",
                "domain",
              ],
            },
            { from: "composers", disallow: ["*"] }, // special isolated layer
          ],
        },
      ],
    },
  },
];
