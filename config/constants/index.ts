export const USE_SSL = false;
export const NO_MINIFY = true;
export const SSL_CONFIG = USE_SSL
  ? {
    name: '192.168.1.110',
    certDir: './certs/',
  }
  : undefined;
