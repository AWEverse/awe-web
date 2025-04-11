# X3DHPQ (Post-Quantum Enhanced) Protocol Documentation (Hybrid Key Exchange)

## Overview

The **X3DHPQ** protocol extends the **Extended Triple Diffie-Hellman (X3DH)** protocol, originally developed for secure messaging (e.g., Signal), by integrating post-quantum cryptography to mitigate future quantum threats. It combines classical elliptic curve cryptography (**Ed25519** for signing, **X25519** for key exchange) with the lattice-based **ML-KEM-768** (Kyber) for post-quantum key encapsulation. This hybrid approach enables two parties (Alice and Bob) to establish a shared secret key asynchronously, ensuring both classical and quantum-resistant security.

### Key Features

- **Hybrid Security**: Merges X25519 (~128-bit classical security) with ML-KEM-768 (~192-bit classical, ~170-bit quantum security).
- **Forward Secrecy**: Optional one-time pre-keys (`oneTimePreKey`, `pqOneTimePreKey`) protect past sessions.
- **Authentication**: Ed25519 signatures on the signed pre-key (`signedPreKey`) and inclusion of identity keys ensure authenticity.

---

## Directory Structure

```
src/x3dh-pq/
├── types.ts              # Type definitions for keys and messages
├── config.ts             # Protocol constants (e.g., shared secret length)
├── crypto/              # Cryptographic primitives
│   ├── index.ts         # Exports for crypto modules
│   ├── x25519.ts        # X25519 key exchange operations
│   ├── ed25519.ts       # Ed25519 signing and verification
│   ├── ml-kem.ts        # ML-KEM (Kyber) key encapsulation (512, 768, 1024 variants)
│   └── utils.ts         # Crypto utilities (e.g., key erasure)
├── protocol/            # X3DHPQPQ protocol logic
│   ├── index.ts         # Exports for protocol modules
│   ├── key-bundle.ts    # Key bundle generation
│   ├── sender.ts        # Sender-side shared secret computation
│   ├── receiver.ts      # Receiver-side shared secret computation
│   └── errors.ts        # Custom protocol errors
├── utils/               # General utilities
│   ├── index.ts         # Exports for utils
│   ├── arrays.ts        # Array manipulation (e.g., concatenation)
│   └── secure.ts        # Secure operations (e.g., memory erasure)
└── index.ts             # Public API exports
```

---

## Dependencies

- **`@noble/curves/ed25519`**: Provides Ed25519 key generation, signing, verification, and X25519 utilities.
- **`@noble/hashes/hkdf`** and **`@noble/hashes/sha256`**: Implements HKDF with SHA-256 for key derivation.
- **`@noble/post-quantum/ml-kem`**: Offers ML-KEM (Kyber) implementations for post-quantum key encapsulation (512, 768, 1024 variants).

---

## Data Types (`src/x3dh-pq/types.ts`)

### `PublicKey`
- **Description**: A branded `Uint8Array` representing a public key for cryptographic operations (e.g., X25519, ML-KEM, Ed25519).
- **Type**: `Brand<Uint8Array, "PublicKey">`

### `PrivateKey`
- **Description**: A branded `Uint8Array` representing a private key, kept secret for signing, key exchange, or decapsulation.
- **Type**: `Brand<Uint8Array, "PrivateKey">`

### `KeyPair`
- **Description**: A pair of public and private keys used across cryptographic algorithms.
- **Structure**:
  ```typescript
  export interface KeyPair {
    publicKey: PublicKey;
    privateKey: PrivateKey;
  }
  ```

### `SignedPreKey`
- **Description**: An X25519 pre-key signed with an Ed25519 identity key for authenticity.
- **Structure**:
  ```typescript
  export interface SignedPreKey {
    keyPair: KeyPair;      // X25519 key pair
    signature: Uint8Array; // 64-byte Ed25519 signature
  }
  ```

### `KeyBundle`
- **Description**: A collection of keys published by a user for X3DHPQPQ key exchange.
- **Structure**:
  ```typescript
  export interface KeyBundle {
    identityKey: KeyPair;        // Ed25519 long-term key for signing
    identityKeyX25519: KeyPair;  // X25519 long-term key for DH
    signedPreKey: SignedPreKey;  // X25519 pre-key, signed with Ed25519
    oneTimePreKey?: KeyPair;     // Optional X25519 one-time key
    pqIdentityKey: KeyPair;      // ML-KEM-768 long-term key
    pqSignedPreKey: KeyPair;     // ML-KEM-768 pre-key
    pqOneTimePreKey?: KeyPair;   // Optional ML-KEM-768 one-time key
  }
  ```
- **Example Data**:
  ```json
  {
    "identityKey": {
      "publicKey": "445bd3d16bd9f53ce030192e6e8f9bc1a2bc910154888663ec3233a3df3fad7a",
      "privateKey": "705ccc6f9c1039d00d350315eaff6199f389980fc8f47fb3f585df399df2d99d"
    },
    "identityKeyX25519": {
      "publicKey": "ec6d5f8955c048f329d89c8245f537253783f4b1ee03a00eaf271eda7f514a73",
      "privateKey": "b18bfb1e61f4f8d175ef5bb5d1bb6ec71382af43edf3d8fef785060131708787"
    },
    "signedPreKey": {
      "keyPair": {
        "publicKey": "e8737c5e57df9e5b6cd6b1e9d6b0e2f6f6c7f5e5e7f8f9fafbfc8d8e9f7e6d5c",
        "privateKey": "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2"
      },
      "signature": "bb65c7fba89c61de0dfc472eed4f63e96b1e0b4b626422e4d3e1fe21722c705f3d141aa04b35418760fe23deb13e23985121df775849d80436c237bbb3c53d0f"
    },
    "oneTimePreKey": {
      "publicKey": "a8f08e5b45c3d6e9f7a2b1c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4",
      "privateKey": "f0e1d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e1"
    },
    "pqIdentityKey": {
      "publicKey": "6a5a7393060f760b2206e4a2f2eacd32...", // 1184 bytes
      "privateKey": "e2003c99ecf7a041374014ab80472f12..." // 2400 bytes
    },
    "pqSignedPreKey": {
      "publicKey": "284c5d32f73e88e2bab6f60949fa953d...", // 1184 bytes
      "privateKey": "16e1b8aefbc238fa7fbda87ca8509d70..." // 2400 bytes
    },
    "pqOneTimePreKey": {
      "publicKey": "b2815b4a29a97576d8cac29a860880a7...", // 1184 bytes
      "privateKey": "17367b962b4f75084a4aaa8c34e1c039..." // 2400 bytes
    }
  }
  ```

### `InitialMessage`
- **Description**: The initial message sent by Alice to Bob to initiate the shared secret computation.
- **Structure**:
  ```typescript
  export interface InitialMessage {
    version: string;           // Protocol version, e.g., "X3DHPQPQ"
    ephemeralKeyEC: PublicKey; // Alice's ephemeral X25519 key (32 bytes)
    ephemeralKeyPQ: PublicKey; // Alice's ephemeral ML-KEM-768 key (1184 bytes)
    senderIdentityKey: PublicKey; // Alice's Ed25519 identity key (32 bytes)
    senderIdentityKeyX25519: PublicKey; // Alice's X25519 identity key (32 bytes)
    pqEncapsulations: {
      identity: Uint8Array;    // Ciphertext for Bob's pqIdentityKey (1088 bytes)
      signedPreKey: Uint8Array; // Ciphertext for Bob's pqSignedPreKey (1088 bytes)
      oneTimePreKey?: Uint8Array; // Ciphertext for Bob's pqOneTimePreKey (1088 bytes, optional)
    };
  }
  ```

---

## Cryptographic Primitives

### `Ed25519` (`src/x3dh-pq/crypto/ed25519.ts`)
- **Description**: Asynchronous Ed25519 operations for signing and verification.
- **Methods**:
  - `async generateKeyPair(): Promise<KeyPair>`: Generates a 32-byte public/private key pair.
  - `async sign(message: Uint8Array, privateKey: PrivateKey): Promise<Uint8Array>`: Creates a 64-byte signature.
  - `async verify(signature: Uint8Array, message: Uint8Array, publicKey: PublicKey): Promise<boolean>`: Verifies a signature.

### `X25519` (`src/x3dh-pq/crypto/x25519.ts`)
- **Description**: X25519 operations for Diffie-Hellman key exchange.
- **Methods**:
  - `generateKeyPair(): KeyPair`: Generates a 32-byte public/private key pair.
  - `computeSharedSecret(privateKey: PrivateKey, publicKey: PublicKey): Uint8Array`: Computes a 32-byte shared secret.

### `MLKEM768` (`src/x3dh-pq/crypto/ml-kem.ts`)
- **Description**: Static ML-KEM-768 operations for post-quantum key encapsulation (default variant).
- **Static Properties**:
  - `VARIANT: string = "768"`: Variant identifier.
  - `SECURITY_LEVEL: number = 192`: Quantum security (~170-bit).
  - `PUBLIC_KEY_LENGTH: number = 1184`: Public key size.
  - `PRIVATE_KEY_LENGTH: number = 2400`: Private key size.
  - `CIPHERTEXT_LENGTH: number = 1088`: Ciphertext size.
  - `SHARED_SECRET_LENGTH: number = 32`: Shared secret size.
- **Methods**:
  - `static generateKeyPair(): KeyPair`: Generates ML-KEM-768 key pair.
  - `static encapsulate(publicKey: PublicKey): { sharedSecret: Uint8Array; cipherText: Uint8Array }`: Creates a 32-byte shared secret and 1088-byte ciphertext.
  - `static decapsulate(cipherText: Uint8Array, privateKey: PrivateKey): Uint8Array`: Decapsulates to a 32-byte shared secret.

> **Note**: `MLKEM512` and `MLKEM1024` are also available with different security levels and sizes (512: 800/1632/768, 1024: 1568/3168/1568).

---

## Protocol Functions

### `generateKeyBundle` (`src/x3dh-pq/protocol/key-bundle.ts`)
- **Description**: Generates a `KeyBundle` for a user.
- **Signature**:
  ```typescript
  export async function generateKeyBundle(): Promise<KeyBundle>
  ```
- **Process**:
  1. Generate `identityKey` (Ed25519).
  2. Generate `identityKeyX25519` (X25519).
  3. Generate `signedPreKey` (X25519) and sign with `identityKey`.
  4. Generate optional `oneTimePreKey` (X25519).
  5. Generate `pqIdentityKey`, `pqSignedPreKey`, and optional `pqOneTimePreKey` (ML-KEM-768).

### `computeSenderSharedSecret` (`src/x3dh-pq/protocol/sender.ts`)
- **Description**: Computes Alice's shared secret and creates the initial message.
- **Signature**:
  ```typescript
  export async function computeSenderSharedSecret(
    senderBundle: KeyBundle,
    recipientBundle: KeyBundle
  ): Promise<{ sharedSecret: Uint8Array; initialMessage: InitialMessage }>
  ```
- **Parameters**:
  - `senderBundle`: Alice’s keys.
  - `recipientBundle`: Bob’s published keys.
- **Return Value**:
  - `sharedSecret`: 32-byte shared secret.
  - `initialMessage`: Message for Bob.
- **Process**:
  1. Generate ephemeral keys (`ephemeralKeyEC`, `ephemeralKeyPQ`).
  2. Verify `recipientBundle.signedPreKey.signature`.
  3. Compute four DH secrets (X25519):
     - `dh1`: `identityKeyX25519.privateKey` × `signedPreKey.publicKey`.
     - `dh2`: `ephemeralKeyEC.privateKey` × `identityKeyX25519.publicKey`.
     - `dh3`: `ephemeralKeyEC.privateKey` × `signedPreKey.publicKey`.
     - `dh4`: `ephemeralKeyEC.privateKey` × `oneTimePreKey.publicKey` (if present).
  4. Compute three PQ encapsulations (ML-KEM-768):
     - `pq1`: Encapsulate `pqIdentityKey.publicKey`.
     - `pq2`: Encapsulate `pqSignedPreKey.publicKey`.
     - `pq3`: Encapsulate `pqOneTimePreKey.publicKey` (if present).
  5. Concatenate secrets and derive via HKDF-SHA256.

### `computeReceiverSharedSecret` (`src/x3dh-pq/protocol/receiver.ts`)
- **Description**: Computes Bob’s shared secret from Alice’s message.
- **Signature**:
  ```typescript
  export async function computeReceiverSharedSecret(
    receiverBundle: KeyBundle,
    message: InitialMessage
  ): Promise<Uint8Array>
  ```
- **Parameters**:
  - `receiverBundle`: Bob’s keys.
  - `message`: Alice’s initial message.
- **Return Value**: 32-byte shared secret.
- **Process**:
  1. Compute four DH secrets (X25519):
     - `dh1`: `signedPreKey.privateKey` × `senderIdentityKeyX25519`.
     - `dh2`: `identityKeyX25519.privateKey` × `ephemeralKeyEC`.
     - `dh3`: `signedPreKey.privateKey` × `ephemeralKeyEC`.
     - `dh4`: `oneTimePreKey.privateKey` × `ephemeralKeyEC` (if present).
  2. Decapsulate three PQ secrets (ML-KEM-768):
     - `pq1`: Decapsulate `pqEncapsulations.identity` with `pqIdentityKey.privateKey`.
     - `pq2`: Decapsulate `pqEncapsulations.signedPreKey` with `pqSignedPreKey.privateKey`.
     - `pq3`: Decapsulate `pqEncapsulations.oneTimePreKey` with `pqOneTimePreKey.privateKey` (if present).
  3. Concatenate secrets and derive via HKDF-SHA256.

---

## Usage Example

### Code (`example.ts`)
```typescript
import { generateKeyBundle, computeSenderSharedSecret, computeReceiverSharedSecret } from 'src/x3dh-pq';

async function runExample() {
  // Generate bundles for Alice and Bob
  const aliceBundle = await generateKeyBundle();
  const bobBundle = await generateKeyBundle();

  // Alice computes shared secret and initial message
  const { sharedSecret: aliceSecret, initialMessage } = await computeSenderSharedSecret(aliceBundle, bobBundle);
  console.log('Alice Secret:', Buffer.from(aliceSecret).toString('hex'));

  // Bob computes shared secret from Alice's message
  const bobSecret = await computeReceiverSharedSecret(bobBundle, initialMessage);
  console.log('Bob Secret:', Buffer.from(bobSecret).toString('hex'));

  // Verify secrets match
  const secretsMatch = Buffer.from(aliceSecret).toString('hex') === Buffer.from(bobSecret).toString('hex');
  console.log('Secrets match:', secretsMatch);
}

runExample().catch(console.error);
```

### Output
```
Alice Secret: f2d7d5fb9b45b02bf03c499461d38c6fa343b0ca2957344abb6068f4db7018aa
Bob Secret: f2d7d5fb9b45b02bf03c499461d38c6fa343b0ca2957344abb6068f4db7018aa
Secrets match: true
```

### Explanation
1. **Key Generation**: Both parties generate `KeyBundle`s with classical and post-quantum keys.
2. **Alice**: Uses her bundle and Bob’s bundle to compute the shared secret and create the `InitialMessage`.
3. **Bob**: Uses his bundle and Alice’s message to compute the matching shared secret.
4. **Verification**: The identical secrets confirm successful key agreement.

---

## Security Considerations

- **Key Sizes**: ML-KEM-768 uses larger keys (1184/2400 bytes) than X25519 (32/32 bytes), increasing bandwidth but enhancing quantum resistance.
- **Forward Secrecy**: Include one-time pre-keys for full protection against key compromise.
- **Signature Verification**: Always verify `signedPreKey.signature` to prevent impersonation.
- **Key Erasure**: Use `secureErase` from `utils/secure.ts` for ephemeral and private keys post-use.
- **Constant-Time**: `@noble` libraries are constant-time, but verify in production environments.

---

## Notes

- **ML-KEM Variants**: Default is ML-KEM-768; use `MLKEM512` or `MLKEM1024` for different security/performance trade-offs via `crypto/ml-kem.ts`.
- **Async Operations**: Ed25519 methods are async for future-proofing; X25519 and ML-KEM are sync but wrapped for consistency.
- **Error Handling**: `X3DHError` in `protocol/errors.ts` provides detailed failure diagnostics (e.g., `MLKEM_768_ENCAPSULATION_FAILED`).
