import {
  crypto_sign_ed25519_sk_to_curve25519,
  memzero,
  crypto_sign_keypair,
  crypto_scalarmult_base,
} from "libsodium-wrappers";
import { KeyPair, PublicKeyBundle } from "../../interfaces";
import { Ed25519 } from "../Curves/ed25519";
import { X25519 } from "../Curves/x25519";

export default class BundleManager {
  private constructor() { }

  static generateIdentityKey(): { ed25519: KeyPair; x25519: KeyPair } {
    const ed25519KeyPair = crypto_sign_keypair();
    const x25519Private = crypto_sign_ed25519_sk_to_curve25519(ed25519KeyPair.privateKey);
    const x25519Public = crypto_scalarmult_base(x25519Private);
    const ed25519PrivateKeySeed = ed25519KeyPair.privateKey.subarray(0, 32);
    return {
      ed25519: {
        publicKey: new Uint8Array(ed25519KeyPair.publicKey),
        privateKey: new Uint8Array(ed25519PrivateKeySeed),
      },
      x25519: {
        publicKey: new Uint8Array(x25519Public),
        privateKey: new Uint8Array(x25519Private),
      },
    };
  }

  static generateSignedPrekey(identityPrivateKey: Uint8Array): { keyPair: KeyPair; signature: Uint8Array } {
    const keyPair = X25519.generateKeyPair();
    const encodedSpk = BundleManager.encodePublicKey(keyPair.publicKey);
    const signature = Ed25519.sign(encodedSpk, identityPrivateKey);
    const result = {
      keyPair: {
        publicKey: new Uint8Array(keyPair.publicKey),
        privateKey: new Uint8Array(keyPair.privateKey),
      },
      signature: new Uint8Array(signature),
    };
    BundleManager.wipeKey(encodedSpk);
    BundleManager.wipeKey(signature);
    return result;
  }

  static generateOneTimePrekey(): KeyPair {
    const keyPair = X25519.generateKeyPair();
    return {
      publicKey: new Uint8Array(keyPair.publicKey),
      privateKey: new Uint8Array(keyPair.privateKey),
    };
  }

  static generateOneTimePrekeys(count: number): KeyPair[] {
    return Array.from({ length: count }, () => BundleManager.generateOneTimePrekey());
  }

  static createPublicBundle(
    identityEd25519PublicKey: Uint8Array,
    identityX25519PublicKey: Uint8Array,
    signedPrekeyPublic: Uint8Array,
    signature: Uint8Array,
    oneTimePrekeysPublic: Uint8Array[]
  ): PublicKeyBundle {
    return {
      identityKeyEd25519: new Uint8Array(identityEd25519PublicKey),
      identityKeyX25519: new Uint8Array(identityX25519PublicKey),
      signedPrekey: {
        publicKey: new Uint8Array(signedPrekeyPublic),
        signature: new Uint8Array(signature),
      },
      oneTimePrekeys: oneTimePrekeysPublic.map((pk) => new Uint8Array(pk)),
    };
  }

  static encodePublicKey(pk: Uint8Array): Uint8Array {
    const curveIdentifier = new Uint8Array([0x01]);
    if (pk.length !== 32) throw new Error("Invalid X25519 public key length");
    const encoded = new Uint8Array(1 + 32);
    encoded.set(curveIdentifier, 0);
    encoded.set(pk, 1);
    return encoded;
  }

  static wipeKey(key: Uint8Array): void {
    memzero(key);
  }
}
