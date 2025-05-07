import {
  crypto_aead_xchacha20poly1305_ietf_encrypt,
  crypto_scalarmult,
  memzero,
  randombytes_buf
} from "libsodium-wrappers";
import { KeyBundle, PublicKeyBundle } from "../../interfaces";
import { Ed25519 } from "../Curves/ed25519";
import { X25519 } from "../Curves/x25519";
import { encodePublicKey } from "./BundleManager";
import { hkdf } from "@noble/hashes/hkdf";
import { sha256 } from "@noble/hashes/sha2.js";

export default function sendInitialMessage(
  senderKeys: KeyBundle,
  recipientBundle: PublicKeyBundle,
  message: string,
  info = "X3DHProtocol"
) {
  const encodedSPK = encodePublicKey(recipientBundle.signedPrekey.publicKey);
  const isValid = Ed25519.verify(
    recipientBundle.signedPrekey.signature,
    encodedSPK,
    recipientBundle.identityKey
  );
  if (!isValid) throw new Error("Invalid signed prekey signature");

  const ephemeralKey = X25519.generateKeyPair();

  const DH1 = crypto_scalarmult(
    senderKeys.identityKey.privateKey,
    recipientBundle.signedPrekey.publicKey
  );
  const DH2 = crypto_scalarmult(
    ephemeralKey.privateKey,
    recipientBundle.identityKey
  );
  const DH3 = crypto_scalarmult(
    ephemeralKey.privateKey,
    recipientBundle.signedPrekey.publicKey
  );

  let DH4: Uint8Array = new Uint8Array(0);
  let oneTimePrekeyIndex: number | undefined;
  if (recipientBundle.oneTimePrekeys.length > 0) {
    oneTimePrekeyIndex = 0;
    DH4 = crypto_scalarmult(
      ephemeralKey.privateKey,
      recipientBundle.oneTimePrekeys[oneTimePrekeyIndex]
    );
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

  const senderIK = encodePublicKey(senderKeys.identityKey.publicKey);
  const recipientIK = encodePublicKey(recipientBundle.identityKey);
  const AD = new Uint8Array(senderIK.length + recipientIK.length);
  AD.set(senderIK, 0);
  AD.set(recipientIK, senderIK.length);

  const nonce = randombytes_buf(24);
  const ciphertext = crypto_aead_xchacha20poly1305_ietf_encrypt(
    message,
    AD,
    null,
    nonce,
    SK
  );

  memzero(DH1);
  memzero(DH2);
  memzero(DH3);
  memzero(DH4);
  memzero(ephemeralKey.privateKey);

  return {
    initialMessage: {
      identityKey: senderIK,
      ephemeralKey: new Uint8Array(ephemeralKey.publicKey),
      usedPrekeys: { signedPrekey: true, oneTimePrekeyIndex },
      ciphertext: new Uint8Array(ciphertext),
      nonce
    },
    sharedSecret: new Uint8Array(SK)
  };
}
