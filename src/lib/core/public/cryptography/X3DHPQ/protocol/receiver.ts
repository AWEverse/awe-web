import { hkdf } from "@noble/hashes/hkdf";
import { sha256 } from "@noble/hashes/sha256";
import { MLKEM } from "../crypto/ml-kem";
import { KeyBundle, InitialMessage } from "../types";
import { X3DHError } from "./errors";
import { validateInitialMessage } from "../utils/validation";
import { DH_OUTPUT_SIZE, HKDF_INFO, KEY_LENGTH, MLKEM_SS_SIZE, MLKEM_VERSION } from "../config";
import { wipeBytes } from "../../secure";
import { concatUint8Arrays } from "../utils/arrays";
import { X25519 } from "../../curves/x25519";

// Optimized receiver shared secret computation
export async function computeReceiverSharedSecret(
  receiverBundle: KeyBundle,
  message: InitialMessage
): Promise<Uint8Array> {
  try {
    // Validate message (assumed lightweight)
    validateInitialMessage(message);

    // Pre-allocate buffer for DH and ML-KEM results
    const hasOneTimePrekey = !!receiverBundle.oneTimePreKey;
    const hasPQOneTimePrekey = !!message.pqEncapsulations.oneTimePreKey && !!receiverBundle.pqOneTimePreKey;
    const combinedLength =
      DH_OUTPUT_SIZE * 3 + // DH1, DH2, DH3
      (hasOneTimePrekey ? DH_OUTPUT_SIZE : 0) + // DH4
      MLKEM_SS_SIZE * 2 + // PQ identity, signed pre-key
      (hasPQOneTimePrekey ? MLKEM_SS_SIZE : 0); // PQ one-time pre-key
    const combined = new Uint8Array(combinedLength);

    // Compute DH and ML-KEM operations in parallel
    const results = await Promise.all([
      // DH1: SPK_B x IK_A (X25519)
      X25519.computeSharedSecret(
        receiverBundle.signedPreKey.keyPair.privateKey,
        message.senderIdentityKeyX25519
      ),
      // DH2: IK_B (X25519) x EK_A
      X25519.computeSharedSecret(
        receiverBundle.identityKeyX25519.privateKey,
        message.ephemeralKeyEC
      ),
      // DH3: SPK_B x EK_A
      X25519.computeSharedSecret(
        receiverBundle.signedPreKey.keyPair.privateKey,
        message.ephemeralKeyEC
      ),
      // DH4: OPK_B x EK_A (if available)
      hasOneTimePrekey
        ? X25519.computeSharedSecret(
          receiverBundle.oneTimePreKey!.privateKey,
          message.ephemeralKeyEC
        )
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

    // Fill combined buffer
    let offset = 0;
    for (let i = 0; i < 4; i++) {
      if (results[i].length) {
        combined.set(results[i], offset);
        offset += results[i].length;
      }
    }
    combined.set(results[4], offset);
    offset += results[4].length;
    combined.set(results[5], offset);
    offset += results[5].length;

    if (hasPQOneTimePrekey) {
      combined.set(results[6], offset);
    }

    // Compute salt (IK_A || EK_A)
    const salt = concatUint8Arrays([
      message.senderIdentityKey,
      message.ephemeralKeyEC,
    ]);

    const sharedSecret = hkdf(sha256, combined, salt, HKDF_INFO, KEY_LENGTH);

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
