import * as sodium from 'libsodium-wrappers'; // Pure JS/WASM crypto library [[3]][[10]]
import { MLKEM } from "../crypto/ml-kem"; // Post-quantum KEM implementation [[7]][[8]]
import { concatUint8Arrays } from "../utils/arrays";
import {
  PROTOCOL_VERSION,
  HKDF_INFO,
  MLKEM_VERSION,
  DH_OUTPUT_SIZE,
  KEY_LENGTH,
  MLKEM_SS_SIZE,
} from "../config";
import { KeyBundle, InitialMessage, PublicKey } from "../types";
import { X3DHError } from "./errors";
import { validateBytes, validateInitialMessage, validateKeyPair } from "../utils/validation";
import { wipeBytes } from "../../secure";

/**
 * Computes the sender's shared secret and initial message for X3DH+PQ protocol.
 * Optimized for speed, reliability, and memory safety.
 */
export async function computeSenderSharedSecret(
  senderBundle: KeyBundle,
  recipientBundle: KeyBundle
): Promise<{ sharedSecret: Uint8Array; initialMessage: InitialMessage }> {

  try {
    // Input validation
    if (!senderBundle || !recipientBundle) {
      throw new X3DHError("Invalid key bundles", "INVALID_INPUT");
    }

    // Verify signed pre-key signature (critical for trust) [[8]]
    if (
      !sodium.crypto_sign_verify_detached(
        recipientBundle.signedPreKey.signature,
        recipientBundle.signedPreKey.keyPair.publicKey,
        recipientBundle.identityKey.publicKey
      )
    ) {
      throw new X3DHError("Invalid signed pre-key signature", "SIGNATURE_VERIFICATION_FAILED");
    }

    // Generate ephemeral keys in parallel for speed [[10]]
    const [ephemeralKeyEC, ephemeralKeyPQ] = await Promise.all([
      Promise.resolve(sodium.crypto_kx_keypair()), // Fast X25519 keypair
      MLKEM.generateKeyPair(MLKEM_VERSION), // Post-quantum keypair [[7]]
    ]);

    // Determine prekey usage
    const hasOneTimePrekey = !!recipientBundle.oneTimePreKey;
    const hasPQOneTimePrekey = !!recipientBundle.pqOneTimePreKey;

    // Calculate combined buffer size for shared secrets
    const combinedLength =
      DH_OUTPUT_SIZE * 3 + // DH1, DH2, DH3
      (hasOneTimePrekey ? DH_OUTPUT_SIZE : 0) + // DH4
      MLKEM_SS_SIZE * 2 + // PQ1, PQ2
      (hasPQOneTimePrekey ? MLKEM_SS_SIZE : 0); // PQ3
    const combined = new Uint8Array(combinedLength);

    // Perform all key exchanges in parallel (maximizes speed) [[10]]
    const [dh1, dh2, dh3, dh4, pq1, pq2, pq3] = await Promise.all([
      // Classical DH exchanges
      sodium.crypto_kx_client_session_keys(
        senderBundle.identityKeyX25519.publicKey,
        senderBundle.identityKeyX25519.privateKey,
        recipientBundle.signedPreKey.keyPair.publicKey
      ).sharedRx,
      sodium.crypto_kx_client_session_keys(
        ephemeralKeyEC.publicKey,
        ephemeralKeyEC.privateKey,
        recipientBundle.identityKeyX25519.publicKey
      ).sharedRx,
      sodium.crypto_kx_client_session_keys(
        ephemeralKeyEC.publicKey,
        ephemeralKeyEC.privateKey,
        recipientBundle.signedPreKey.keyPair.publicKey
      ).sharedRx,
      hasOneTimePrekey
        ? sodium.crypto_kx_client_session_keys(
          ephemeralKeyEC.publicKey,
          ephemeralKeyEC.privateKey,
          recipientBundle.oneTimePreKey!.publicKey
        ).sharedRx
        : Promise.resolve(new Uint8Array(0)),
      // Post-quantum encapsulations [[7]][[8]]
      MLKEM.encapsulate(recipientBundle.pqIdentityKey.publicKey, MLKEM_VERSION),
      MLKEM.encapsulate(recipientBundle.pqSignedPreKey.publicKey, MLKEM_VERSION),
      hasPQOneTimePrekey
        ? MLKEM.encapsulate(recipientBundle.pqOneTimePreKey!.publicKey, MLKEM_VERSION)
        : Promise.resolve({ sharedSecret: new Uint8Array(0), cipherText: new Uint8Array(0) }),
    ]);

    // Combine shared secrets into a single buffer
    let offset = 0;
    for (const arr of [dh1, dh2, dh3, dh4, pq1.sharedSecret, pq2.sharedSecret, pq3.sharedSecret]) {
      if (arr.length > 0) {
        combined.set(arr, offset);
        offset += arr.length;
      }
    }

    // Derive final shared secret using HKDF (secure key derivation) [[3]]
    const salt = concatUint8Arrays([senderBundle.identityKey.publicKey, ephemeralKeyEC.publicKey]);
    const sharedSecret = sodium.crypto_kdf_derive_from_key(
      KEY_LENGTH,
      0,
      HKDF_INFO,
      sodium.crypto_generichash(32, combined, salt)
    );

    // Construct initial message (public data only)
    const initialMessage: InitialMessage = {
      version: PROTOCOL_VERSION,
      ephemeralKeyEC: ephemeralKeyEC.publicKey as PublicKey,
      ephemeralKeyPQ: ephemeralKeyPQ.publicKey,
      senderIdentityKey: senderBundle.identityKey.publicKey,
      senderIdentityKeyX25519: senderBundle.identityKeyX25519.publicKey,
      pqEncapsulations: {
        identity: pq1.cipherText,
        signedPreKey: pq2.cipherText,
        oneTimePreKey: hasPQOneTimePrekey ? pq3.cipherText : undefined,
      },
    };

    // Validate output [[8]]
    validateInitialMessage(initialMessage);

    // Securely erase sensitive data (memory safety) [[3]][[10]]
    wipeBytes(
      ephemeralKeyEC.privateKey,
      ephemeralKeyPQ.privateKey,
      dh1, dh2, dh3, dh4,
      pq1.sharedSecret, pq2.sharedSecret, pq3.sharedSecret,
      combined,
      salt
    );

    return { sharedSecret, initialMessage };
  } catch (error) {
    // Sanitize errors to prevent leakage [[8]]
    let errorMessage = "Unknown error";
    if (error instanceof Error && error.message) {
      errorMessage = error.message;
    }
    throw new X3DHError(`Sender shared secret computation failed: ${errorMessage}`, "SENDER_SHARED_SECRET_FAILED");
  }
}
