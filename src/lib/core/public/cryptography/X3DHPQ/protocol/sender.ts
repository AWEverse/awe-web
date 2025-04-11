import { hkdf } from "@noble/hashes/hkdf";
import { sha256 } from "@noble/hashes/sha256";
import { Ed25519 } from "../crypto/ed25519";
import { X25519 } from "../crypto/X25519";
import { MLKEM } from "../crypto/ml-kem";
import { concatUint8Arrays } from "../utils/arrays";
import { PROTOCOL_VERSION, HKDF_INFO, MLKEM_VERSION } from "../config";
import { KeyBundle, InitialMessage } from "../types";
import { X3DHError } from "./errors";
import { validateInitialMessage } from "../utils/validation";

/** Computes the sender's shared secret and initial message */
export async function computeSenderSharedSecret(
  senderBundle: KeyBundle,
  recipientBundle: KeyBundle,
): Promise<{ sharedSecret: Uint8Array; initialMessage: InitialMessage }> {
  try {
    if (
      !Ed25519.verify(
        recipientBundle.signedPreKey.signature,
        recipientBundle.signedPreKey.keyPair.publicKey,
        recipientBundle.identityKey.publicKey,
      )
    ) {
      throw new X3DHError(
        "Invalid signed pre-key signature",
        "SIGNATURE_VERIFICATION_FAILED",
      );
    }

    const ephemeralKeyEC = X25519.generateKeyPair();
    const ephemeralKeyPQ = MLKEM.generateKeyPair(MLKEM_VERSION);

    const dhResults = await Promise.all([
      X25519.computeSharedSecret(
        senderBundle.identityKeyX25519.privateKey,
        recipientBundle.signedPreKey.keyPair.publicKey,
      ),
      X25519.computeSharedSecret(
        ephemeralKeyEC.privateKey,
        recipientBundle.identityKeyX25519.publicKey,
      ),
      X25519.computeSharedSecret(
        ephemeralKeyEC.privateKey,
        recipientBundle.signedPreKey.keyPair.publicKey,
      ),
      recipientBundle.oneTimePreKey
        ? X25519.computeSharedSecret(
          ephemeralKeyEC.privateKey,
          recipientBundle.oneTimePreKey.publicKey,
        )
        : Promise.resolve(new Uint8Array(0)),
    ]);

    const pqResults = await Promise.all([
      MLKEM.encapsulate(recipientBundle.pqIdentityKey.publicKey, MLKEM_VERSION),
      MLKEM.encapsulate(recipientBundle.pqSignedPreKey.publicKey, MLKEM_VERSION),
      recipientBundle.pqOneTimePreKey
        ? MLKEM.encapsulate(recipientBundle.pqOneTimePreKey.publicKey, MLKEM_VERSION)
        : Promise.resolve({
          sharedSecret: new Uint8Array(0),
          cipherText: new Uint8Array(0),
        }),
    ]);

    const combined = concatUint8Arrays([
      ...dhResults,
      pqResults[0].sharedSecret,
      pqResults[1].sharedSecret,
      pqResults[2].sharedSecret,
    ]);

    const salt = concatUint8Arrays([
      senderBundle.identityKey.publicKey, // IK_A
      recipientBundle.identityKey.publicKey, // IK_B
      ephemeralKeyEC.publicKey, // EK_A
    ]);

    const sharedSecret = hkdf(sha256, combined, salt, HKDF_INFO, 32);

    const message = {
      version: PROTOCOL_VERSION,
      ephemeralKeyEC: ephemeralKeyEC.publicKey,
      ephemeralKeyPQ: ephemeralKeyPQ.publicKey,
      senderIdentityKey: senderBundle.identityKey.publicKey,
      senderIdentityKeyX25519: senderBundle.identityKeyX25519.publicKey,
      pqEncapsulations: {
        identity: pqResults[0].cipherText,
        signedPreKey: pqResults[1].cipherText,
        oneTimePreKey: recipientBundle.pqOneTimePreKey
          ? pqResults[2].cipherText
          : undefined,
      },
    };

    validateInitialMessage(message);

    return {
      sharedSecret,
      initialMessage: message,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    throw new X3DHError(
      `Sender shared secret computation failed: ${errorMessage}`,
      "SENDER_SHARED_SECRET_FAILED",
    );
  }
}
