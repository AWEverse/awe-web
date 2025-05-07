import { MLKEM } from "../crypto/ml-kem";
import { KeyBundle } from "../types";
import { X3DHError } from "./errors";
import { MLKEM_VERSION } from "../config";
import { Ed25519 } from "../../public/Curves/ed25519";
import { X25519 } from "../../public/Curves/x25519";


/** Generates a hybrid key bundle for use in X3DH+PQ protocol */
export async function generateKeyBundle(): Promise<KeyBundle> {
  try {
    const [
      identityKey,
      identityKeyX25519,
      signedPreKeyPair,
      oneTimePreKey
    ] = await Promise.all([
      Ed25519.generateKeyPair(),
      X25519.generateKeyPair(),
      X25519.generateKeyPair(),
      X25519.generateKeyPair()
    ]);

    const signature = await Ed25519.sign(signedPreKeyPair.publicKey, identityKey.privateKey);

    const [
      pqIdentityKey,
      pqSignedPreKey,
      pqOneTimePreKey
    ] = await Promise.all([
      MLKEM.generateKeyPair(MLKEM_VERSION),
      MLKEM.generateKeyPair(MLKEM_VERSION),
      MLKEM.generateKeyPair(MLKEM_VERSION)
    ]);

    return {
      identityKey,
      identityKeyX25519,
      signedPreKey: { keyPair: signedPreKeyPair, signature },
      oneTimePreKey,
      pqIdentityKey,
      pqSignedPreKey,
      pqOneTimePreKey
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new X3DHError(`Failed to generate key bundle: ${errorMessage}`, "KEY_BUNDLE_GENERATION_FAILED");
  }
}
