export const APP_CODE_NAME = 'A';
export const APP_SHORT_CODE_NAME = 'a';
export const APP_NAME = process.env.APP_NAME || `AWE ${APP_SHORT_CODE_NAME}`;
export const RELEASE_DATETIME = process.env.RELEASE_DATETIME;

export const PRODUCTION_HOSTNAME = 'web.awe.com';
export const PRODUCTION_URL = `https://web.awe.com/APP_SHORT_CODE_NAME`;
export const WEB_VERSION_BASE = 'https://web.awe.com/';
export const BASE_URL = process.env.BASE_URL;

export const IS_MOCKED_CLIENT = process.env.APP_MOCKED_CLIENT === '1';
export const IS_TEST = process.env.APP_ENV === 'test';
export const IS_PERF = process.env.APP_ENV === 'perf';
export const IS_BETA = process.env.APP_ENV === 'staging';
export const IS_PACKAGED_ELECTRON = process.env.IS_PACKAGED_ELECTRON;

export const DEBUG = process.env.APP_ENV !== 'production';
export const DEBUG_MORE = false;
export const DEBUG_LOG_FILENAME = 'web-awe-log.json';
export const STRICTERDOM_ENABLED = DEBUG;

export const PAGE_TITLE = process.env.APP_TITLE!;
export const INACTIVE_MARKER = '[Inctv]';
