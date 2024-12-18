import * as babel from '@babel/core';

interface BabelPluginOptions {
  config?: babel.TransformOptions;
  filter?: RegExp;
}

const DEFAULT_FILTER = /\.(jsx?|vue)$/;

const babelPlugin = (options: BabelPluginOptions = {}) => {
  console.info('[vite-plugin-babel] Loading vite-plugin-babel with options:', options);

  return {
    name: 'vite-plugin-babel',
    enforce: 'post',
    transform: (src: string, id: string) => {
      console.info(`[vite-plugin-babel] Transforming file ${id}...`);
      const config: babel.TransformOptions = options.config || {};
      const filter: RegExp = options.filter || DEFAULT_FILTER;

      if (filter.test(id)) {
        config.filename = id;
        console.info(`[vite-plugin-babel] The file ${id} will be transformed with config:`, config);
        return babel.transform(src, config);
      }
      return null;
    },
    buildEnd: () => {
      console.info('[vite-plugin-babel] The build process is finished.');
    },
  };
};

export default babelPlugin;
