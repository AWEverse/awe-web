import { BuildOptions } from "vite";
import { resolve } from "path";

const srcDir = resolve(__dirname, "./src");

console.log(srcDir)

export default (mode: string) => ({
  target: "es2020",
  sourcemap: true,
  assetsDir: "",
  copyPublicDir: false,
  emptyOutDir: true,
  minify: mode === "production" ? "terser" : false,
  rollupOptions: {
    output: {
      format: "cjs",
      entryFileNames: "[name].js",
      chunkFileNames: "[name]-[hash].js",
      assetFileNames: "[name]-[hash].[ext]",

      manualChunks(id) {
        if (id.includes("shared")) return "shared";
        if (id.includes("entities")) return "entities";
        if (id.includes("pages")) return "pages";
        if (id.includes("lib")) return "lib";
        if (id.includes("store")) return "store";
        if (id.includes("widgets")) return "widgets";

        if (id.includes("app")) return "app";
        if (id.includes("config")) return "config";
        if (id.includes("types")) return "types";
        if (id.includes("hooks")) return "hooks";

        if (id.includes("node_modules")) return "vendor";
        if (id.includes("assets")) return "assets";

        return undefined;
      },
    },
  },
} as BuildOptions);
