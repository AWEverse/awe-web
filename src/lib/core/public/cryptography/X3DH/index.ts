// Step 1: Dependencies and Setup
import {
  ed25519,
  edwardsToMontgomeryPriv,
  edwardsToMontgomeryPub,
  x25519,
} from "@noble/curves/ed25519";
import { hkdf } from "@noble/hashes/hkdf";
import { sha256 } from "@noble/hashes/sha256";
import { ml_kem512 as mlkem512 } from "@noble/post-quantum/ml-kem";

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
  identityKey: KeyPair; // Ed25519 for identity
  signedPreKey: SignedPreKey; // X25519 signed by identity key
  oneTimePreKey?: KeyPair; // Optional one-time X25519 key
  pqIdentityKey: KeyPair; // Post-quantum identity key
  pqSignedPreKey: KeyPair; // Post-quantum signed pre-key
  pqOneTimePreKey?: KeyPair; // Optional post-quantum one-time key
}

export interface InitialMessage {
  version: string;
  ephemeralKeyEC: PublicKey; // Ephemeral X25519 key
  ephemeralKeyPQ: PublicKey; // Ephemeral post-quantum key
  pqEncapsulations: {
    identity: Uint8Array; // PQ ciphertext for identity key
    signedPreKey: Uint8Array; // PQ ciphertext for signed pre-key
    oneTimePreKey?: Uint8Array; // PQ ciphertext for one-time key
  };
  senderIdentityKey: PublicKey; // Alice's identity key (Ed25519)
}

// Step 2: Generate Key Bundle
export async function generateKeyBundle(): Promise<KeyBundle> {
  // Generate identity key pair (Ed25519)
  const identityPrivateKey = ed25519.utils.randomPrivateKey();
  const identityPublicKey = ed25519.getPublicKey(identityPrivateKey);
  const identityKeyPair: KeyPair = {
    publicKey: identityPublicKey,
    privateKey: identityPrivateKey
  };

  // Generate signed pre-key pair (X25519)
  const signedPrePrivateKey = x25519.utils.randomPrivateKey();
  const signedPrePublicKey = x25519.getPublicKey(signedPrePrivateKey);
  const signedPreKeyPair: KeyPair = {
    publicKey: signedPrePublicKey,
    privateKey: signedPrePrivateKey,
  };

  // Sign the signed pre-key with identity key
  const signature = ed25519.sign(signedPrePublicKey, identityPrivateKey);

  // Generate one-time pre-key (optional)
  const oneTimePrivateKey = x25519.utils.randomPrivateKey();
  const oneTimePublicKey = x25519.getPublicKey(oneTimePrivateKey);
  const oneTimeKeyPair: KeyPair = {
    publicKey: oneTimePublicKey,
    privateKey: oneTimePrivateKey
  };

  // Generate post-quantum key pairs
  const pqIdentityKeys = mlkem512.keygen();
  const pqIdentityKeyPair: KeyPair = {
    publicKey: pqIdentityKeys.publicKey,
    privateKey: pqIdentityKeys.secretKey,
  };

  const pqSignedPreKeys = mlkem512.keygen();
  const pqSignedPreKeyPair: KeyPair = {
    publicKey: pqSignedPreKeys.publicKey,
    privateKey: pqSignedPreKeys.secretKey,
  };

  const pqOneTimeKeys = mlkem512.keygen();
  const pqOneTimeKeyPair: KeyPair = {
    publicKey: pqOneTimeKeys.publicKey,
    privateKey: pqOneTimeKeys.secretKey,
  };

  return {
    identityKey: identityKeyPair,
    signedPreKey: { keyPair: signedPreKeyPair, signature },
    oneTimePreKey: oneTimeKeyPair,
    pqIdentityKey: pqIdentityKeyPair,
    pqSignedPreKey: pqSignedPreKeyPair,
    pqOneTimePreKey: pqOneTimeKeyPair,
  };
}

// Step 3: Alice computes shared secret
export async function computeSenderSharedSecret(
  senderBundle: KeyBundle,
  recipientBundle: KeyBundle,
): Promise<{ sharedSecret: Uint8Array; initialMessage: InitialMessage }> {
  // Generate ephemeral key pair for sender (X25519)
  const ephemeralPrivateKey = x25519.utils.randomPrivateKey();
  const ephemeralPublicKey = x25519.getPublicKey(ephemeralPrivateKey);
  const ephemeralKeyPair: KeyPair = {
    publicKey: ephemeralPublicKey,
    privateKey: ephemeralPrivateKey
  };

  // Generate ephemeral post-quantum key pair
  const ephemeralPQKeys = mlkem512.keygen();
  const ephemeralPQKeyPair: KeyPair = {
    publicKey: ephemeralPQKeys.publicKey,
    privateKey: ephemeralPQKeys.secretKey,
  };

  // Verify recipient's signed pre-key signature
  const isSignatureValid = ed25519.verify(
    recipientBundle.signedPreKey.signature,
    recipientBundle.signedPreKey.keyPair.publicKey,
    recipientBundle.identityKey.publicKey,
  );
  if (!isSignatureValid) throw new Error("Invalid signed pre-key signature");

  // Compute classical DH components (X25519)
  const senderIdentityX25519Private = convertEd25519PrivateKeyToX25519(
    senderBundle.identityKey.privateKey,
  );
  const recipientIdentityX25519Public = convertEd25519PublicKeyToX25519(
    recipientBundle.identityKey.publicKey,
  );

  const dhComponent1 = x25519.getSharedSecret(
    senderIdentityX25519Private,
    recipientBundle.signedPreKey.keyPair.publicKey,
  );
  const dhComponent2 = x25519.getSharedSecret(
    ephemeralKeyPair.privateKey,
    recipientIdentityX25519Public,
  );
  const dhComponent3 = x25519.getSharedSecret(
    ephemeralKeyPair.privateKey,
    recipientBundle.signedPreKey.keyPair.publicKey,
  );
  const dhComponent4 = recipientBundle.oneTimePreKey
    ? x25519.getSharedSecret(
      ephemeralKeyPair.privateKey,
      recipientBundle.oneTimePreKey.publicKey,
    )
    : new Uint8Array(0);

  // Compute post-quantum components
  const pqComponent1 = mlkem512.encapsulate(recipientBundle.pqIdentityKey.publicKey);
  const pqComponent2 = mlkem512.encapsulate(recipientBundle.pqSignedPreKey.publicKey);
  const pqComponent3 = recipientBundle.pqOneTimePreKey
    ? mlkem512.encapsulate(recipientBundle.pqOneTimePreKey.publicKey)
    : { sharedSecret: new Uint8Array(0), cipherText: new Uint8Array(0) };

  // Combine all components into shared secret
  const componentSizes = [
    dhComponent1.length,
    dhComponent2.length,
    dhComponent3.length,
    dhComponent4.length,
    pqComponent1.sharedSecret.length,
    pqComponent2.sharedSecret.length,
    pqComponent3.sharedSecret.length,
  ];
  const totalSize = componentSizes.reduce((sum, size) => sum + size, 0);

  const combinedKeyMaterial = new Uint8Array(totalSize);
  let offset = 0;

  combinedKeyMaterial.set(dhComponent1, offset);
  offset += dhComponent1.length;
  combinedKeyMaterial.set(dhComponent2, offset);
  offset += dhComponent2.length;
  combinedKeyMaterial.set(dhComponent3, offset);
  offset += dhComponent3.length;
  combinedKeyMaterial.set(dhComponent4, offset);
  offset += dhComponent4.length;
  combinedKeyMaterial.set(pqComponent1.sharedSecret, offset);
  offset += pqComponent1.sharedSecret.length;
  combinedKeyMaterial.set(pqComponent2.sharedSecret, offset);
  offset += pqComponent2.sharedSecret.length;
  combinedKeyMaterial.set(pqComponent3.sharedSecret, offset);

  const sharedSecret = hkdf(sha256, combinedKeyMaterial, undefined, "X3DH+v1", 32);

  const initialMessage: InitialMessage = {
    version: "X3DH+ v1.0",
    ephemeralKeyEC: ephemeralKeyPair.publicKey,
    ephemeralKeyPQ: ephemeralPQKeyPair.publicKey,
    senderIdentityKey: senderBundle.identityKey.publicKey,
    pqEncapsulations: {
      identity: pqComponent1.cipherText,
      signedPreKey: pqComponent2.cipherText,
      oneTimePreKey: recipientBundle.pqOneTimePreKey ? pqComponent3.cipherText : undefined,
    },
  };

  return { sharedSecret, initialMessage };
}

// Step 4: Bob computes shared secret from initial message
export async function computeReceiverSharedSecret(
  receiverBundle: KeyBundle,
  message: InitialMessage,
  senderIdentityKeyProvided: PublicKey,
): Promise<Uint8Array> {
  const senderIdentityKey = message.senderIdentityKey || senderIdentityKeyProvided;

  // Compute classical DH components (X25519)
  const receiverIdentityX25519Private = convertEd25519PrivateKeyToX25519(
    receiverBundle.identityKey.privateKey,
  );
  const senderIdentityX25519Public = convertEd25519PublicKeyToX25519(senderIdentityKey);

  const dhComponent1 = x25519.getSharedSecret(
    receiverBundle.signedPreKey.keyPair.privateKey,
    senderIdentityX25519Public,
  );
  const dhComponent2 = x25519.getSharedSecret(
    receiverIdentityX25519Private,
    message.ephemeralKeyEC,
  );
  const dhComponent3 = x25519.getSharedSecret(
    receiverBundle.signedPreKey.keyPair.privateKey,
    message.ephemeralKeyEC,
  );
  const dhComponent4 = receiverBundle.oneTimePreKey
    ? x25519.getSharedSecret(receiverBundle.oneTimePreKey.privateKey, message.ephemeralKeyEC)
    : new Uint8Array(0);

  // Compute post-quantum components
  const pqComponent1 = mlkem512.decapsulate(
    message.pqEncapsulations.identity,
    receiverBundle.pqIdentityKey.privateKey,
  );
  const pqComponent2 = mlkem512.decapsulate(
    message.pqEncapsulations.signedPreKey,
    receiverBundle.pqSignedPreKey.privateKey,
  );
  const pqComponent3 =
    message.pqEncapsulations.oneTimePreKey && receiverBundle.pqOneTimePreKey
      ? mlkem512.decapsulate(
        message.pqEncapsulations.oneTimePreKey,
        receiverBundle.pqOneTimePreKey.privateKey,
      )
      : new Uint8Array(0);

  // Combine all components into shared secret
  const componentSizes = [
    dhComponent1.length,
    dhComponent2.length,
    dhComponent3.length,
    dhComponent4.length,
    pqComponent1.length,
    pqComponent2.length,
    pqComponent3.length,
  ];
  const totalSize = componentSizes.reduce((sum, size) => sum + size, 0);

  const combinedKeyMaterial = new Uint8Array(totalSize);
  let offset = 0;

  combinedKeyMaterial.set(dhComponent1, offset);
  offset += dhComponent1.length;
  combinedKeyMaterial.set(dhComponent2, offset);
  offset += dhComponent2.length;
  combinedKeyMaterial.set(dhComponent3, offset);
  offset += dhComponent3.length;
  combinedKeyMaterial.set(dhComponent4, offset);
  offset += dhComponent4.length;
  combinedKeyMaterial.set(pqComponent1, offset);
  offset += pqComponent1.length;
  combinedKeyMaterial.set(pqComponent2, offset);
  offset += pqComponent2.length;
  combinedKeyMaterial.set(pqComponent3, offset);

  const sharedSecret = hkdf(sha256, combinedKeyMaterial, undefined, "X3DH+v1", 32);
  return sharedSecret;
}

// Helper functions
function convertEd25519PublicKeyToX25519(publicKey: Uint8Array): Uint8Array {
  return edwardsToMontgomeryPub(publicKey);
}

function convertEd25519PrivateKeyToX25519(privateKey: Uint8Array): Uint8Array {
  return edwardsToMontgomeryPriv(privateKey);
}
