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

export interface Bundle {
  ik: KeyPair; // Ed25519 for identity
  spk: SignedPreKey; // X25519 signed by identity key
  opk?: KeyPair; // Optional one-time X25519 key
  pq_ik: KeyPair; // PQ identity key
  pq_spk: KeyPair; // PQ signed pre-key
  pq_opk?: KeyPair; // Optional PQ one-time key
}

export interface InitialMessage {
  version: string;
  ekA_ec: PublicKey; // Ephemeral X25519 key
  ekA_pq: PublicKey; // Ephemeral PQ key
  encaps_pq: {
    ik: Uint8Array; // PQ ciphertext for identity key
    spk: Uint8Array; // PQ ciphertext for signed pre-key
    opk?: Uint8Array; // PQ ciphertext for one-time key
  };
  // Include Alice's identity key in the initial message
  ikA: PublicKey; // Alice's identity key (Ed25519)
}

// Step 2: Generate Key Bundle - FIXED
export async function generateBundle(): Promise<Bundle> {
  // Generate Ed25519 key pair for identity key (ik)
  const ik_privateKey = ed25519.utils.randomPrivateKey();
  const ik_publicKey = ed25519.getPublicKey(ik_privateKey);
  const ik: KeyPair = { publicKey: ik_publicKey, privateKey: ik_privateKey };

  // Generate X25519 key pair for signed pre-key (spk)
  const spk_privateKey = x25519.utils.randomPrivateKey();
  const spk_publicKey = x25519.getPublicKey(spk_privateKey);
  const spkKeyPair: KeyPair = {
    publicKey: spk_publicKey,
    privateKey: spk_privateKey,
  };

  // Sign spk with ik (using identity key for signing)
  const spkSignature = ed25519.sign(spk_publicKey, ik_privateKey);

  // Generate one-time pre-key (optional)
  const opk_privateKey = x25519.utils.randomPrivateKey();
  const opk_publicKey = x25519.getPublicKey(opk_privateKey);
  const opk: KeyPair = { publicKey: opk_publicKey, privateKey: opk_privateKey };

  // Generate post-quantum keys
  const pq_ik_keys = mlkem512.keygen();
  const pq_ik: KeyPair = {
    publicKey: pq_ik_keys.publicKey,
    privateKey: pq_ik_keys.secretKey,
  };

  const pq_spk_keys = mlkem512.keygen();
  const pq_spk: KeyPair = {
    publicKey: pq_spk_keys.publicKey,
    privateKey: pq_spk_keys.secretKey,
  };

  const pq_opk_keys = mlkem512.keygen();
  const pq_opk: KeyPair = {
    publicKey: pq_opk_keys.publicKey,
    privateKey: pq_opk_keys.secretKey,
  };

  return {
    ik,
    spk: { keyPair: spkKeyPair, signature: spkSignature },
    opk,
    pq_ik,
    pq_spk,
    pq_opk,
  };
}

// Step 3: Alice computes X3DH+ shared secret - FIXED
export async function computeSharedSecretAlice(
  bundle: Bundle, // Alice's bundle
  recipient: Bundle, // Bob's bundle
): Promise<{ sharedSecret: Uint8Array; initialMessage: InitialMessage }> {
  // Generate ephemeral X25519 key pair for Alice
  const ekA_privateKey = x25519.utils.randomPrivateKey();
  const ekA_publicKey = x25519.getPublicKey(ekA_privateKey);
  const ekA: KeyPair = { publicKey: ekA_publicKey, privateKey: ekA_privateKey };

  // Generate ephemeral ML-KEM-768 key pair for Alice
  const ekA_pq_keys = mlkem512.keygen();
  const ekA_pq: KeyPair = {
    publicKey: ekA_pq_keys.publicKey,
    privateKey: ekA_pq_keys.secretKey,
  };

  // Verify recipient's SPK signature
  const isValid = ed25519.verify(
    recipient.spk.signature,
    recipient.spk.keyPair.publicKey,
    recipient.ik.publicKey,
  );
  if (!isValid) throw new Error("Invalid SPK signature");

  // Classical DH parts (X25519)
  // Convert Ed25519 identity key to X25519 for DH
  const alice_ik_x25519_privateKey = convertEd25519PrivateKeyToX25519(
    bundle.ik.privateKey,
  );
  const bob_ik_x25519_publicKey = convertEd25519PublicKeyToX25519(
    recipient.ik.publicKey,
  );

  const dh1 = x25519.getSharedSecret(
    alice_ik_x25519_privateKey,
    recipient.spk.keyPair.publicKey,
  );
  const dh2 = x25519.getSharedSecret(ekA.privateKey, bob_ik_x25519_publicKey);
  const dh3 = x25519.getSharedSecret(
    ekA.privateKey,
    recipient.spk.keyPair.publicKey,
  );
  const dh4 = recipient.opk
    ? x25519.getSharedSecret(ekA.privateKey, recipient.opk.publicKey)
    : new Uint8Array(0);

  // Post-Quantum parts (ML-KEM-768)
  const pq1 = mlkem512.encapsulate(recipient.pq_ik.publicKey);
  const pq2 = mlkem512.encapsulate(recipient.pq_spk.publicKey);
  const pq3 = recipient.pq_opk
    ? mlkem512.encapsulate(recipient.pq_opk.publicKey)
    : { sharedSecret: new Uint8Array(0), cipherText: new Uint8Array(0) };

  // Combine key material
  const keySizes = [
    dh1.length,
    dh2.length,
    dh3.length,
    dh4.length,
    pq1.sharedSecret.length,
    pq2.sharedSecret.length,
    pq3.sharedSecret.length,
  ];
  const totalSize = keySizes.reduce((sum, size) => sum + size, 0);

  const inputKeyMaterial = new Uint8Array(totalSize);
  let offset = 0;

  inputKeyMaterial.set(dh1, offset);
  offset += dh1.length;
  inputKeyMaterial.set(dh2, offset);
  offset += dh2.length;
  inputKeyMaterial.set(dh3, offset);
  offset += dh3.length;
  inputKeyMaterial.set(dh4, offset);
  offset += dh4.length;
  inputKeyMaterial.set(pq1.sharedSecret, offset);
  offset += pq1.sharedSecret.length;
  inputKeyMaterial.set(pq2.sharedSecret, offset);
  offset += pq2.sharedSecret.length;
  inputKeyMaterial.set(pq3.sharedSecret, offset);

  const sharedSecret = hkdf(sha256, inputKeyMaterial, undefined, "X3DH+v1", 32);

  const initialMessage: InitialMessage = {
    version: "X3DH+ v1.0",
    ekA_ec: ekA.publicKey,
    ekA_pq: ekA_pq.publicKey,
    ikA: bundle.ik.publicKey, // Include Alice's identity key
    encaps_pq: {
      ik: pq1.cipherText,
      spk: pq2.cipherText,
      opk: recipient.pq_opk ? pq3.cipherText : undefined,
    },
  };

  return { sharedSecret, initialMessage };
}

// Step 4: Bob computes shared secret from initialMessage - FIXED
export async function computeSharedSecretBob(
  bundle: Bundle, // Bob's bundle
  message: InitialMessage,
  alice_ik: PublicKey, // Alice's identity key (Ed25519 public key) - Can use message.ikA instead
): Promise<Uint8Array> {
  // Verify the message has Alice's identity key
  const alice_identity_key = message.ikA || alice_ik;

  // Classical DH parts (X25519)
  // Convert Ed25519 identity key to X25519 for DH
  const bob_ik_x25519_privateKey = convertEd25519PrivateKeyToX25519(
    bundle.ik.privateKey,
  );
  const alice_ik_x25519_publicKey =
    convertEd25519PublicKeyToX25519(alice_identity_key);

  const dh1 = x25519.getSharedSecret(
    bundle.spk.keyPair.privateKey,
    alice_ik_x25519_publicKey,
  );
  const dh2 = x25519.getSharedSecret(bob_ik_x25519_privateKey, message.ekA_ec);
  const dh3 = x25519.getSharedSecret(
    bundle.spk.keyPair.privateKey,
    message.ekA_ec,
  );
  const dh4 = bundle.opk
    ? x25519.getSharedSecret(bundle.opk.privateKey, message.ekA_ec)
    : new Uint8Array(0);

  // Post-Quantum parts (ML-KEM-768)
  const pq1 = mlkem512.decapsulate(
    message.encaps_pq.ik,
    bundle.pq_ik.privateKey,
  );
  const pq2 = mlkem512.decapsulate(
    message.encaps_pq.spk,
    bundle.pq_spk.privateKey,
  );
  const pq3 =
    message.encaps_pq.opk && bundle.pq_opk
      ? mlkem512.decapsulate(message.encaps_pq.opk, bundle.pq_opk.privateKey)
      : new Uint8Array(0);

  // Combine key material
  const keySizes = [
    dh1.length,
    dh2.length,
    dh3.length,
    dh4.length,
    pq1.length,
    pq2.length,
    pq3.length,
  ];
  const totalSize = keySizes.reduce((sum, size) => sum + size, 0);

  const inputKeyMaterial = new Uint8Array(totalSize);
  let offset = 0;

  inputKeyMaterial.set(dh1, offset);
  offset += dh1.length;
  inputKeyMaterial.set(dh2, offset);
  offset += dh2.length;
  inputKeyMaterial.set(dh3, offset);
  offset += dh3.length;
  inputKeyMaterial.set(dh4, offset);
  offset += dh4.length;
  inputKeyMaterial.set(pq1, offset);
  offset += pq1.length;
  inputKeyMaterial.set(pq2, offset);
  offset += pq2.length;
  inputKeyMaterial.set(pq3, offset);

  const sharedSecret = hkdf(sha256, inputKeyMaterial, undefined, "X3DH+v1", 32);
  return sharedSecret;
}

function convertEd25519PublicKeyToX25519(publicKey: Uint8Array): Uint8Array {
  return edwardsToMontgomeryPub(publicKey);
}

function convertEd25519PrivateKeyToX25519(privateKey: Uint8Array): Uint8Array {
  return edwardsToMontgomeryPriv(privateKey);
}
