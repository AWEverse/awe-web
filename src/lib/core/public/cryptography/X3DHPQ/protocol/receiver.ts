import sodium from "libsodium-wrappers";
import { MLKEM } from "../crypto/ml-kem";
import { KeyBundle, InitialMessage } from "../types";
import { X3DHError } from "./errors";
import { validateInitialMessage } from "../utils/validation";
import { DH_OUTPUT_SIZE, HKDF_INFO, KEY_LENGTH, MLKEM_SS_SIZE, MLKEM_VERSION } from "../config";
import { wipeBytes } from "../../secure";
import { concatUint8Arrays } from "../utils/arrays";

/**
 * Computes the receiver's shared secret for X3DH+PQ protocol.
 * @param receiverBundle - Receiver's key bundle (identity, signed pre-key, optional one-time pre-key, ML-KEM keys).
 * @param message - Sender's initial message (identity keys, ephemeral keys, PQ encapsulations).
 * @returns Promise resolving to a 32-byte shared secret (Uint8Array).
 * @throws X3DHError if computation fails.
 */
export async function computeReceiverSharedSecret(
  receiverBundle: KeyBundle,
  message: InitialMessage
): Promise<Uint8Array> {
  await sodium.ready;

  try {
    // Validate input message
    validateInitialMessage(message);

    // Determine prekey usage
    const hasOneTimePrekey = !!receiverBundle.oneTimePreKey;
    const hasPQOneTimePrekey = !!message.pqEncapsulations.oneTimePreKey && !!receiverBundle.pqOneTimePreKey;

    // Calculate combined array length
    const combinedLength =
      DH_OUTPUT_SIZE * 3 + // DH1, DH2, DH3
      (hasOneTimePrekey ? DH_OUTPUT_SIZE : 0) + // DH4
      MLKEM_SS_SIZE * 2 + // PQ1, PQ2
      (hasPQOneTimePrekey ? MLKEM_SS_SIZE : 0); // PQ3
    const combined = new Uint8Array(combinedLength);

    // Perform key exchanges in parallel
    const [dh1, dh2, dh3, dh4, pq1, pq2, pq3] = await Promise.all([
      // DH1: SPK_B x IK_A (X25519)
      sodium.crypto_kx_server_session_keys(
        receiverBundle.signedPreKey.keyPair.publicKey,
        receiverBundle.signedPreKey.keyPair.privateKey,
        message.senderIdentityKeyX25519
      ).sharedTx,
      // DH2: IK_B x EK_A (X25519)
      sodium.crypto_kx_server_session_keys(
        receiverBundle.identityKeyX25519.publicKey,
        receiverBundle.identityKeyX25519.privateKey,
        message.ephemeralKeyEC
      ).sharedTx,
      // DH3: SPK_B x EK_A (X25519)
      sodium.crypto_kx_server_session_keys(
        receiverBundle.signedPreKey.keyPair.publicKey,
        receiverBundle.signedPreKey.keyPair.privateKey,
        message.ephemeralKeyEC
      ).sharedTx,
      // DH4: OPK_B x EK_A (if available)
      hasOneTimePrekey
        ? sodium.crypto_kx_server_session_keys(
          receiverBundle.oneTimePreKey!.publicKey,
          receiverBundle.oneTimePreKey!.privateKey,
          message.ephemeralKeyEC
        ).sharedTx
        : new Uint8Array(0),
      // PQ1: Decapsulate PQ IK_B
      MLKEM.decapsulate(
        message.pqEncapsulations.identity,
        receiverBundle.pqIdentityKey.privateKey,
        MLKEM_VERSION
      ),
      // PQ2: Decapsulate PQ SPK_B
      MLKEM.decapsulate(
        message.pqEncapsulations.signedPreKey,
        receiverBundle.pqSignedPreKey.privateKey,
        MLKEM_VERSION
      ),
      // PQ3: Decapsulate PQ OPK_B (if available)
      hasPQOneTimePrekey
        ? MLKEM.decapsulate(
          message.pqEncapsulations.oneTimePreKey!,
          receiverBundle.pqOneTimePreKey!.privateKey,
          MLKEM_VERSION
        )
        : new Uint8Array(0),
    ]);

    // Combine results into single array
    let offset = 0;
    if (dh1.length) combined.set(dh1, offset), offset += dh1.length;
    if (dh2.length) combined.set(dh2, offset), offset += dh2.length;
    if (dh3.length) combined.set(dh3, offset), offset += dh3.length;
    if (dh4.length) combined.set(dh4, offset), offset += dh4.length;
    combined.set(pq1, offset), offset += pq1.length;
    combined.set(pq2, offset), offset += pq2.length;
    if (hasPQOneTimePrekey) combined.set(pq3, offset);

    // Compute salt (IK_A || EK_A)
    const salt = concatUint8Arrays([message.senderIdentityKey, message.ephemeralKeyEC]);

    // Derive shared secret using HKDF
    const sharedSecret = sodium.crypto_kdf_derive_from_key(
      KEY_LENGTH,
      0,
      HKDF_INFO,
      sodium.crypto_generichash(32, combined, salt)
    );

    // Securely erase sensitive data
    wipeBytes(combined, salt);

    return sharedSecret;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    throw new X3DHError(
      `Receiver shared secret computation failed: ${errorMessage}`,
      "RECEIVER_SHARED_SECRET_FAILED"
    );
  }
}
