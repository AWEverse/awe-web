// Step 1: Dependencies and Setup
import {
  ed25519,
  x25519,
} from "@noble/curves/ed25519";
import { hkdf } from "@noble/hashes/hkdf";
import { sha256 } from "@noble/hashes/sha256";
import { ml_kem512 as mlkem512 } from "@noble/post-quantum/ml-kem";


const GLOBAL_VERSION = "X3DH+PQ";
const SPECIFICATION = "X3DH+v1";

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
  signedPreKey: SignedPreKey;      // X25519, signed with Ed25519
  oneTimePreKey?: KeyPair;         // Optional X25519 one-time
  pqIdentityKey: KeyPair;          // ML-KEM
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

// Step 2: Generate Key Bundle
export async function generateKeyBundle(): Promise<KeyBundle> {
  // Identity key (Ed25519)
  const privateKey = ed25519.utils.randomPrivateKey();
  const identityKey = {
    privateKey,
    publicKey: ed25519.getPublicKey(privateKey)
  };

  // Identity key for DH (X25519) — генерируем отдельно!
  const identityKeyX25519Private = x25519.utils.randomPrivateKey();
  const identityKeyX25519 = {
    privateKey: identityKeyX25519Private,
    publicKey: x25519.getPublicKey(identityKeyX25519Private)
  };

  // Signed PreKey (X25519)
  const signedPreKeyPrivate = x25519.utils.randomPrivateKey();
  const signedPreKey = {
    privateKey: signedPreKeyPrivate,
    publicKey: x25519.getPublicKey(signedPreKeyPrivate)
  };

  // Подпись SPK через Ed25519
  const signature = await ed25519.sign(
    signedPreKey.publicKey,
    identityKey.privateKey
  );

  // One-time pre-key (X25519)
  const oneTimePreKeyPrivate = x25519.utils.randomPrivateKey();
  const oneTimePreKey = {
    privateKey: oneTimePreKeyPrivate,
    publicKey: x25519.getPublicKey(oneTimePreKeyPrivate)
  };

  // PQ-ключи
  const pqIdentityKey = mlkem512.keygen();
  const pqSignedPreKey = mlkem512.keygen();
  const pqOneTimePreKey = mlkem512.keygen();

  return {
    identityKey,
    identityKeyX25519,
    signedPreKey: {
      keyPair: signedPreKey,
      signature,
    },
    oneTimePreKey,
    pqIdentityKey: {
      publicKey: pqIdentityKey.publicKey,
      privateKey: pqIdentityKey.secretKey,
    },
    pqSignedPreKey: {
      publicKey: pqSignedPreKey.publicKey,
      privateKey: pqSignedPreKey.secretKey,
    },
    pqOneTimePreKey: {
      publicKey: pqOneTimePreKey.publicKey,
      privateKey: pqOneTimePreKey.secretKey,
    },
  };
}

// Step 3: Alice computes shared secret
export async function computeSenderSharedSecret(
  senderBundle: KeyBundle,
  recipientBundle: KeyBundle
): Promise<{ sharedSecret: Uint8Array; initialMessage: InitialMessage }> {
  // Эфемерный ключ (X25519)
  const ephemeralKeyECPrivate = x25519.utils.randomPrivateKey();
  const ephemeralKeyEC = {
    privateKey: ephemeralKeyECPrivate,
    publicKey: x25519.getPublicKey(ephemeralKeyECPrivate)
  };

  // Эфемерный PQ-ключ
  const ephemeralKeyPQ = mlkem512.keygen();

  // Верификация подписи SPK
  const isValid = await ed25519.verify(
    recipientBundle.signedPreKey.signature,
    recipientBundle.signedPreKey.keyPair.publicKey,
    recipientBundle.identityKey.publicKey
  );
  if (!isValid) throw new Error("Invalid SPK signature");

  // X3DH компоненты (EC)
  const dhResults: Uint8Array[] = [
    x25519SharedKey(senderBundle.identityKeyX25519.privateKey, recipientBundle.signedPreKey.keyPair.publicKey),
    x25519SharedKey(ephemeralKeyEC.privateKey, recipientBundle.identityKeyX25519.publicKey),
    x25519SharedKey(ephemeralKeyEC.privateKey, recipientBundle.signedPreKey.keyPair.publicKey),
    recipientBundle.oneTimePreKey
      ? x25519SharedKey(ephemeralKeyEC.privateKey, recipientBundle.oneTimePreKey.publicKey)
      : new Uint8Array(0),
  ];

  // PQ-компоненты
  const pq1 = mlkem512.encapsulate(recipientBundle.pqIdentityKey.publicKey);
  const pq2 = mlkem512.encapsulate(recipientBundle.pqSignedPreKey.publicKey);
  const pq3 = recipientBundle.pqOneTimePreKey
    ? mlkem512.encapsulate(recipientBundle.pqOneTimePreKey.publicKey)
    : { sharedSecret: new Uint8Array(0), cipherText: new Uint8Array(0) };

  // Сборка материала
  const combined = concatUint8Arrays([
    ...dhResults,
    pq1.sharedSecret,
    pq2.sharedSecret,
    pq3.sharedSecret,
  ]);

  const sharedSecret = hkdf(sha256, combined, undefined, SPECIFICATION, 32);

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

  return { sharedSecret, initialMessage: message };
}

// Step 4: Bob computes shared secret
export async function computeReceiverSharedSecret(
  receiverBundle: KeyBundle,
  message: InitialMessage
): Promise<Uint8Array> {
  const dhResults: Uint8Array[] = [
    x25519SharedKey(receiverBundle.signedPreKey.keyPair.privateKey, message.senderIdentityKeyX25519),
    x25519SharedKey(receiverBundle.identityKeyX25519.privateKey, message.ephemeralKeyEC),
    x25519SharedKey(receiverBundle.signedPreKey.keyPair.privateKey, message.ephemeralKeyEC),
    receiverBundle.oneTimePreKey
      ? x25519SharedKey(receiverBundle.oneTimePreKey.privateKey, message.ephemeralKeyEC)
      : new Uint8Array(0),
  ];

  const pq1 = mlkem512.decapsulate(
    message.pqEncapsulations.identity,
    receiverBundle.pqIdentityKey.privateKey
  );
  const pq2 = mlkem512.decapsulate(
    message.pqEncapsulations.signedPreKey,
    receiverBundle.pqSignedPreKey.privateKey
  );
  const pq3 =
    message.pqEncapsulations.oneTimePreKey && receiverBundle.pqOneTimePreKey
      ? mlkem512.decapsulate(
        message.pqEncapsulations.oneTimePreKey,
        receiverBundle.pqOneTimePreKey.privateKey
      )
      : new Uint8Array(0);

  const combined = concatUint8Arrays([...dhResults, pq1, pq2, pq3]);
  const sharedSecret = hkdf(sha256, combined, undefined, SPECIFICATION, 32);

  return sharedSecret;
}

// Helpers
function x25519SharedKey(privateKey: Uint8Array, publicKey: Uint8Array): Uint8Array {
  return x25519.getSharedSecret(privateKey, publicKey);
}

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
