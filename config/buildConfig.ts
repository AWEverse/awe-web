import { BuildOptions } from 'vite';
import { NO_MINIFY } from './constants';
import { serverOptions } from './utils';

const group_chunks = ['src/entities/ReportModal.tsx'];

export default {
  target: 'es2020',
  sourcemap: true,
  assetsDir: '',
  copyPublicDir: false,
  emptyOutDir: true,
  minify: NO_MINIFY,
  rollupOptions: {
    treeshake: true,
    output: {
      sourcemapIgnoreList: serverOptions.sourcemapIgnoreList,
      manualChunks: (id: string) => {
        const is_group_chunk = group_chunks.some(partialPath => id.includes(partialPath));

        if (is_group_chunk) {
          return 'general';
        }
      },
    },
  },
} as BuildOptions;
