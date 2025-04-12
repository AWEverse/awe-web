
import { MLKEM } from "../crypto/ml-kem";
import { KeyBundle } from "../types";
import { X3DHError } from "./errors";
import { MLKEM_VERSION } from "../config";
import { Ed25519 } from "../../curves/ed25519";
import { X25519 } from "../../curves/x25519";

/** Generates a key bundle for X3DH+PQ */
export async function generateKeyBundle(): Promise<KeyBundle> {
  try {
    const identityKey = await Ed25519.generateKeyPair();
    const identityKeyX25519 = await X25519.generateKeyPair();
    const signedPreKeyPair = await X25519.generateKeyPair();
    const signature = await Ed25519.sign(signedPreKeyPair.publicKey, identityKey.privateKey);
    const oneTimePreKey = await X25519.generateKeyPair();
    const pqIdentityKey = MLKEM.generateKeyPair(MLKEM_VERSION);
    const pqSignedPreKey = MLKEM.generateKeyPair(MLKEM_VERSION);
    const pqOneTimePreKey = MLKEM.generateKeyPair(MLKEM_VERSION);

    return {
      identityKey,
      identityKeyX25519,
      signedPreKey: { keyPair: signedPreKeyPair, signature },
      oneTimePreKey,
      pqIdentityKey,
      pqSignedPreKey,
      pqOneTimePreKey,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    throw new X3DHError(`Failed to generate key bundle: ${errorMessage}`, "KEY_BUNDLE_GENERATION_FAILED");
  }
}
