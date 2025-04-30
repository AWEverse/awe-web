import { defineConfig, loadEnv } from 'vite';
import { pluginsConfig, buildConfig, resolveConfig } from './config';
import { serverOptions, defineOptions } from './config/utils';

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");

  return defineConfig({
    base: '',
    plugins: pluginsConfig,
    build: buildConfig(mode),
    define: defineOptions,
    resolve: resolveConfig,
    server: serverOptions,
  });

}
