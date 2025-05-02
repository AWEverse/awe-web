import { MLKEM } from "../crypto/ml-kem";
import { KeyBundle } from "../types";
import { X3DHError } from "./errors";
import { MLKEM_VERSION } from "../config";
import { Ed25519 } from "../../curves/ed25519";
import { X25519 } from "../../curves/x25519";

// Define ML-KEM variant configurations (same as in MLKEM class)
const MLKEM_VARIANTS = {
  "512": { publicKeyLength: 800 },
  "768": { publicKeyLength: 1184 },
  "1024": { publicKeyLength: 1568 },
};

/**
 * Generates a hybrid key bundle for the X3DH+PQ protocol.
 * @param includeOneTimePreKeys - Whether to generate one-time pre-keys (default: true).
 * @returns Promise resolving to a KeyBundle containing Ed25519, X25519, and ML-KEM key pairs.
 * @throws X3DHError if key generation or signing fails.
 */
export async function generateKeyBundle(
  includeOneTimePreKeys: boolean = true,
): Promise<KeyBundle> {
  try {
    // Validate MLKEM_VERSION
    if (!MLKEM_VARIANTS[MLKEM_VERSION]) {
      throw new Error(
        `Invalid MLKEM_VERSION: ${MLKEM_VERSION}. Must be '512', '768', or '1024'.`,
      );
    }
    const expectedPqKeyLength = MLKEM_VARIANTS[MLKEM_VERSION].publicKeyLength;

    // Generate Ed25519 and X25519 key pairs in parallel
    const [identityKey, identityKeyX25519, signedPreKeyPair] =
      await Promise.all([
        Ed25519.generateKeyPair(), // Ed25519 identity key
        X25519.generateKeyPair(), // X25519 identity key
        X25519.generateKeyPair(), // X25519 signed pre-key
      ]);

    // Sign the X25519 signed pre-key's public key
    const signature = await Ed25519.sign(
      signedPreKeyPair.publicKey,
      identityKey.privateKey,
    );

    // Generate one-time pre-key (optional)
    const oneTimePreKey = includeOneTimePreKeys
      ? await X25519.generateKeyPair()
      : undefined;

    // Generate ML-KEM key pairs in parallel
    const [pqIdentityKey, pqSignedPreKey, pqOneTimePreKey] = await Promise.all([
      MLKEM.generateKeyPair(MLKEM_VERSION), // PQ identity key
      MLKEM.generateKeyPair(MLKEM_VERSION), // PQ signed pre-key
      includeOneTimePreKeys
        ? MLKEM.generateKeyPair(MLKEM_VERSION)
        : Promise.resolve(undefined), // PQ one-time pre-key
    ]);

    // Validate key lengths
    const errors: string[] = [];
    if (identityKey.publicKey.length !== 32) {
      errors.push(
        `identityKey.publicKey length: ${identityKey.publicKey.length}, expected 32`,
      );
    }
    if (identityKeyX25519.publicKey.length !== 32) {
      errors.push(
        `identityKeyX25519.publicKey length: ${identityKeyX25519.publicKey.length}, expected 32`,
      );
    }
    if (signedPreKeyPair.publicKey.length !== 32) {
      errors.push(
        `signedPreKeyPair.publicKey length: ${signedPreKeyPair.publicKey.length}, expected 32`,
      );
    }
    if (signature.length !== 64) {
      errors.push(`signature length: ${signature.length}, expected 64`);
    }
    if (oneTimePreKey && oneTimePreKey.publicKey.length !== 32) {
      errors.push(
        `oneTimePreKey.publicKey length: ${oneTimePreKey.publicKey.length}, expected 32`,
      );
    }
    if (pqIdentityKey.publicKey.length !== expectedPqKeyLength) {
      errors.push(
        `pqIdentityKey.publicKey length: ${pqIdentityKey.publicKey.length}, expected ${expectedPqKeyLength}`,
      );
    }
    if (pqSignedPreKey.publicKey.length !== expectedPqKeyLength) {
      errors.push(
        `pqSignedPreKey.publicKey length: ${pqSignedPreKey.publicKey.length}, expected ${expectedPqKeyLength}`,
      );
    }
    if (
      pqOneTimePreKey &&
      pqOneTimePreKey.publicKey.length !== expectedPqKeyLength
    ) {
      errors.push(
        `pqOneTimePreKey.publicKey length: ${pqOneTimePreKey.publicKey.length}, expected ${expectedPqKeyLength}`,
      );
    }

    if (errors.length > 0) {
      throw new Error(`Generated key has invalid length: ${errors.join("; ")}`);
    }

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
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new X3DHError(
      `Failed to generate key bundle: ${errorMessage}`,
      "KEY_BUNDLE_GENERATION_FAILED",
    );
  }
}
