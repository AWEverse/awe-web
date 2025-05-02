import * as sodium from 'libsodium-wrappers';
import { MLKEM } from "../crypto/ml-kem";
import { concatUint8Arrays } from "../utils/arrays";
import {
  PROTOCOL_VERSION,
  HKDF_INFO,
  MLKEM_VERSION,
  DH_OUTPUT_SIZE,
  KEY_LENGTH,
  MLKEM_SS_SIZE,
} from "../config";
import { KeyBundle, InitialMessage } from "../types";
import { X3DHError } from "./errors";
import { validateInitialMessage } from "../utils/validation";
import { wipeBytes } from "../../secure";
import { PublicKey } from '../../types';

/**
 * Computes the sender's shared secret and initial message for X3DH+PQ protocol.
 * @param senderBundle - Sender's key bundle (identity keys, X25519 keys).
 * @param recipientBundle - Recipient's key bundle (identity, signed pre-key, optional one-time pre-key, ML-KEM keys).
 * @returns Promise resolving to { sharedSecret: Uint8Array, initialMessage: InitialMessage }.
 * @throws X3DHError if computation fails.
 */
export async function computeSenderSharedSecret(
  senderBundle: KeyBundle,
  recipientBundle: KeyBundle
): Promise<{ sharedSecret: Uint8Array; initialMessage: InitialMessage }> {
  await sodium.ready;

  try {
    // Verify signed pre-key signature
    if (
      !sodium.crypto_sign_verify_detached(
        recipientBundle.signedPreKey.signature,
        recipientBundle.signedPreKey.keyPair.publicKey,
        recipientBundle.identityKey.publicKey
      )
    ) {
      throw new X3DHError("Invalid signed pre-key signature", "SIGNATURE_VERIFICATION_FAILED");
    }

    // Generate ephemeral key pairs
    const ephemeralKeyEC = sodium.crypto_kx_keypair();
    const ephemeralKeyPQ = await MLKEM.generateKeyPair(MLKEM_VERSION);

    // Determine prekey usage
    const hasOneTimePrekey = !!recipientBundle.oneTimePreKey;
    const hasPQOneTimePrekey = !!recipientBundle.pqOneTimePreKey;

    // Calculate combined array length
    const combinedLength =
      DH_OUTPUT_SIZE * 3 + // DH1, DH2, DH3
      (hasOneTimePrekey ? DH_OUTPUT_SIZE : 0) + // DH4
      MLKEM_SS_SIZE * 2 + // PQ1, PQ2
      (hasPQOneTimePrekey ? MLKEM_SS_SIZE : 0); // PQ3
    const combined = new Uint8Array(combinedLength);

    // Initialize PQ encapsulations
    const pqEncapsulations: InitialMessage["pqEncapsulations"] = {
      identity: new Uint8Array(0),
      signedPreKey: new Uint8Array(0),
    };

    // Perform key exchanges in parallel
    const [dh1, dh2, dh3, dh4, pq1, pq2, pq3] = await Promise.all([
      // DH1: IK_A (X25519) x SPK_B
      sodium.crypto_kx_client_session_keys(
        senderBundle.identityKeyX25519.publicKey,
        senderBundle.identityKeyX25519.privateKey,
        recipientBundle.signedPreKey.keyPair.publicKey
      ).sharedRx,
      // DH2: EK_A x IK_B (X25519)
      sodium.crypto_kx_client_session_keys(
        ephemeralKeyEC.publicKey,
        ephemeralKeyEC.privateKey,
        recipientBundle.identityKeyX25519.publicKey
      ).sharedRx,
      // DH3: EK_A x SPK_B
      sodium.crypto_kx_client_session_keys(
        ephemeralKeyEC.publicKey,
        ephemeralKeyEC.privateKey,
        recipientBundle.signedPreKey.keyPair.publicKey
      ).sharedRx,
      // DH4: EK_A x OPK_B (if available)
      hasOneTimePrekey
        ? sodium.crypto_kx_client_session_keys(
          ephemeralKeyEC.publicKey,
          ephemeralKeyEC.privateKey,
          recipientBundle.oneTimePreKey!.publicKey
        ).sharedRx
        : new Uint8Array(0),
      // PQ1: Encapsulate to PQ IK_B
      MLKEM.encapsulate(recipientBundle.pqIdentityKey.publicKey, MLKEM_VERSION),
      // PQ2: Encapsulate to PQ SPK_B
      MLKEM.encapsulate(recipientBundle.pqSignedPreKey.publicKey, MLKEM_VERSION),
      // PQ3: Encapsulate to PQ OPK_B (if available)
      hasPQOneTimePrekey
        ? MLKEM.encapsulate(recipientBundle.pqOneTimePreKey!.publicKey, MLKEM_VERSION)
        : { sharedSecret: new Uint8Array(0), cipherText: new Uint8Array(0) },
    ]);

    // Combine results into single array
    let offset = 0;
    if (dh1.length) combined.set(dh1, offset), offset += dh1.length;
    if (dh2.length) combined.set(dh2, offset), offset += dh2.length;
    if (dh3.length) combined.set(dh3, offset), offset += dh3.length;
    if (dh4.length) combined.set(dh4, offset), offset += dh4.length;
    pqEncapsulations.identity = pq1.cipherText;
    combined.set(pq1.sharedSecret, offset), offset += pq1.sharedSecret.length;
    pqEncapsulations.signedPreKey = pq2.cipherText;
    combined.set(pq2.sharedSecret, offset), offset += pq2.sharedSecret.length;
    if (hasPQOneTimePrekey) {
      pqEncapsulations.oneTimePreKey = pq3.cipherText;
      combined.set(pq3.sharedSecret, offset);
    }

    // Compute salt (IK_A || EK_A)
    const salt = concatUint8Arrays([senderBundle.identityKey.publicKey, ephemeralKeyEC.publicKey]);

    // Derive shared secret using HKDF
    const sharedSecret = sodium.crypto_kdf_derive_from_key(
      KEY_LENGTH,
      0,
      HKDF_INFO,
      sodium.crypto_generichash(32, combined, salt)
    );

    // Construct initial message
    const initialMessage: InitialMessage = {
      version: PROTOCOL_VERSION,
      ephemeralKeyEC: ephemeralKeyEC.publicKey as PublicKey,
      ephemeralKeyPQ: ephemeralKeyPQ.publicKey,
      senderIdentityKey: senderBundle.identityKey.publicKey,
      senderIdentityKeyX25519: senderBundle.identityKeyX25519.publicKey,
      pqEncapsulations,
    };

    // Validate initial message
    validateInitialMessage(initialMessage);

    // Securely erase sensitive data
    wipeBytes(ephemeralKeyEC.privateKey, ephemeralKeyPQ.privateKey, combined, salt);

    return { sharedSecret, initialMessage };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    throw new X3DHError(`Sender shared secret computation failed: ${errorMessage}`, "SENDER_SHARED_SECRET_FAILED");
  }
}
