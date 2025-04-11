// Step 1: Dependencies and Setup
import {
  ed25519,
  x25519,
} from "@noble/curves/ed25519";
import { hkdf } from "@noble/hashes/hkdf";
import { sha256 } from "@noble/hashes/sha256";
import { ml_kem512 as mlkem512 } from "@noble/post-quantum/ml-kem";

const GLOBAL_VERSION = "X3DH+PQ";
const SPECIFICATION = "X3DH+v2";

// Types
export type PublicKey = Uint8Array;
export type PrivateKey = Uint8Array;

export interface KeyPair {
  publicKey: PublicKey;
  privateKey: PrivateKey;
}

export interface SignedPreKey {
  keyPair: KeyPair;
  signature: Uint8Array;
}

export interface KeyBundle {
  identityKey: KeyPair;             // Ed25519 for signing
  identityKeyX25519: KeyPair;       // X25519 for DH
  signedPreKey: SignedPreKey;       // X25519, signed with Ed25519
  oneTimePreKey?: KeyPair;          // Optional X25519 one-time
  pqIdentityKey: KeyPair;           // ML-KEM
  pqSignedPreKey: KeyPair;
  pqOneTimePreKey?: KeyPair;
}

export interface InitialMessage {
  version: string;
  ephemeralKeyEC: PublicKey;
  ephemeralKeyPQ: PublicKey;
  senderIdentityKey: PublicKey;         // Ed25519
  senderIdentityKeyX25519: PublicKey;   // X25519
  pqEncapsulations: {
    identity: Uint8Array;
    signedPreKey: Uint8Array;
    oneTimePreKey?: Uint8Array;
  };
}

// --- Helper Functions ---

/**
 * Generates a fresh ephemeral key pair (ensures single use) for X25519.
 */
function generateEphemeralKey(): KeyPair {
  const privateKey = x25519.utils.randomPrivateKey();
  const publicKey = x25519.getPublicKey(privateKey);
  return { privateKey, publicKey };
}

/**
 * Computes a shared secret using X25519.
 */
function x25519SharedKey(privateKey: Uint8Array, publicKey: Uint8Array): Uint8Array {
  return x25519.getSharedSecret(privateKey, publicKey);
}

/**
 * Concatenates multiple Uint8Arrays into one.
 */
function concatUint8Arrays(chunks: Uint8Array[]): Uint8Array {
  const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

/**
 * Checks the integrity of a decapsulated secret.
 * For example, expects 32 bytes and non-all-zeros.
 */
function checkDecapsulationIntegrity(sharedSecret: Uint8Array): boolean {
  const EXPECTED_LENGTH = 32;
  if (sharedSecret.length !== EXPECTED_LENGTH) return false;
  if (sharedSecret.every(byte => byte === 0)) return false;
  return true;
}

// --- 1. Efficient Key Management & Key Bundle Generation ---

export async function generateKeyBundle(): Promise<KeyBundle> {
  // Identity key using Ed25519 for signing.
  const identityPrivateKey = ed25519.utils.randomPrivateKey();
  const identityKey: KeyPair = {
    privateKey: identityPrivateKey,
    publicKey: ed25519.getPublicKey(identityPrivateKey),
  };

  // Separate identity key for X25519 (used for Diffie–Hellman key exchange).
  const identityX25519Private = x25519.utils.randomPrivateKey();
  const identityKeyX25519: KeyPair = {
    privateKey: identityX25519Private,
    publicKey: x25519.getPublicKey(identityX25519Private),
  };

  // Generate Signed PreKey (X25519).
  const spkPrivate = x25519.utils.randomPrivateKey();
  const spkPublic = x25519.getPublicKey(spkPrivate);
  const spk: KeyPair = {
    privateKey: spkPrivate,
    publicKey: spkPublic,
  };

  // Sign the Signed PreKey using the Ed25519 identity key.
  const signature = ed25519.sign(spk.publicKey, identityKey.privateKey);

  // Generate one-time pre-key (X25519).
  const otpPrivate = x25519.utils.randomPrivateKey();
  const otpPublic = x25519.getPublicKey(otpPrivate);
  const oneTimePreKey: KeyPair = {
    privateKey: otpPrivate,
    publicKey: otpPublic,
  };

  // Generate Post-Quantum (PQ) key pairs via ML-KEM.
  const pqIdentityKeyObj = mlkem512.keygen();
  const pqSignedPreKeyObj = mlkem512.keygen();
  const pqOneTimePreKeyObj = mlkem512.keygen();

  return {
    identityKey,
    identityKeyX25519,
    signedPreKey: {
      keyPair: spk,
      signature,
    },
    oneTimePreKey,
    pqIdentityKey: {
      publicKey: pqIdentityKeyObj.publicKey,
      privateKey: pqIdentityKeyObj.secretKey,
    },
    pqSignedPreKey: {
      publicKey: pqSignedPreKeyObj.publicKey,
      privateKey: pqSignedPreKeyObj.secretKey,
    },
    pqOneTimePreKey: {
      publicKey: pqOneTimePreKeyObj.publicKey,
      privateKey: pqOneTimePreKeyObj.secretKey,
    },
  };
}

// --- 2. Compute Shared Secret (Sender Side) ---

export async function computeSenderSharedSecret(
  senderBundle: KeyBundle,
  recipientBundle: KeyBundle
): Promise<{ sharedSecret: Uint8Array; initialMessage: InitialMessage }> {
  // Generate fresh ephemeral keys (ensuring single use for forward secrecy)
  const ephemeralKeyEC = generateEphemeralKey();
  const ephemeralKeyPQ = mlkem512.keygen();

  // Verify the recipient's Signed PreKey signature
  const isValid = ed25519.verify(
    recipientBundle.signedPreKey.signature,
    recipientBundle.signedPreKey.keyPair.publicKey,
    recipientBundle.identityKey.publicKey
  );
  if (!isValid) {
    throw new Error("Invalid Signed PreKey signature");
  }

  // Compute classical Diffie–Hellman (X25519) components concurrently
  const dhTasks: Array<Promise<Uint8Array>> = [
    Promise.resolve(x25519SharedKey(senderBundle.identityKeyX25519.privateKey, recipientBundle.signedPreKey.keyPair.publicKey)),
    Promise.resolve(x25519SharedKey(ephemeralKeyEC.privateKey, recipientBundle.identityKeyX25519.publicKey)),
    Promise.resolve(x25519SharedKey(ephemeralKeyEC.privateKey, recipientBundle.signedPreKey.keyPair.publicKey)),
    Promise.resolve(recipientBundle.oneTimePreKey
      ? x25519SharedKey(ephemeralKeyEC.privateKey, recipientBundle.oneTimePreKey.publicKey)
      : new Uint8Array(0)),
  ];

  // Compute Post-Quantum encapsulations concurrently.
  // Wrapping in Promise.resolve allows simple switching to async implementations later.
  const pqTasks: Array<Promise<{ sharedSecret: Uint8Array; cipherText: Uint8Array }>> = [
    Promise.resolve(mlkem512.encapsulate(recipientBundle.pqIdentityKey.publicKey)),
    Promise.resolve(mlkem512.encapsulate(recipientBundle.pqSignedPreKey.publicKey)),
    Promise.resolve(recipientBundle.pqOneTimePreKey
      ? mlkem512.encapsulate(recipientBundle.pqOneTimePreKey.publicKey)
      : { sharedSecret: new Uint8Array(0), cipherText: new Uint8Array(0) }),
  ];

  // Await parallel tasks for DH and PQ components
  const dhResults = await Promise.all(dhTasks);
  const pqResults = await Promise.all(pqTasks);
  const [pq1, pq2, pq3] = pqResults;

  // Assemble the key material from all components
  const combined = concatUint8Arrays([
    ...dhResults,
    pq1.sharedSecret,
    pq2.sharedSecret,
    pq3.sharedSecret,
  ]);

  // Derive the final shared secret using HKDF
  const sharedSecret = hkdf(sha256, combined, undefined, SPECIFICATION, 32);

  // Build the initial message to send to Bob
  const message: InitialMessage = {
    version: GLOBAL_VERSION,
    ephemeralKeyEC: ephemeralKeyEC.publicKey,
    ephemeralKeyPQ: ephemeralKeyPQ.publicKey,
    senderIdentityKey: senderBundle.identityKey.publicKey,
    senderIdentityKeyX25519: senderBundle.identityKeyX25519.publicKey,
    pqEncapsulations: {
      identity: pq1.cipherText,
      signedPreKey: pq2.cipherText,
      oneTimePreKey: recipientBundle.pqOneTimePreKey ? pq3.cipherText : undefined,
    },
  };

  // Optionally: securely erase/overwrite ephemeral private keys here if required

  return { sharedSecret, initialMessage: message };
}

// --- 3. Compute Shared Secret (Receiver Side) ---

export async function computeReceiverSharedSecret(
  receiverBundle: KeyBundle,
  message: InitialMessage
): Promise<Uint8Array> {

  const dhResults = await Promise.all([
    Promise.resolve(x25519SharedKey(receiverBundle.signedPreKey.keyPair.privateKey, message.senderIdentityKeyX25519)),
    Promise.resolve(x25519SharedKey(receiverBundle.identityKeyX25519.privateKey, message.ephemeralKeyEC)),
    Promise.resolve(x25519SharedKey(receiverBundle.signedPreKey.keyPair.privateKey, message.ephemeralKeyEC)),
    Promise.resolve(receiverBundle.oneTimePreKey
      ? x25519SharedKey(receiverBundle.oneTimePreKey.privateKey, message.ephemeralKeyEC)
      : new Uint8Array(0)),
  ]);

  // Decapsulate PQ components with integrity verification
  const pq1 = mlkem512.decapsulate(message.pqEncapsulations.identity, receiverBundle.pqIdentityKey.privateKey);
  if (!checkDecapsulationIntegrity(pq1)) {
    throw new Error("PQ decapsulation failed for identity key");
  }

  const pq2 = mlkem512.decapsulate(message.pqEncapsulations.signedPreKey, receiverBundle.pqSignedPreKey.privateKey);
  if (!checkDecapsulationIntegrity(pq2)) {
    throw new Error("PQ decapsulation failed for signed prekey");
  }

  const pq3 = message.pqEncapsulations.oneTimePreKey && receiverBundle.pqOneTimePreKey
    ? mlkem512.decapsulate(message.pqEncapsulations.oneTimePreKey, receiverBundle.pqOneTimePreKey.privateKey)
    : new Uint8Array(0);
  if (receiverBundle.pqOneTimePreKey && message.pqEncapsulations.oneTimePreKey && !checkDecapsulationIntegrity(pq3)) {
    throw new Error("PQ decapsulation failed for one-time prekey");
  }

  const dh1 = dhResults[0];
  const dh2 = dhResults[1];
  const dh3 = dhResults[2];
  const dh4 = dhResults[3];

  const sharedSecret = hkdf(sha256, concatUint8Arrays([dh1, dh2, dh3, dh4, pq1, pq2, pq3]), undefined, SPECIFICATION, 32);

  return sharedSecret;
}
