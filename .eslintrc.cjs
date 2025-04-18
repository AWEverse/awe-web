module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["boundaries", "import"],
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
  ],
  settings: {
    "import/resolver": {
      typescript: {},
    },
  },
  rules: {
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

    "boundaries/element-types": [
      "error",
      {
        default: "disallow",
        rules: [
          { from: "shared", disallow: ["composers"] },
          { from: "entities", allow: ["shared", "entities", "composers"] },
          {
            from: "features",
            allow: ["shared", "entities", "features", "composers"],
          },
          {
            from: "widgets",
            allow: ["shared", "entities", "features", "widgets", "composers"],
          },
          {
            from: "pages",
            allow: ["shared", "entities", "features", "widgets", "pages"],
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
            ],
          },
        ],
      },
    ],
  },
  overrides: [
    {
      files: ["src/**/*.ts", "src/**/*.tsx"],
      rules: {
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
  ],
};
