# X3DH+ (Post-Quantum Enhanced) Protocol Documentation (Hybrid Key Exchange)

## Overview

The **X3DH+** protocol is an extension of the **Extended Triple Diffie-Hellman (X3DH)** protocol, widely used in messaging applications like Signal, enhanced with post-quantum cryptography to protect against future quantum attacks. It combines classical elliptic curve cryptography (**Ed25519** and **X25519**) with post-quantum lattice-based cryptography (**ML-KEM-768**). The protocol enables two parties (Alice and Bob) to establish a shared secret key in an asynchronous environment.

### Key Features

- **Hybrid Security**: Combines X25519 (128-bit security against classical attacks) with ML-KEM-768 (~192-bit classical and ~170-bit quantum security).
- **Forward Secrecy**: Use of one-time keys (`opk`, `pq_opk`) protects past sessions.
- **Authentication**: Signature of the signed pre-key (`spk`) and transmission of the identity key (`ikA`) ensure authenticity verification.

---

## Dependencies

- **`@noble/curves/ed25519`**: Key generation for Ed25519 and X25519, signatures, and conversions.
- **`@noble/hashes/hkdf`** and **`@noble/hashes/sha256`**: Key derivation and expansion using HKDF with SHA-256.
- **`@noble/post-quantum/ml-kem`**: Implementation of ML-KEM-768 (Kyber) for post-quantum cryptography.

---

## Data Types

### `PublicKey`
- **Description**: A public key represented as a byte array.
- **Type**: `Uint8Array`

### `PrivateKey`
- **Description**: A private key represented as a byte array.
- **Type**: `Uint8Array`

### `KeyPair`
- **Description**: A pair of public and private keys.
- **Structure**:
  ```typescript
  export interface KeyPair {
    publicKey: PublicKey;
    privateKey: PrivateKey;
  }
  ```

### `SignedPreKey`
- **Description**: A signed pre-key (X25519) including a signature from Ed25519.
- **Structure**:
  ```typescript
  export interface SignedPreKey {
    keyPair: KeyPair;
    signature: Uint8Array; // 64 bytes, Ed25519 signature
  }
  ```

### `Bundle`
- **Description**: A set of user keys for publication and exchange.
- **Structure**:
  ```typescript
  export interface Bundle {
    ik: KeyPair;        // Long-term Ed25519 key
    spk: SignedPreKey;  // Signed X25519 pre-key
    opk?: KeyPair;      // One-time X25519 key (optional)
    pq_ik: KeyPair;     // Long-term ML-KEM-768 key
    pq_spk: KeyPair;    // Signed ML-KEM-768 pre-key
    pq_opk?: KeyPair;   // One-time ML-KEM-768 key (optional)
  }
  ```
- **Example Data**:
  ```json
  {
    "ik": {
      "publicKey": Uint8Array.from([68, 91, 115, 209, 107, 217, 245, 60, 224, 48, 25, 46, 110, 143, 155, 193, 162, 188, 145, 1, 84, 136, 134, 99, 236, 50, 51, 163, 223, 63, 173, 122]),
      "privateKey": Uint8Array.from([112, 92, 204, 111, 156, 16, 57, 208, 13, 53, 3, 21, 234, 255, 97, 153, 243, 137, 152, 15, 200, 244, 127, 179, 245, 133, 223, 57, 157, 242, 217, 157])
    },
    "spk": {
      "keyPair": {
        "publicKey": Uint8Array.from([/* 32 bytes */]),
        "privateKey": Uint8Array.from([/* 32 bytes */])
      },
      "signature": Uint8Array.from([187, 101, 199, 251, 168, 156, 97, 222, 13, 252, 71, 46, 237, 79, 99, 233, 107, 30, 11, 75, 98, 100, 34, 228, 211, 225, 254, 33, 114, 44, 112, 95, 61, 20, 26, 160, 75, 53, 65, 135, 96, 254, 35, 222, 177, 62, 35, 152, 81, 33, 223, 119, 88, 73, 216, 4, 54, 194, 55, 187, 179, 197, 61, 15])
    },
    "opk": {
      "publicKey": Uint8Array.from([236, 109, 95, 137, 85, 192, 72, 243, 41, 216, 156, 130, 69, 245, 55, 37, 55, 131, 244, 177, 238, 3, 160, 14, 175, 39, 30, 218, 127, 81, 74, 115]),
      "privateKey": Uint8Array.from([177, 139, 251, 30, 97, 244, 248, 209, 117, 239, 91, 181, 209, 187, 166, 199, 19, 130, 175, 67, 237, 243, 216, 254, 247, 133, 6, 1, 49, 112, 131, 135])
    },
    "pq_ik": {
      "publicKey": Uint8Array.from([106, 90, 115, 147, 6, 15, 118, 11, 34, 6, 228, 162, 242, 234, 205, 50, /* ... 800 bytes */]),
      "privateKey": Uint8Array.from([226, 0, 60, 153, 236, 207, 160, 65, 55, 64, 20, 171, 128, 70, 47, 18, /* ... 1632 bytes */])
    },
    "pq_spk": {
      "publicKey": Uint8Array.from([40, 76, 93, 50, 247, 62, 136, 226, 186, 182, 246, 9, 73, 250, 149, 61, /* ... 800 bytes */]),
      "privateKey": Uint8Array.from([22, 225, 184, 174, 251, 194, 56, 250, 127, 189, 168, 124, 168, 80, 157, 112, /* ... 1632 bytes */])
    },
    "pq_opk": {
      "publicKey": Uint8Array.from([178, 129, 91, 74, 41, 169, 117, 118, 138, 202, 154, 134, 206, 6, 128, 167, /* ... 800 bytes */]),
      "privateKey": Uint8Array.from([23, 54, 123, 150, 43, 79, 117, 8, 74, 74, 170, 140, 52, 225, 192, 57, /* ... 1632 bytes */])
    }
  }
  ```

### `InitialMessage`
- **Description**: The initial message sent by Alice to Bob to establish the shared secret.
- **Structure**:
  ```typescript
  export interface InitialMessage {
    version: string;           // Protocol version, e.g., "X3DH+ v1.0"
    ekA_ec: PublicKey;         // Alice's ephemeral X25519 key (32 bytes)
    ekA_pq: PublicKey;         // Alice's ephemeral ML-KEM-768 key (800 bytes)
    encaps_pq: {
      ik: Uint8Array;          // Ciphertext for Bob's pq_ik (1088 bytes)
      spk: Uint8Array;         // Ciphertext for Bob's pq_spk (1088 bytes)
      opk?: Uint8Array;        // Ciphertext for Bob's pq_opk (1088 bytes, optional)
    };
    ikA: PublicKey;            // Alice's identity key (Ed25519, 32 bytes)
  }
  ```

---

## Functions

### `generateBundle`
- **Description**: Generates a key bundle (`Bundle`) for a user.
- **Signature**:
  ```typescript
  export async function generateBundle(): Promise<Bundle>
  ```
- **Return Value**: A `Bundle` object containing the keys.
- **Process**:
  1. Generates `ik` (Ed25519).
  2. Generates `spk` (X25519) and signs it with `ik`.
  3. Generates `opk` (X25519, optional).
  4. Generates `pq_ik`, `pq_spk`, `pq_opk` (ML-KEM-768).

### `computeSharedSecretAlice`
- **Description**: Computes the shared secret for Alice and creates the initial message.
- **Signature**:
  ```typescript
  export async function computeSharedSecretAlice(
    bundle: Bundle,      // Alice's key bundle
    recipient: Bundle    // Bob's key bundle
  ): Promise<{ sharedSecret: Uint8Array; initialMessage: InitialMessage }>
  ```
- **Parameters**:
  - `bundle`: Alice's keys.
  - `recipient`: Bob's published keys.
- **Return Value**:
  - `sharedSecret`: The shared secret (32 bytes).
  - `initialMessage`: The message for Bob.
- **Process**:
  1. Generates ephemeral keys `ekA_ec` (X25519) and `ekA_pq` (ML-KEM-768).
  2. Verifies Bob's `spk` signature.
  3. Computes DH secrets (`dh1–dh4`) using X25519.
  4. Computes PQ secrets (`pq1–pq3`) using ML-KEM-768.
  5. Combines secrets via HKDF.

### `computeSharedSecretBob`
- **Description**: Computes the shared secret for Bob based on the received message.
- **Signature**:
  ```typescript
  export async function computeSharedSecretBob(
    bundle: Bundle,         // Bob's key bundle
    message: InitialMessage, // Message from Alice
    alice_ik: PublicKey     // Alice's identity key (optional)
  ): Promise<Uint8Array>
  ```
- **Parameters**:
  - `bundle`: Bob's keys.
  - `message`: Message from Alice.
  - `alice_ik`: Known Alice identity key for verification (can use `message.ikA`).
- **Return Value**: The shared secret (32 bytes).
- **Process**:
  1. Computes DH secrets (`dh1–dh4`) using X25519.
  2. Decrypts PQ secrets (`pq1–pq3`) using ML-KEM-768.
  3. Combines secrets via HKDF.

---

## Usage Example

### Code
```typescript
import { generateBundle, computeSharedSecretAlice, computeSharedSecretBob } from './x3dh_plus';

// Generate keys for Alice and Bob
async function runExample() {
  const aliceBundle = await generateBundle();
  const bobBundle = await generateBundle();

  // Alice computes the secret and creates the message
  const { sharedSecret: aliceSecret, initialMessage } = await computeSharedSecretAlice(aliceBundle, bobBundle);
  console.log('Alice Secret:', aliceSecret.toString('hex'));

  // Bob computes the secret based on the message
  const bobSecret = await computeSharedSecretBob(bobBundle, initialMessage, aliceBundle.ik.publicKey);
  console.log('Bob Secret:', bobSecret.toString('hex'));

  // Verify that the secrets match
  const secretsMatch = aliceSecret.toString('hex') === bobSecret.toString('hex');
  console.log('Secrets match:', secretsMatch);
}

runExample();
```

### Output
```
Alice Secret: f2d7d5fb9b45b02bf03c499461d38c6fa343b0ca2957344abb6068f4db7018aa
Bob Secret: f2d7d5fb9b45b02bf03c499461d38c6fa343b0ca2957344abb6068f4db7018aa
Secrets match: true
```

### Explanation
1. **Key Generation**: Alice and Bob generate their `Bundle` using `generateBundle`.
2. **Alice**: Uses her keys and Bob’s keys to compute the secret and create `initial
