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
import { PublicKey } from '../types';

export async function computeSenderSharedSecret(
  senderBundle: KeyBundle,
  recipientBundle: KeyBundle,
): Promise<{ sharedSecret: Uint8Array; initialMessage: InitialMessage }> {

  try {
    // Verify signed pre-key signature
    if (
      !sodium.crypto_sign_verify_detached(
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

    // Generate ephemeral key pairs
    const ephemeralKeyEC = sodium.crypto_kx_keypair();
    const ephemeralKeyPQ = await MLKEM.generateKeyPair(MLKEM_VERSION);

    const hasOneTimePrekey = !!recipientBundle.oneTimePreKey;
    const hasPQOneTimePrekey = !!recipientBundle.pqOneTimePreKey;
    const combinedLength =
      DH_OUTPUT_SIZE * 3 + // DH1, DH2, DH3
      (hasOneTimePrekey ? DH_OUTPUT_SIZE : 0) + // DH4
      MLKEM_SS_SIZE * 2 + // PQ identity, signed pre-key
      (hasPQOneTimePrekey ? MLKEM_SS_SIZE : 0); // PQ one-time pre-key
    const combined = new Uint8Array(combinedLength);
    const pqEncapsulations: InitialMessage["pqEncapsulations"] = {
      identity: new Uint8Array(0),
      signedPreKey: new Uint8Array(0),
    };

    // Perform key exchanges
    const results = await Promise.all([
      // DH1: IK_A (X25519) x SPK_B
      sodium.crypto_kx_client_session_keys(
        senderBundle.identityKeyX25519.publicKey,
        senderBundle.identityKeyX25519.privateKey,
        recipientBundle.signedPreKey.keyPair.publicKey,
      ).sharedRx,
      // DH2: EK_A x IK_B (X25519)
      sodium.crypto_kx_client_session_keys(
        ephemeralKeyEC.publicKey,
        ephemeralKeyEC.privateKey,
        recipientBundle.identityKeyX25519.publicKey,
      ).sharedRx,
      // DH3: EK_A x SPK_B
      sodium.crypto_kx_client_session_keys(
        ephemeralKeyEC.publicKey,
        ephemeralKeyEC.privateKey,
        recipientBundle.signedPreKey.keyPair.publicKey,
      ).sharedRx,
      // DH4: EK_A x OPK_B (if available)
      hasOneTimePrekey
        ? sodium.crypto_kx_client_session_keys(
          ephemeralKeyEC.publicKey,
          ephemeralKeyEC.privateKey,
          recipientBundle.oneTimePreKey!.publicKey,
        ).sharedRx
        : new Uint8Array(0),
      // PQ1: Encapsulate to PQ IK_B
      MLKEM.encapsulate(recipientBundle.pqIdentityKey.publicKey, MLKEM_VERSION),
      // PQ2: Encapsulate to PQ SPK_B
      MLKEM.encapsulate(
        recipientBundle.pqSignedPreKey.publicKey,
        MLKEM_VERSION,
      ),
      // PQ3: Encapsulate to PQ OPK_B (if available)
      hasPQOneTimePrekey
        ? MLKEM.encapsulate(
          recipientBundle.pqOneTimePreKey!.publicKey,
          MLKEM_VERSION,
        )
        : { sharedSecret: new Uint8Array(0), cipherText: new Uint8Array(0) },
    ]);

    let offset = 0;
    for (let i = 0; i < 4; i++) {
      const dhResult = results[i] as Uint8Array;
      if (dhResult.byteLength > 0) {
        combined.set(dhResult, offset);
        offset += dhResult.byteLength;
      }
    }

    pqEncapsulations.identity = results[4].cipherText;
    combined.set(results[4].sharedSecret, offset);
    offset += results[4].sharedSecret.length;
    pqEncapsulations.signedPreKey = results[5].cipherText;
    combined.set(results[5].sharedSecret, offset);
    offset += results[5].sharedSecret.length;

    if (hasPQOneTimePrekey) {
      pqEncapsulations.oneTimePreKey = results[6].cipherText;
      combined.set(results[6].sharedSecret, offset);
    }

    // Compute salt (IK_A || EK_A)
    const salt = concatUint8Arrays([
      senderBundle.identityKey.publicKey,
      ephemeralKeyEC.publicKey,
    ]);

    // Derive shared secret (HKDF)
    const sharedSecret = sodium.crypto_kdf_derive_from_key(
      KEY_LENGTH,
      0,
      HKDF_INFO,
      sodium.crypto_generichash(32, combined, salt),
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

    validateInitialMessage(initialMessage);

    wipeBytes(ephemeralKeyEC.privateKey, ephemeralKeyPQ.privateKey, combined);

    return { sharedSecret, initialMessage };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new X3DHError(
      `Sender shared secret computation failed: ${errorMessage}`,
      "SENDER_SHARED_SECRET_FAILED",
    );
  }
}
