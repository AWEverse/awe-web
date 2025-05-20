declare const APP_VERSION: string;
declare const APP_REVISION: string;
declare const process: NodeJS.Process;
declare const __DEV__: boolean;
declare const __PROD__: boolean;
declare const __TEST__: boolean;

declare namespace React {
  namespace JSX {
    interface IntrinsicElements {
      "em-emoji": {
        id?: string;
        shortcodes?: string;
        native?: string;
        skin?: 1 | 2 | 3 | 4 | 5 | 6;
        size?: number | string;
        set?: 'native' | 'apple' | 'facebook' | 'google' | 'twitter';
        fallback?: string;
      };
    }
  }
}


/** CSS module classes */
type CSSModuleClasses = { readonly [key: string]: string };

/** CSS modules */
declare module '*.module.(css|scss|sass|less|styl|stylus|pcss|sss)' {
  const classes: CSSModuleClasses;
  export default classes;
}

/** Non-module CSS */
declare module '*.(css|scss|sass|less|styl|stylus|pcss|sss)' { }

/** Assets */
type AssetSrc = string;
declare module '*.(apng|png|jpg|jpeg|jfif|pjpeg|pjp|gif|svg|ico|webp|avif|mp4|webm|ogg|mp3|wav|flac|aac|opus|mov|m4a|vtt|woff|woff2|eot|ttf|otf|webmanifest|pdf|txt)' {
  const src: AssetSrc;
  export default src;
}

/** Query-based assets */
declare module '*?(raw|url|inline)' {
  const src: AssetSrc;
  export default src;
}

/** WASM module with initialization */
declare module '*.wasm?init' {
  const initWasm: (options?: WebAssembly.Imports) => Promise<WebAssembly.Instance>;
  export default initWasm;
}

/** Worker types */
type WorkerConstructor<T extends Worker | SharedWorker> = {
  new(options?: { name?: string }): T;
};

declare module '*?(worker|sharedworker)&inline' {
  const constructor: WorkerConstructor<Worker> | WorkerConstructor<SharedWorker> | string;
  export default constructor;
}
declare module '*?(worker|sharedworker)&url' {
  const constructor: WorkerConstructor<Worker> | WorkerConstructor<SharedWorker> | string;
  export default constructor;
}
declare module '*?(worker|sharedworker)' {
  const constructor: WorkerConstructor<Worker> | WorkerConstructor<SharedWorker> | string;
  export default constructor;
}
