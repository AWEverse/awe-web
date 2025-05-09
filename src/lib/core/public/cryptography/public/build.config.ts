import { BuildOptions } from "@/lib/engine/configs/types.config";

export default {
  target: "es2022",
  external: ["libsodium-wrappers"],
  divides: ["public", "private", "internal"],
  entry: "..",
  features: ["PQ", "XChaCha20"],
  crypto: {
    path: "",
    modules: [
      "crypto_sign_ed25519_sk_to_curve25519",
      "memzero",
      "crypto_sign_keypair",
      "crypto_scalarmult_base",
    ],
  },
} satisfies BuildOptions;
