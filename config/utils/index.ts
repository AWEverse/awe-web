import { ServerOptions } from 'vite';

export const serverOptions = {
  host: '192.168.1.110',
  port: 8080,
  sourcemapIgnoreList(sourcePath: string) {
    return sourcePath.includes('node_modules') || sourcePath.includes('logger');
  },
} as ServerOptions;

export const defineOptions = {
  'process.env': {
    APP_NAME: process.env.APP_NAME || 'AWE Web',
    RELEASE_DATETIME: process.env.RELEASE_DATETIME || '',
    BASE_URL: process.env.BASE_URL || 'http://localhost:3000',
    APP_MOCKED_CLIENT: process.env.APP_MOCKED_CLIENT || '0',
    APP_ENV: process.env.APP_ENV || 'development',
    APP_TITLE: process.env.APP_TITLE || 'AWE Web',
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as Record<string, any>;
