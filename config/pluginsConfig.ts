import { PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import basicSsl from "@vitejs/plugin-basic-ssl";
import { USE_SSL, SSL_CONFIG } from "./constants";
import ConditionalCompile from "vite-plugin-conditional-compiler";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

const ssl = () => (USE_SSL ? basicSsl(SSL_CONFIG) : undefined);

export default [
  react(),
  // TanStackRouterVite({
  //   autoCodeSplitting: true,
  //   routeFilePrefix: "~",
  //   routeFileIgnorePrefix: "-",
  //   routesDirectory: "../src/app/routes",
  //   generatedRouteTree: "../src/app/routes/schema/routeTree.gen.ts"
  // }),
  visualizer({
    open: true,
    gzipSize: true,
    template: "treemap",
    filename: "public/stats.html",
  }),
  ConditionalCompile(),
  tailwindcss(),
] as PluginOption[];
