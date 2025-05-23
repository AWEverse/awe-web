import postcssNested from "postcss-nested";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";

export default {
  plugins: [
    postcssNested,
    autoprefixer,
    ...(process.env.NODE_ENV === "production"
      ? [cssnano({ preset: "default" })]
      : []),
  ],
};
