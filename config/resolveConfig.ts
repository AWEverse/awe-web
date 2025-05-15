import path, { resolve } from 'path';
import { ResolveOptions } from 'vite';

export default {
  alias: {
    '@': path.resolve(__dirname, '..', 'src'),
  },
  extensions: ['.js', '.jsx', '.ts', '.tsx'],
} as ResolveOptions;
