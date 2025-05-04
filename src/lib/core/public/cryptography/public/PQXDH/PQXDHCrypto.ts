import {
  crypto_aead_xchacha20poly1305_ietf_decrypt as decryptXChaCha20,
  crypto_aead_xchacha20poly1305_ietf_encrypt as encryptXChaCha20,
  crypto_aead_xchacha20poly1305_ietf_NPUBBYTES as XChaCha20NonceBytes,
  crypto_auth as hmacAuth,
  crypto_scalarmult as diffieHellman,
  crypto_sign_detached as signDetached,
  crypto_sign_verify_detached as verifyDetached,
  randombytes_buf as getRandomBytes,
  memzero,
} from "libsodium-wrappers";
import { ml_kem512, ml_kem768, ml_kem1024 } from "@noble/post-quantum/ml-kem";
import {
  AEADDecFunction,
  AEADEncFunction,
  DHFunction,
  KDFFunction,
  PQKEMDecFunction,
  PQKEMEncFunction,
  PQKEMPrivateKey,
  PQKEMPublicKey,
  PrivateKey,
  PublicKey,
  SignatureFunction,
  VerifyFunction,
} from "./types";

class PQXDHCrypto {
  public dh: DHFunction = (
    publicKey: PublicKey,
    privateKey: PrivateKey,
  ): Uint8Array => {
    if (publicKey.curve !== privateKey.curve) {
      throw new Error("Криві для публічного та приватного ключів не співпадають");
    }
    if (publicKey.curve !== "curve25519" || publicKey.data.length !== 32) {
      throw new Error("Непідтримуваний формат ключа або крива");
    }
    try {
      return diffieHellman(privateKey.data, publicKey.data);
    } catch {
      throw new Error("Помилка обчислення Diffie-Hellman");
    }
  };

  sig: SignatureFunction = (
    privateKey: PrivateKey,
    message: Uint8Array,
  ): Uint8Array => {
    if (privateKey.curve !== "curve25519" || privateKey.data.length !== 64) {
      throw new Error("Недійсний приватний ключ Ed25519: некоректна довжина або крива");
    }
    if (!message || !(message instanceof Uint8Array)) {
      throw new Error("Недійсне повідомлення для підпису");
    }
    try {
      const signature = signDetached(message, privateKey.data);
      memzero(privateKey.data);
      return signature;
    } catch {
      throw new Error("Помилка створення підпису");
    }
  };

  verify: VerifyFunction = (
    publicKey: PublicKey,
    message: Uint8Array,
    signature: Uint8Array,
  ): boolean => {
    if (publicKey.curve !== "curve25519" || publicKey.data.length !== 32) {
      throw new Error("Недійсний публічний ключ Ed25519: некоректна довжина або крива");
    }
    if (!message || !(message instanceof Uint8Array)) {
      throw new Error("Недійсне повідомлення для верифікації");
    }
    if (!signature || signature.length !== 64) {
      throw new Error("Недійсний підпис: некоректна довжина");
    }
    try {
      return verifyDetached(signature, message, publicKey.data);
    } catch {
      return false;
    } finally {
      memzero(publicKey.data);
    }
  };

  kdf: KDFFunction = (
    salt: Uint8Array,
    inputKeyMaterial: Uint8Array,
    info: Uint8Array,
    outputLength: number,
  ): Uint8Array => {
    if (salt.length !== 32) {
      throw new Error("Недійсна довжина солі: має бути 32 байти");
    }
    try {
      const prk = hmacAuth(inputKeyMaterial, salt);
      const T = new Uint8Array(outputLength);
      let T_prev = new Uint8Array(0);
      let counter = 1;
      let offset = 0;

      while (offset < outputLength) {
        const blockInput = new Uint8Array(T_prev.length + info.length + 1);
        blockInput.set(T_prev);
        blockInput.set(info, T_prev.length);
        blockInput[blockInput.length - 1] = counter;

        const blockOutput = hmacAuth(blockInput, prk);
        const blockSize = Math.min(blockOutput.length, outputLength - offset);
        T.set(blockOutput.subarray(0, blockSize), offset);

        T_prev = Uint8Array.from(blockOutput);
        offset += blockSize;
        counter++;
      }
      memzero(prk);
      return T;
    } catch {
      throw new Error("Помилка виведення ключа KDF");
    }
  };

  pqkemEnc: PQKEMEncFunction = (
    pk: PQKEMPublicKey,
  ): { ciphertext: Uint8Array; sharedSecret: Uint8Array } => {
    let mlkem;
    switch (pk.kem) {
      case "CRYSTALS-KYBER-512":
        mlkem = ml_kem512;
        break;
      case "CRYSTALS-KYBER-768":
        mlkem = ml_kem768;
        break;
      case "CRYSTALS-KYBER-1024":
        mlkem = ml_kem1024;
        break;
      default:
        throw new Error(`Непідтримуваний KEM: ${pk.kem}`);
    }
    if (pk.data.length !== mlkem.publicKeyLen) {
      throw new Error("Недійсний публічний ключ KEM");
    }
    try {
      const { sharedSecret, cipherText } = mlkem.encapsulate(pk.data);
      return { ciphertext: cipherText, sharedSecret };
    } catch {
      throw new Error("Помилка інкапсуляції KEM");
    }
  };

  pqkemDec: PQKEMDecFunction = (
    sk: PQKEMPrivateKey,
    ciphertext: Uint8Array,
  ): Uint8Array => {
    let mlkem;
    switch (sk.kem) {
      case "CRYSTALS-KYBER-512":
        mlkem = ml_kem512;
        break;
      case "CRYSTALS-KYBER-768":
        mlkem = ml_kem768;
        break;
      case "CRYSTALS-KYBER-1024":
        mlkem = ml_kem1024;
        break;
      default:
        throw new Error(`Непідтримуваний KEM: ${sk.kem}`);
    }

    try {
      const sharedSecret = mlkem.decapsulate(ciphertext, sk.data);
      memzero(sk.data);
      return sharedSecret;
    } catch {
      throw new Error("Помилка декапсуляції KEM");
    }
  };

  aeadEnc: AEADEncFunction = (
    key: Uint8Array,
    plaintext: Uint8Array,
    associatedData: Uint8Array,
  ): Uint8Array => {
    if (key.length !== 32) {
      throw new Error("Недійсна довжина ключа AEAD: має бути 32 байти");
    }
    const nonce = getRandomBytes(XChaCha20NonceBytes);
    try {
      const ciphertext = encryptXChaCha20(plaintext, associatedData, null, nonce, key);
      const result = new Uint8Array(nonce.length + ciphertext.length);
      result.set(nonce);
      result.set(ciphertext, nonce.length);
      return result;
    } catch {
      throw new Error("Помилка шифрування AEAD");
    }
  };

  aeadDec: AEADDecFunction = (
    key: Uint8Array,
    ciphertext: Uint8Array,
    associatedData: Uint8Array,
  ): Uint8Array => {
    if (key.length !== 32) {
      throw new Error("Недійсна довжина ключа AEAD: має бути 32 байти");
    }
    const nonceLength = XChaCha20NonceBytes;
    if (ciphertext.length < nonceLength) {
      throw new Error("Недійсний шифротекст: занадто короткий");
    }
    const nonce = ciphertext.slice(0, nonceLength);
    const actualCiphertext = ciphertext.slice(nonceLength);
    try {
      return decryptXChaCha20(null, actualCiphertext, associatedData, nonce, key);
    } catch {
      throw new Error("Помилка автентифікації: шифротекст або додаткові дані були змінені");
    }
  };
}

export default PQXDHCrypto;
