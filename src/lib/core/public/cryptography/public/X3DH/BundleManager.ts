import {
  crypto_sign_ed25519_sk_to_curve25519,
  memzero,
  crypto_sign_keypair,
  crypto_scalarmult_base,
} from "libsodium-wrappers";
import { KeyPair, KeyBundle, PublicKeyBundle } from "../../interfaces";
import { Ed25519 } from "../Curves/ed25519";
import { X25519 } from "../Curves/x25519";
import { IDisposable } from "../../../misc";

// Secure public key encoding per X3DH
export function encodePublicKey(pk: Uint8Array): Uint8Array {
  const curveIdentifier = new Uint8Array([0x01]);
  if (pk.length !== 32) throw new Error("Invalid X25519 public key length");
  const encoded = new Uint8Array(1 + 32);
  encoded.set(curveIdentifier, 0);
  encoded.set(pk, 1);
  return encoded;
}

// Convert Ed25519 private key to X25519
function ed25519ToX25519(ed25519Private: Uint8Array): Uint8Array {
  return crypto_sign_ed25519_sk_to_curve25519(ed25519Private);
}

// Securely wipe sensitive data
function wipeKey(key: Uint8Array): void {
  memzero(key);
}

export default class BundleManager implements IDisposable {
  private identityKey: { ed25519: KeyPair; x25519: KeyPair } | null;
  private signedPrekey: { keyPair: KeyPair; signature: Uint8Array } | null;
  private oneTimePrekeys: KeyPair[];
  private isInitialized: boolean;

  private constructor() {
    this.identityKey = null;
    this.signedPrekey = null;
    this.oneTimePrekeys = [];
    this.isInitialized = false;
  }

  public static async create(numOneTimePrekeys: number = 100): Promise<BundleManager> {
    const manager = new BundleManager();
    await manager.initialize(numOneTimePrekeys);
    return manager;
  }

  private async initialize(numOneTimePrekeys: number): Promise<void> {
    try {
      this.identityKey = this.generateIdentityKey();
      this.signedPrekey = this.generateSignedPrekey();
      this.oneTimePrekeys = this.generateOneTimePrekeys(numOneTimePrekeys);
      this.isInitialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize BundleManager: ${error}`);
    }
  }

  public destroy(): void {
    this.checkInitialized();
    if (this.identityKey) {
      wipeKey(this.identityKey.ed25519.privateKey);
      wipeKey(this.identityKey.x25519.privateKey);
      this.identityKey = null;
    }
    if (this.signedPrekey) {
      wipeKey(this.signedPrekey.keyPair.privateKey);
      this.signedPrekey = null;
    }
    this.oneTimePrekeys.forEach((kp) => wipeKey(kp.privateKey));
    this.oneTimePrekeys.length = 0;
    this.isInitialized = false;
  }

  private checkInitialized(): void {
    if (!this.isInitialized || !this.identityKey || !this.signedPrekey) {
      throw new Error("BundleManager not initialized");
    }
  }

  private generateIdentityKey(): { ed25519: KeyPair; x25519: KeyPair } {
    const ed25519KeyPair = crypto_sign_keypair();
    const x25519Private = ed25519ToX25519(ed25519KeyPair.privateKey);
    const x25519Public = crypto_scalarmult_base(x25519Private);

    const ed25519PrivateKeySeed = ed25519KeyPair.privateKey.subarray(0, 32);

    const result = {
      ed25519: {
        publicKey: new Uint8Array(ed25519KeyPair.publicKey),
        privateKey: new Uint8Array(ed25519PrivateKeySeed),
      },
      x25519: {
        publicKey: new Uint8Array(x25519Public),
        privateKey: new Uint8Array(x25519Private),
      },
    };

    // Do not wipe private keys here; they are needed for operations
    return result;
  }

  private generateSignedPrekey(): { keyPair: KeyPair; signature: Uint8Array } {
    const keyPair = X25519.generateKeyPair();
    const encodedSpk = encodePublicKey(keyPair.publicKey);
    const signature = Ed25519.sign(encodedSpk, this.identityKey!.ed25519.privateKey);

    const result = {
      keyPair: {
        publicKey: new Uint8Array(keyPair.publicKey),
        privateKey: new Uint8Array(keyPair.privateKey),
      },
      signature: new Uint8Array(signature),
    };

    wipeKey(encodedSpk);
    wipeKey(signature);
    return result;
  }

  private generateOneTimePrekeys(count: number): KeyPair[] {
    return Array.from({ length: count }, () => {
      const keyPair = X25519.generateKeyPair();
      return {
        publicKey: new Uint8Array(keyPair.publicKey),
        privateKey: new Uint8Array(keyPair.privateKey),
      };
    });
  }

  public createBundle(): PublicKeyBundle {
    this.checkInitialized();
    return {
      identityKey: new Uint8Array(this.identityKey!.x25519.publicKey),
      signedPrekey: {
        publicKey: new Uint8Array(this.signedPrekey!.keyPair.publicKey),
        signature: new Uint8Array(this.signedPrekey!.signature),
      },
      oneTimePrekeys: this.oneTimePrekeys.map((kp) => new Uint8Array(kp.publicKey)),
    };
  }

  public getPrivateKeyBundle(): KeyBundle {
    this.checkInitialized();
    return {
      identityKey: {
        publicKey: new Uint8Array(this.identityKey!.x25519.publicKey),
        privateKey: new Uint8Array(this.identityKey!.x25519.privateKey),
      },
      signedPrekey: {
        keyPair: {
          publicKey: new Uint8Array(this.signedPrekey!.keyPair.publicKey),
          privateKey: new Uint8Array(this.signedPrekey!.keyPair.privateKey),
        },
        signature: new Uint8Array(this.signedPrekey!.signature),
      },
      oneTimePrekeys: this.oneTimePrekeys.map((kp) => kp.publicKey),
    };
  }

  public rotateSignedPrekey(): void {
    this.checkInitialized();
    if (this.signedPrekey) {
      wipeKey(this.signedPrekey.keyPair.privateKey);
    }
    this.signedPrekey = this.generateSignedPrekey();
  }

  public addOneTimePrekeys(count: number): void {
    this.checkInitialized();
    const newKeys = this.generateOneTimePrekeys(count);
    this.oneTimePrekeys.push(...newKeys);
  }

  public removeOneTimePrekey(index: number): void {
    this.checkInitialized();
    if (index < 0 || index >= this.oneTimePrekeys.length) {
      throw new Error("Invalid one-time prekey index");
    }
    wipeKey(this.oneTimePrekeys[index].privateKey);
    this.oneTimePrekeys.splice(index, 1);
  }

  public getOneTimePrekeyCount(): number {
    this.checkInitialized();
    return this.oneTimePrekeys.length;
  }
}
