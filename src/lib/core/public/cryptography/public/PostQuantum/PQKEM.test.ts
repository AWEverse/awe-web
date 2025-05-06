import {
  PQKEM,
  PQKEMParameters,
  CryptoKeyPair,
  X3DHError,
  Curve,
  TPQKEM,
  HybridMode,
} from "./PQKEM";
import {
  randombytes_buf as getRandomBytes,
  crypto_scalarmult_base,
  ready,
  crypto_scalarmult,
} from "libsodium-wrappers";
import { ml_kem512 } from "@noble/post-quantum/ml-kem";

beforeAll(async () => {
  await ready;
});

describe("PQKEM", () => {
  // Common parameters for tests
  const defaultParams: PQKEMParameters = {
    curve: "curve25519" as Curve,
    kem: "ml-kem-512" as TPQKEM,
    hash: "SHA-256",
    hybridMode: "concat" as HybridMode,
    keyLength: 32,
  };

  // 1. Key Pair Generation
  describe("generateKeyPair", () => {
    it("should generate valid ECC and PQKEM key pairs", () => {
      const keyPairs: CryptoKeyPair[] = PQKEM.generateKeyPair("ml-kem-512");
      expect(keyPairs).toHaveLength(2);

      const [eccKeyPair, pqkemKeyPair] = keyPairs;

      // ECC key pair (Curve25519)
      expect(eccKeyPair.publicKey).toBeInstanceOf(Uint8Array);
      expect(eccKeyPair.publicKey.length).toBe(32);
      expect(eccKeyPair.privateKey).toBeInstanceOf(Uint8Array);
      expect(eccKeyPair.privateKey.length).toBe(32);

      // PQKEM key pair (ml-kem-512)
      expect(pqkemKeyPair.publicKey).toBeInstanceOf(Uint8Array);
      expect(pqkemKeyPair.publicKey.length).toBe(800);
      expect(pqkemKeyPair.privateKey).toBeInstanceOf(Uint8Array);
      expect(pqkemKeyPair.privateKey.length).toBe(1632);
    });

    it("should generate key pairs for different KEMs", () => {
      const kemSizes: { kem: PQKEM; pubLen: number; privLen: number }[] = [
        { kem: "ml-kem-512", pubLen: 800, privLen: 1632 },
        { kem: "ml-kem-768", pubLen: 1184, privLen: 2400 },
        { kem: "ml-kem-1024", pubLen: 1568, privLen: 3168 },
      ];

      for (const { kem, pubLen, privLen } of kemSizes) {
        const [_, pqkemKeyPair] = PQKEM.generateKeyPair(kem);
        expect(pqkemKeyPair.publicKey.length).toBe(pubLen);
        expect(pqkemKeyPair.privateKey.length).toBe(privLen);
      }
    });
  });

  // 2. Derive Shared Secret
  describe("deriveSharedSecret", () => {
    it("should derive shared secret in concat mode", () => {
      const eccSecret: Uint8Array = getRandomBytes(32);
      const pqSecret: Uint8Array = getRandomBytes(32);

      const params: PQKEMParameters = {
        ...defaultParams,
        hybridMode: "concat",
      };
      const sharedSecret: Uint8Array = PQKEM.deriveSharedSecret(
        params,
        eccSecret,
        pqSecret,
      );
      expect(sharedSecret).toBeInstanceOf(Uint8Array);
      expect(sharedSecret.length).toBe(32); // SHA-256
    });

    it("should derive shared secret in concat mode with SHA-512", () => {
      const eccSecret: Uint8Array = getRandomBytes(32);
      const pqSecret: Uint8Array = getRandomBytes(32);

      const params: PQKEMParameters = {
        ...defaultParams,
        hybridMode: "concat",
        hash: "SHA-512",
      };
      const sharedSecret: Uint8Array = PQKEM.deriveSharedSecret(
        params,
        eccSecret,
        pqSecret,
      );
      expect(sharedSecret.length).toBe(64); // SHA-512
    });

    it("should derive shared secret in xor mode", () => {
      const eccSecret: Uint8Array = getRandomBytes(32);
      const pqSecret: Uint8Array = getRandomBytes(32);

      const params: PQKEMParameters = { ...defaultParams, hybridMode: "xor" };
      const sharedSecret: Uint8Array = PQKEM.deriveSharedSecret(
        params,
        eccSecret,
        pqSecret,
      );
      expect(sharedSecret.length).toBe(32); // SHA-256
    });

    it("should throw error in xor mode with mismatched key lengths", () => {
      const eccSecret: Uint8Array = getRandomBytes(32);

      const params: PQKEMParameters = { ...defaultParams, hybridMode: "xor" };
      const shortPqSecret: Uint8Array = getRandomBytes(31);
      expect(() =>
        PQKEM.deriveSharedSecret(params, eccSecret, shortPqSecret),
      ).toThrowError(X3DHError);
      expect(() =>
        PQKEM.deriveSharedSecret(params, eccSecret, shortPqSecret),
      ).toThrowError("Key length mismatch");
    });

    it("should derive shared secret in hkdf mode", () => {
      const eccSecret: Uint8Array = getRandomBytes(32);
      const pqSecret: Uint8Array = getRandomBytes(32);

      const params: PQKEMParameters = {
        ...defaultParams,
        hybridMode: "hkdf",
        keyLength: 48,
      };
      const sharedSecret: Uint8Array = PQKEM.deriveSharedSecret(
        params,
        eccSecret,
        pqSecret,
      );
      expect(sharedSecret.length).toBe(48); // Custom keyLength
    });

    it("should throw error for invalid hybrid mode", () => {
      const eccSecret: Uint8Array = getRandomBytes(32);
      const pqSecret: Uint8Array = getRandomBytes(32);

      const params: PQKEMParameters = {
        ...defaultParams,
        hybridMode: "invalid" as any,
      };
      expect(() =>
        PQKEM.deriveSharedSecret(params, eccSecret, pqSecret),
      ).toThrowError(X3DHError);
      expect(() =>
        PQKEM.deriveSharedSecret(params, eccSecret, pqSecret),
      ).toThrowError("Invalid hybrid mode");
    });
  });

  // 3. Encapsulation
  describe("encapsulate", () => {
    it("should encapsulate and produce valid outputs", () => {
      const params: PQKEMParameters = { ...defaultParams, kem: "ml-kem-512" };
      const recipientKeyPair: CryptoKeyPair[] =
        PQKEM.generateKeyPair("ml-kem-512");
      const recipientPublicKey = {
        ecc: recipientKeyPair[0].publicKey,
        pqkem: recipientKeyPair[1].publicKey,
      };

      const result = PQKEM.encapsulate(params, recipientPublicKey);
      expect(result.ciphertext).toBeInstanceOf(Uint8Array);
      expect(result.ciphertext.length).toBe(768); // ml-kem-512 ciphertext length
      expect(result.sharedSecret).toBeInstanceOf(Uint8Array);
      expect(result.sharedSecret.length).toBe(32);
      expect(result.ephemeralPublicKey).toBeInstanceOf(Uint8Array);
      expect(result.ephemeralPublicKey.length).toBe(32);
    });

    it("should use provided ephemeral key", () => {
      const params: PQKEMParameters = { ...defaultParams, kem: "ml-kem-512" };
      const recipientKeyPair: CryptoKeyPair[] =
        PQKEM.generateKeyPair("ml-kem-512");
      const recipientPublicKey = {
        ecc: recipientKeyPair[0].publicKey,
        pqkem: recipientKeyPair[1].publicKey,
      };
      const ephemeralKey: Uint8Array = getRandomBytes(32);

      const result = PQKEM.encapsulate(
        params,
        recipientPublicKey,
        ephemeralKey,
      );
      const expectedPublicKey: Uint8Array =
        crypto_scalarmult_base(ephemeralKey);
      expect(result.ephemeralPublicKey).toEqual(expectedPublicKey);
    });

    it("should produce different shared secrets for different recipients", () => {
      const params: PQKEMParameters = { ...defaultParams, kem: "ml-kem-512" };
      const recipient1KeyPair: CryptoKeyPair[] =
        PQKEM.generateKeyPair("ml-kem-512");
      const recipient2KeyPair: CryptoKeyPair[] =
        PQKEM.generateKeyPair("ml-kem-512");

      const result1 = PQKEM.encapsulate(params, {
        ecc: recipient1KeyPair[0].publicKey,
        pqkem: recipient1KeyPair[1].publicKey,
      });
      const result2 = PQKEM.encapsulate(params, {
        ecc: recipient2KeyPair[0].publicKey,
        pqkem: recipient2KeyPair[1].publicKey,
      });

      expect(result1.sharedSecret).not.toEqual(result2.sharedSecret);
    });
  });

  // 4. Decapsulation
  describe('decapsulate', () => {
    // Independent PQKEM Test
    it('should have matching PQKEM shared secrets', () => {
      const { publicKey, secretKey } = ml_kem512.keygen();
      const { sharedSecret: encSharedSecret, cipherText } = ml_kem512.encapsulate(publicKey);
      const decSharedSecret = ml_kem512.decapsulate(cipherText, secretKey);
      expect(decSharedSecret).toEqual(encSharedSecret);
    });

    // Decapsulation Test with Detailed Logging and Assertions
    it('should decapsulate and match encapsulated shared secret', () => {
      const params: PQKEMParameters = { ...defaultParams, kem: 'ml-kem-512' };
      const recipientKeyPair: CryptoKeyPair[] = PQKEM.generateKeyPair('ml-kem-512');
      const recipientPublicKey = {
        ecc: recipientKeyPair[0].publicKey,
        pqkem: recipientKeyPair[1].publicKey,
      };
      const recipientPrivateKey = {
        eccPrivateKey: recipientKeyPair[0].privateKey,
        pqkemPrivateKey: recipientKeyPair[1].privateKey,
      };

      const ephemeralPrivateKey: Uint8Array = getRandomBytes(32);
      const ephemeralPublicKey: Uint8Array = crypto_scalarmult_base(ephemeralPrivateKey);

      const { ciphertext, sharedSecret: encSharedSecret, ephemeralPublicKey: encapsulatedEphemeralPublicKey } = PQKEM.encapsulate(params, recipientPublicKey, ephemeralPrivateKey);

      expect(encapsulatedEphemeralPublicKey).toEqual(ephemeralPublicKey);

      // Compute and log intermediate secrets for encapsulation
      const eccSecretEnc = crypto_scalarmult(ephemeralPrivateKey, recipientPublicKey.ecc);
      // Use the actual PQ shared secret from the encapsulation result
      const pqSecretEnc = ml_kem512.decapsulate(ciphertext, recipientPrivateKey.pqkemPrivateKey);
      console.log('Encapsulation - ECC Secret:', Buffer.from(eccSecretEnc).toString('hex'));
      console.log('Encapsulation - PQ Secret:', Buffer.from(pqSecretEnc).toString('hex'));
      console.log('Encapsulation - Hybrid Shared Secret:', Buffer.from(encSharedSecret).toString('hex'));
      // Compute and log intermediate secrets for decapsulation
      const eccSecretDec = crypto_scalarmult(recipientPrivateKey.eccPrivateKey, ephemeralPublicKey);
      const pqSecretDec = ml_kem512.decapsulate(ciphertext, recipientPrivateKey.pqkemPrivateKey);
      console.log('Decapsulation - ECC Secret:', Buffer.from(eccSecretDec).toString('hex'));
      console.log('Decapsulation - PQ Secret:', Buffer.from(pqSecretDec).toString('hex'));

      const decSharedSecret: Uint8Array = PQKEM.decapsulate(params, ciphertext, recipientPrivateKey, encapsulatedEphemeralPublicKey);
      console.log('Decapsulation - Hybrid Shared Secret:', Buffer.from(decSharedSecret).toString('hex'));

      // Assert intermediate secrets match
      expect(eccSecretEnc).toEqual(eccSecretDec);
      expect(pqSecretEnc).toEqual(pqSecretDec); // Now both are derived from decapsulation
      expect(decSharedSecret).toEqual(encSharedSecret);
      expect(decSharedSecret).toEqual(encSharedSecret);
    });

    it('should throw error for invalid ciphertext length', () => {
      const params: PQKEMParameters = { ...defaultParams, kem: 'ml-kem-512' };
      const recipientKeyPair: CryptoKeyPair[] = PQKEM.generateKeyPair('ml-kem-512');
      const recipientPrivateKey = {
        eccPrivateKey: recipientKeyPair[0].privateKey,
        pqkemPrivateKey: recipientKeyPair[1].privateKey,
      };
      const invalidCiphertext: Uint8Array = getRandomBytes(767); // Incorrect length
      const senderPublicKey: Uint8Array = crypto_scalarmult_base(getRandomBytes(32));

      expect(() => PQKEM.decapsulate(params, invalidCiphertext, recipientPrivateKey, senderPublicKey))
        .toThrowError(X3DHError);
      expect(() => PQKEM.decapsulate(params, invalidCiphertext, recipientPrivateKey, senderPublicKey))
        .toThrowError('Invalid key/ciphertext length for ml-kem-512');
    });

    it('should throw error for invalid private key length', () => {
      const params: PQKEMParameters = { ...defaultParams, kem: 'ml-kem-512' };
      const recipientKeyPair: CryptoKeyPair[] = PQKEM.generateKeyPair('ml-kem-512');
      const recipientPrivateKey = {
        eccPrivateKey: recipientKeyPair[0].privateKey,
        pqkemPrivateKey: getRandomBytes(1631), // Incorrect length
      };
      const ciphertext: Uint8Array = ml_kem512.encapsulate(recipientKeyPair[1].publicKey).cipherText;
      const senderPublicKey: Uint8Array = crypto_scalarmult_base(getRandomBytes(32));

      expect(() => PQKEM.decapsulate(params, ciphertext, recipientPrivateKey, senderPublicKey))
        .toThrowError(X3DHError);
      expect(() => PQKEM.decapsulate(params, ciphertext, recipientPrivateKey, senderPublicKey))
        .toThrowError('Invalid key/ciphertext length for ml-kem-512');
    });
  });


  // 5. Hybrid Modes
  describe("hybrid modes", () => {
    const testHybridMode = (mode: HybridMode, expectedLength: number) => {
      it(`should derive shared secret correctly in ${mode} mode`, () => {
        const params: PQKEMParameters = {
          ...defaultParams,
          hybridMode: mode,
          keyLength: expectedLength,
        };
        const eccSecret: Uint8Array = getRandomBytes(32);
        const pqSecret: Uint8Array = getRandomBytes(32);
        const sharedSecret: Uint8Array = PQKEM.deriveSharedSecret(
          params,
          eccSecret,
          pqSecret,
        );
        expect(sharedSecret.length).toBe(expectedLength);
      });
    };

    testHybridMode("concat", 32);
    testHybridMode("xor", 32);
    testHybridMode("hkdf", 48); // Custom length
  });

  // Additional test to verify hybrid derivation consistency
  it('should consistently derive hybrid shared secret', () => {
    const eccSecret = getRandomBytes(32);
    const pqSecret = getRandomBytes(32);
    const hybridSecret1 = PQKEM.deriveSharedSecret(defaultParams, eccSecret, pqSecret);
    const hybridSecret2 = PQKEM.deriveSharedSecret(defaultParams, eccSecret, pqSecret);
    expect(hybridSecret1).toEqual(hybridSecret2);
  });
});
