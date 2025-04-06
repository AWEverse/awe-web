import { defineConfig } from 'vite';
import { pluginsConfig, buildConfig, resolveConfig } from './config';
import { serverOptions, defineOptions } from './config/utils';

export default defineConfig({
  base: '',
  build: buildConfig,
  define: defineOptions,
  plugins: pluginsConfig,
  resolve: resolveConfig,
  server: serverOptions,
});
