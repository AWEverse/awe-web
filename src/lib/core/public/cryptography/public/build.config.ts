export default {
  target: "es2022",
  external: ["libsodium-wrappers"],
  entry: "./src/index.ts",
  features: ["PQ", "XChaCha20"],
};
