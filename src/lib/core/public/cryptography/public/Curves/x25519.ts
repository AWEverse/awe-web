import {
  crypto_scalarmult_base,
  crypto_scalarmult,
  randombytes_buf
} from "libsodium-wrappers";
import { CONSTANTS } from "../utils/cryptoUtils";

export class X25519 {
  /**
   * Generates a new X25519 key pair
   * @returns Object containing public and private keys
   */
  public static generateKeyPair(): { publicKey: Uint8Array; privateKey: Uint8Array } {
    const privateKey = randombytes_buf(CONSTANTS.KEY_LENGTH);
    const publicKey = crypto_scalarmult_base(privateKey);

    return { publicKey, privateKey };
  }

  /**
   * Performs X25519 scalar multiplication
   * @param privateKey Private key for multiplication
   * @param publicKey Public key for multiplication
   * @returns Resulting shared secret
   */
  public static sharedSecret(privateKey: Uint8Array, publicKey: Uint8Array): Uint8Array {
    return crypto_scalarmult(privateKey, publicKey);
  }
}
