import { PQXDHCrypto } from "./PQXDHCrypto";
import {
  PublicKey,
  PrivateKey,
  PQKEMPublicKey,
  PQKEMPrivateKey,
} from "./types";
import {
  randombytes_buf as getRandomBytes,
  crypto_scalarmult_base,
  crypto_sign_seed_keypair,
  ready,
} from "libsodium-wrappers";
import { ml_kem512, ml_kem768, ml_kem1024 } from "@noble/post-quantum/ml-kem";
import { PQKEM } from "./types";

beforeAll(async () => {
  await ready;
});

describe("PQXDHCrypto", () => {
  // 1. Diffie-Hellman Key Exchange
  describe("dh", () => {
    it("should compute the same shared secret for both parties", () => {
      // Generate private and public keys for Alice (Curve25519)
      const alicePrivateData: Uint8Array = getRandomBytes(32);
      const alicePublicData: Uint8Array =
        crypto_scalarmult_base(alicePrivateData);
      const alicePrivate: PrivateKey = {
        curve: "curve25519",
        data: alicePrivateData,
      };
      const alicePublic: PublicKey = {
        curve: "curve25519",
        data: alicePublicData,
      };

      // Generate private and public keys for Bob (Curve25519)
      const bobPrivateData: Uint8Array = getRandomBytes(32);
      const bobPublicData: Uint8Array = crypto_scalarmult_base(bobPrivateData);
      const bobPrivate: PrivateKey = {
        curve: "curve25519",
        data: bobPrivateData,
      };
      const bobPublic: PublicKey = { curve: "curve25519", data: bobPublicData };

      // Compute shared secrets from both sides
      const sharedSecretAlice: Uint8Array = PQXDHCrypto.dh(
        bobPublic,
        alicePrivate,
      );
      const sharedSecretBob: Uint8Array = PQXDHCrypto.dh(
        alicePublic,
        bobPrivate,
      );

      // Verify they match
      expect(sharedSecretAlice).toEqual(sharedSecretBob);
    });
  });

  // 2. Signature and Verification
  describe("sig and verify", () => {
    it("should sign a message and verify the signature", () => {
      // Generate key pair from a seed
      const seed: Uint8Array = getRandomBytes(32);
      const { publicKey, privateKey } = crypto_sign_seed_keypair(seed);
      const privKey: PrivateKey = { curve: "ed25519", data: privateKey };
      const pubKey: PublicKey = { curve: "ed25519", data: publicKey };

      // Sign a message
      const message: Uint8Array = new Uint8Array([1, 2, 3, 4, 5]);
      const signature: Uint8Array = PQXDHCrypto.sig(privKey, message);

      // Verify the signature
      const isValid: boolean = PQXDHCrypto.verify(pubKey, message, signature);
      expect(isValid).toBe(true);

      // Test with an invalid signature
      const invalidSignature: Uint8Array = new Uint8Array(signature);
      invalidSignature[0] ^= 1; // Flip a bit
      const isInvalid: boolean = PQXDHCrypto.verify(
        pubKey,
        message,
        invalidSignature,
      );
      expect(isInvalid).toBe(false);
    });
  });

  // 3. Key Derivation Function
  describe("kdf", () => {
    it("should derive a key of the specified length", () => {
      const salt: Uint8Array = getRandomBytes(32);
      const inputKeyMaterial: Uint8Array = getRandomBytes(32);
      const info: Uint8Array = new Uint8Array([1, 2, 3]);
      const outputLength: number = 64;

      const derivedKey: Uint8Array = PQXDHCrypto.kdf(
        salt,
        inputKeyMaterial,
        info,
        outputLength,
      );
      expect(derivedKey.length).toBe(outputLength);
    });

    it("should throw an error for invalid salt length", () => {
      const salt: Uint8Array = getRandomBytes(31); // Invalid length
      const inputKeyMaterial: Uint8Array = getRandomBytes(32);
      const info: Uint8Array = new Uint8Array([1, 2, 3]);
      const outputLength: number = 64;

      expect(() =>
        PQXDHCrypto.kdf(salt, inputKeyMaterial, info, outputLength),
      ).toThrow("Недійсна довжина солі: має бути 32 байти");
    });
  });

  // 4. PQKEM Encapsulation and Decapsulation
  describe("pqkemEnc and pqkemDec", () => {
    const testKem = (kemName: PQKEM, mlkem: any) => {
      it(`should encapsulate and decapsulate correctly for ${kemName}`, () => {
        // Generate key pair
        const { publicKey, secretKey } = mlkem.keygen();
        const pk: PQKEMPublicKey = { kem: kemName, data: publicKey };
        const sk: PQKEMPrivateKey = { kem: kemName, data: secretKey };

        // Encapsulate and decapsulate
        const { ciphertext, sharedSecret: ssEnc } = PQXDHCrypto.pqkemEnc(pk);
        const ssDec: Uint8Array = PQXDHCrypto.pqkemDec(sk, ciphertext);

        // Verify shared secrets match
        expect(ssDec).toEqual(ssEnc);
      });
    };

    testKem("CRYSTALS-KYBER-512", ml_kem512);
    testKem("CRYSTALS-KYBER-768", ml_kem768);
    testKem("CRYSTALS-KYBER-1024", ml_kem1024);
  });

  // 5. AEAD Encryption and Decryption
  describe("aeadEnc and aeadDec", () => {
    it("should encrypt and decrypt correctly", () => {
      const key: Uint8Array = getRandomBytes(32);
      const plaintext: Uint8Array = new Uint8Array([1, 2, 3, 4, 5]);
      const associatedData: Uint8Array = new Uint8Array([6, 7, 8]);

      const ciphertext: Uint8Array = PQXDHCrypto.aeadEnc(
        key,
        plaintext,
        associatedData,
      );
      const decrypted: Uint8Array = PQXDHCrypto.aeadDec(
        key,
        ciphertext,
        associatedData,
      );

      expect(decrypted).toEqual(plaintext);
    });

    it("should fail decryption with incorrect key", () => {
      const key: Uint8Array = getRandomBytes(32);
      const wrongKey: Uint8Array = getRandomBytes(32);
      const plaintext: Uint8Array = new Uint8Array([1, 2, 3, 4, 5]);
      const associatedData: Uint8Array = new Uint8Array([6, 7, 8]);

      const ciphertext: Uint8Array = PQXDHCrypto.aeadEnc(
        key,
        plaintext,
        associatedData,
      );

      expect(() =>
        PQXDHCrypto.aeadDec(wrongKey, ciphertext, associatedData),
      ).toThrow(
        "Помилка автентифікації: шифротекст або додаткові дані були змінені",
      );
    });

    it("should fail decryption with modified ciphertext", () => {
      const key: Uint8Array = getRandomBytes(32);
      const plaintext: Uint8Array = new Uint8Array([1, 2, 3, 4, 5]);
      const associatedData: Uint8Array = new Uint8Array([6, 7, 8]);

      const ciphertext: Uint8Array = PQXDHCrypto.aeadEnc(
        key,
        plaintext,
        associatedData,
      );
      const modifiedCiphertext: Uint8Array = new Uint8Array(ciphertext);
      modifiedCiphertext[modifiedCiphertext.length - 1] ^= 1; // Flip a bit

      expect(() =>
        PQXDHCrypto.aeadDec(key, modifiedCiphertext, associatedData),
      ).toThrow(
        "Помилка автентифікації: шифротекст або додаткові дані були змінені",
      );
    });
  });
});
