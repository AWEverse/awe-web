import { hkdf } from "@noble/hashes/hkdf";
import { sha256 } from "@noble/hashes/sha256";
import { X25519 } from "../crypto/X25519";
import { MLKEM } from "../crypto/ml-kem";
import { concatUint8Arrays } from "../utils/arrays";
import { HKDF_INFO, MLKEM_VERSION } from "../config";
import { KeyBundle, InitialMessage } from "../types";
import { X3DHError } from "./errors";

/** Computes the receiver's shared secret */
export async function computeReceiverSharedSecret(
  receiverBundle: KeyBundle,
  message: InitialMessage
): Promise<Uint8Array> {
  try {
    const dhResults = await Promise.all([
      X25519.computeSharedSecret(
        receiverBundle.signedPreKey.keyPair.privateKey,
        message.senderIdentityKeyX25519
      ),
      X25519.computeSharedSecret(
        receiverBundle.identityKeyX25519.privateKey,
        message.ephemeralKeyEC
      ),
      X25519.computeSharedSecret(
        receiverBundle.signedPreKey.keyPair.privateKey,
        message.ephemeralKeyEC
      ),
      receiverBundle.oneTimePreKey
        ? X25519.computeSharedSecret(
          receiverBundle.oneTimePreKey.privateKey,
          message.ephemeralKeyEC
        )
        : Promise.resolve(new Uint8Array(0)),
    ]);

    const pqResults = await Promise.all([
      MLKEM.decapsulate(message.pqEncapsulations.identity, receiverBundle.pqIdentityKey.privateKey, MLKEM_VERSION),
      MLKEM.decapsulate(message.pqEncapsulations.signedPreKey, receiverBundle.pqSignedPreKey.privateKey, MLKEM_VERSION),
      message.pqEncapsulations.oneTimePreKey && receiverBundle.pqOneTimePreKey
        ? MLKEM.decapsulate(
          message.pqEncapsulations.oneTimePreKey,
          receiverBundle.pqOneTimePreKey.privateKey, MLKEM_VERSION)
        : Promise.resolve(new Uint8Array(0)),
    ]);

    const combined = concatUint8Arrays([...dhResults, ...pqResults]);

    return hkdf(sha256, combined, undefined, HKDF_INFO, 32);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    throw new X3DHError(`Receiver shared secret computation failed: ${errorMessage}`, "RECEIVER_SHARED_SECRET_FAILED");
  }
}
