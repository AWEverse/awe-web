import {
  crypto_aead_xchacha20poly1305_ietf_decrypt,
  crypto_scalarmult,
  memzero,
  to_string
} from "libsodium-wrappers";
import { KeyBundle } from "../../interfaces";
import { encodePublicKey } from "./BundleManager";
import { hkdf } from "@noble/hashes/hkdf";
import { sha256 } from "@noble/hashes/sha2.js";

export default function receiveInitialMessage(
  recipientKeys: KeyBundle,
  initialMessage: {
    identityKey: Uint8Array;
    ephemeralKey: Uint8Array;
    usedPrekeys: { signedPrekey: boolean; oneTimePrekeyIndex?: number };
    ciphertext: Uint8Array;
    nonce: Uint8Array;
  },
  info = "X3DHProtocol"
) {
  const { identityKey, ephemeralKey, usedPrekeys, ciphertext, nonce } = initialMessage;

  if (identityKey.length !== 32 || ephemeralKey.length !== 32) {
    throw new Error("Invalid key lengths in initial message");
  }
  if (!usedPrekeys.signedPrekey) {
    throw new Error("Signed prekey is required");
  }

  const IK = recipientKeys.identityKey.privateKey;
  const SPK = recipientKeys.signedPrekey.keyPair.privateKey;
  let OPK: Uint8Array | undefined;

  if (usedPrekeys.oneTimePrekeyIndex !== undefined) {
    const index = usedPrekeys.oneTimePrekeyIndex;
    if (index < 0 || index >= recipientKeys.oneTimePrekeys.length) {
      throw new Error("Invalid one-time prekey index");
    }
    OPK = recipientKeys.oneTimePrekeys[index];
  }

  const DH1 = crypto_scalarmult(IK, identityKey);       // IK_B * IK_A
  const DH2 = crypto_scalarmult(SPK, ephemeralKey);     // SPK_B * EK_A
  const DH3 = crypto_scalarmult(IK, ephemeralKey);       // IK_B * EK_A
  let DH4: Uint8Array = new Uint8Array(0);
  if (OPK) {
    DH4 = crypto_scalarmult(OPK, ephemeralKey);          // OPK_B * EK_A
  }

  const dhOutput = new Uint8Array(DH1.length + DH2.length + DH3.length + DH4.length);
  dhOutput.set(DH1, 0);
  dhOutput.set(DH2, DH1.length);
  dhOutput.set(DH3, DH1.length + DH2.length);
  if (DH4.length > 0) {
    dhOutput.set(DH4, DH1.length + DH2.length + DH3.length);
  }

  const salt = new Uint8Array(32).fill(0);
  const SK = hkdf(sha256, dhOutput, salt, info, 32);

  memzero(DH1);
  memzero(DH2);
  memzero(DH3);
  memzero(DH4);

  const senderIK = encodePublicKey(identityKey);
  const recipientIK = encodePublicKey(recipientKeys.identityKey.publicKey);
  const AD = new Uint8Array(senderIK.length + recipientIK.length);
  AD.set(senderIK, 0);
  AD.set(recipientIK, senderIK.length);

  try {
    const plaintext = crypto_aead_xchacha20poly1305_ietf_decrypt(
      null,
      ciphertext,
      AD,
      nonce,
      SK
    );
    return {
      decryptedMessage: to_string(plaintext),
      sharedSecret: new Uint8Array(SK),
      senderIdentityKey: new Uint8Array(identityKey)
    };
  } catch {
    memzero(SK);
    throw new Error("Decryption failed");
  }
}
