import { CSSOptions } from "vite";
import autoprefixer from "autoprefixer";

export default {
  devSourcemap: true,
  postcss: {
    plugins: [
      autoprefixer({}), 
    ],
  },
} as CSSOptions;
