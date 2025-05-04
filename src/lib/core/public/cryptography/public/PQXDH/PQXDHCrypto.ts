import crypto from "libsodium-wrappers";

import {
  AEADDecFunction,
  AEADEncFunction,
  DHFunction,
  KDFFunction,
  PQKEMDecFunction,
  PQKEMEncFunction,
  PQKEMPrivateKey,
  PQKEMPublicKey,
  PQXDHParameters,
  PrivateKey,
  PublicKey,
  SignatureFunction,
  VerifyFunction,
} from "./types";

class PQXDHCrypto {
  #params: PQXDHParameters; /* private */

  constructor(params: PQXDHParameters) {
    this.#params = params;
  }

  public dh: DHFunction = (
    publicKey: PublicKey,
    privateKey: PrivateKey,
  ): Uint8Array => {
    if (publicKey.curve !== privateKey.curve) {
      throw new Error(
        "Криві для публічного та приватного ключів не співпадають",
      );
    }

    if (publicKey.curve === "curve25519") {
      return crypto.crypto_scalarmult(privateKey.data, publicKey.data);
    } else {
      throw new Error("Curve448 не підтримується в поточній реалізації");
    }
  };

  sig: SignatureFunction = (
    privateKey: PrivateKey,
    message: Uint8Array,
    // randomness: Uint8Array,
  ): Uint8Array => {
    // Для підпису в libcrypto потрібен ключ Ed25519, але у нас є X25519 приватний ключ
    // Конвертуємо X25519 приватний ключ у Ed25519 приватний ключ
    // (Примітка: це спрощення, в реальності потрібна додаткова обробка)!!!!
    // Підписуємо повідомлення
    return crypto.crypto_sign_detached(
      message,
      crypto.crypto_sign_ed25519_sk_to_curve25519(
        privateKey.data,
      ) /** var: ed25519PrivateKey */,
    );
  };

  verify: VerifyFunction = (
    publicKey: PublicKey,
    message: Uint8Array,
    signature: Uint8Array,
  ): boolean => {
    // Для верифікації в libcrypto потрібен ключ Ed25519, але у нас є X25519 публічний ключ
    // Конвертуємо X25519 публічний ключ у Ed25519 публічний ключ
    // (Примітка: це спрощення, в реальності потрібна додаткова обробка)
    try {
      // Перевіряємо підпис
      return crypto.crypto_sign_verify_detached(
        signature,
        message,
        crypto.crypto_sign_ed25519_pk_to_curve25519(
          publicKey.data,
        ) /**var: ed25519PublicKey */,
      );
    } catch (e) {
      return false;
    }
  };

  kdf: KDFFunction = (
    salt: Uint8Array,
    inputKeyMaterial: Uint8Array,
    info: Uint8Array,
    outputLength: number,
  ): Uint8Array => {
    // libcrypto не має вбудованої реалізації HKDF,
    // тому реалізуємо базову версію згідно з RFC 5869

    // HKDF-Extract
    const prk = crypto.crypto_auth(inputKeyMaterial, salt);

    // HKDF-Expand
    const T = new Uint8Array(outputLength);
    let T_prev = new Uint8Array(0);
    let counter = 1;
    let offset = 0;

    while (offset < outputLength) {
      const blockInput = new Uint8Array(T_prev.length + info.length + 1);
      blockInput.set(T_prev);
      blockInput.set(info, T_prev.length);
      blockInput[blockInput.length - 1] = counter;

      const blockOutput = crypto.crypto_auth(blockInput, prk);
      const blockSize = Math.min(blockOutput.length, outputLength - offset);
      T.set(blockOutput.subarray(0, blockSize), offset);

      T_prev = new Uint8Array(blockOutput);
      offset += blockSize;
      counter++;
    }

    return T;
  };

  pqkemEnc: PQKEMEncFunction = (
    pk: PQKEMPublicKey,
  ): {
    ciphertext: Uint8Array;
    sharedSecret: Uint8Array;
  } => {
    // Оскільки libcrypto не має реалізації CRYSTALS-KYBER,
    // створюємо заглушку, що генерує випадкові дані відповідного розміру

    let ciphertextSize = 0;
    const sharedSecretSize = 32; // 256 біт для спільного секрету

    switch (pk.kem) {
      case "CRYSTALS-KYBER-512":
        ciphertextSize = 768;
        break;
      case "CRYSTALS-KYBER-768":
        ciphertextSize = 1088;
        break;
      case "CRYSTALS-KYBER-1024":
        ciphertextSize = 1568;
        break;
    }

    // Генерація випадкового шифротексту і спільного секрету
    const ciphertext = crypto.randombytes_buf(ciphertextSize);
    const sharedSecret = crypto.randombytes_buf(sharedSecretSize);

    return { ciphertext, sharedSecret };
  };

  pqkemDec: PQKEMDecFunction = (
    sk: PQKEMPrivateKey,
    ciphertext: Uint8Array,
  ): Uint8Array => {
    // Оскільки libcrypto не має реалізації CRYSTALS-KYBER,
    // створюємо заглушку, що генерує випадковий спільний секрет

    // Зауважте, що в реальній реалізації декапсуляція відновлює
    // той самий спільний секрет, що був створений при інкапсуляції

    const sharedSecretSize = 32; // 256 біт для спільного секрету
    return crypto.randombytes_buf(sharedSecretSize);
  };

  aeadEnc: AEADEncFunction = (
    key: Uint8Array,
    plaintext: Uint8Array,
    associatedData: Uint8Array,
  ): Uint8Array => {
    // Генеруємо випадковий nonce
    const nonce = crypto.randombytes_buf(
      crypto.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES,
    );

    // Шифруємо використовуючи XChaCha20-Poly1305
    const ciphertext = crypto.crypto_aead_xchacha20poly1305_ietf_encrypt(
      plaintext,
      associatedData,
      null, // необов'язкові секретні дані
      nonce,
      key,
    );

    // Поєднуємо nonce і шифротекст для результату
    const result = new Uint8Array(nonce.length + ciphertext.length);
    result.set(nonce);
    result.set(ciphertext, nonce.length);

    return result;
  };

  aeadDec: AEADDecFunction = (
    key: Uint8Array,
    ciphertext: Uint8Array,
    associatedData: Uint8Array
  ): Uint8Array => {

    // Виділяємо nonce з шифротексту
    const nonceLength = crypto.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES;
    const nonce = ciphertext.slice(0, nonceLength);
    const actualCiphertext = ciphertext.slice(nonceLength);

    // Розшифровуємо
    try {
      return crypto.crypto_aead_xchacha20poly1305_ietf_decrypt(
        null,
        actualCiphertext,
        associatedData,
        nonce,
        key
      );
    } catch (error) {
      throw new Error("Помилка автентифікації: шифротекст або додаткові дані були змінені");
    }
  }
}

export default PQXDHCrypto;
