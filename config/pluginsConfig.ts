import { PluginOption } from "vite";
import react from "@vitejs/plugin-react-swc";
import { visualizer } from "rollup-plugin-visualizer";
import basicSsl from "@vitejs/plugin-basic-ssl";
import { USE_SSL, SSL_CONFIG } from "./constants";
import ConditionalCompile from "vite-plugin-conditional-compiler";
import dynamicImport from 'vite-plugin-dynamic-import'
import terser from '@rollup/plugin-terser';

const ssl = () => (USE_SSL ? basicSsl(SSL_CONFIG) : undefined);

export default [
  react(),
  terser(),
  visualizer({
    open: true,
    gzipSize: true,
    template: "treemap",
    filename: "dist/stats.html",
  }),
  ConditionalCompile(),
] as PluginOption[];
