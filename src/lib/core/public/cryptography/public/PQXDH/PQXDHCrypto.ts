import sodium from 'libsodium-wrappers';
import { ml_kem768 } from '@noble/post-quantum/ml-kem';
import { hkdf } from '@noble/hashes/hkdf';
import { sha512 } from '@noble/hashes/sha512';

// Wait for libsodium to be ready
await sodium.ready;

// Constants for encoding
const CURVE_ID = 0x01; // curve25519
const PQKEM_ID = 0x02; // ml_kem768

// KDF constants
const F = new Uint8Array(32).fill(0xff); // 32 0xFF bytes for curve25519
const INFO_STR = 'MyProtocol_CURVE25519_SHA-512_ML-KEM768';
const INFO = new TextEncoder().encode(INFO_STR);
const SALT = new Uint8Array(64); // Zero-filled for SHA-512

// Type definitions
type CurvePublicKey = Uint8Array; // 32 bytes
type CurvePrivateKey = Uint8Array; // 32 bytes
type EdPublicKey = Uint8Array; // 32 bytes
type EdPrivateKey = Uint8Array; // 64 bytes
type PqkemPublicKey = Uint8Array; // 1184 bytes
type PqkemPrivateKey = Uint8Array; // 2400 bytes
type PqkemCiphertext = Uint8Array; // 1088 bytes
type KeyId = Uint8Array; // 8 bytes

interface PrekeyBundle {
  ikSign: EdPublicKey;
  ikDh: CurvePublicKey;
  spk: CurvePublicKey;
  spkId: KeyId;
  spkSig: Uint8Array;
  pqpk: PqkemPublicKey;
  pqpkId: KeyId;
  pqpkSig: Uint8Array;
  opk?: CurvePublicKey;
  opkId?: KeyId;
}

interface InitialMessage {
  ikA: CurvePublicKey;
  ekA: CurvePublicKey;
  ct: PqkemCiphertext;
  spkId: KeyId;
  pqpkId: KeyId;
  opkId?: KeyId;
  nonce: Uint8Array;
  ciphertext: Uint8Array;
}

// Encoding and decoding functions
function encodeEC(pk: CurvePublicKey): Uint8Array {
  if (pk.length !== 32) throw new Error('Invalid curve public key');
  const encoded = new Uint8Array(1 + 32);
  encoded[0] = CURVE_ID;
  encoded.set(pk, 1);
  return encoded;
}

function decodeEC(encoded: Uint8Array): CurvePublicKey {
  if (encoded.length !== 33 || encoded[0] !== CURVE_ID) {
    throw new Error('Invalid encoded curve public key');
  }
  return encoded.subarray(1);
}

function encodeKEM(pk: PqkemPublicKey): Uint8Array {
  if (pk.length !== 1184) throw new Error('Invalid pqkem public key');
  const encoded = new Uint8Array(1 + 1184);
  encoded[0] = PQKEM_ID;
  encoded.set(pk, 1);
  return encoded;
}

function decodeKEM(encoded: Uint8Array): PqkemPublicKey {
  if (encoded.length !== 1185 || encoded[0] !== PQKEM_ID) {
    throw new Error('Invalid encoded pqkem public key');
  }
  return encoded.subarray(1);
}

// Utility to concatenate Uint8Arrays
function concatenate(...arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

// KDF implementation
function kdf(km: Uint8Array): Uint8Array {
  const ikm = concatenate(F, km);
  return hkdf(sha512, ikm, SALT, INFO, 32);
}

// Key generation functions
function generateIdentityKeys() {
  const ikSign = sodium.crypto_sign_keypair();
  const skDh = sodium.crypto_sign_ed25519_sk_to_curve25519(ikSign.privateKey);
  const ikDh = sodium.crypto_scalarmult_base(skDh);
  return {
    ikSign: { publicKey: ikSign.publicKey, privateKey: ikSign.privateKey },
    ikDh: { publicKey: ikDh, privateKey: skDh }
  };
}

function generateCurvePrekey() {
  const keypair = sodium.crypto_box_keypair();
  const id = sodium.randombytes_buf(8);
  return { publicKey: keypair.publicKey, privateKey: keypair.privateKey, id };
}

function generatePqkemPrekey() {
  const { publicKey, secretKey } = ml_kem768.keygen();
  const id = sodium.randombytes_buf(8);
  return { publicKey, privateKey: secretKey, id };
}

function signPrekey(sk: EdPrivateKey, pk: CurvePublicKey): Uint8Array {
  return sodium.crypto_sign_detached(encodeEC(pk), sk);
}

function signPqkemPrekey(sk: EdPrivateKey, pk: PqkemPublicKey): Uint8Array {
  return sodium.crypto_sign_detached(encodeKEM(pk), sk);
}

// Simulated server state (in a real app, this would be a database)
const bobKeys = generateIdentityKeys();
const bobSpk = generateCurvePrekey();
const bobSpkSig = signPrekey(bobKeys.ikSign.privateKey, bobSpk.publicKey);
const bobPqspk = generatePqkemPrekey();
const bobPqspkSig = signPqkemPrekey(bobKeys.ikSign.privateKey, bobPqspk.publicKey);
const bobOpks = [generateCurvePrekey()];
const bobPqopks = [generatePqkemPrekey()];
const bobPqopkSigs = bobPqopks.map(pqopk => signPqkemPrekey(bobKeys.ikSign.privateKey, pqopk.publicKey));

// Simulate fetching a prekey bundle
function getPrekeyBundle(): PrekeyBundle {
  let pqpk: PqkemPublicKey, pqpkId: KeyId, pqpkSig: Uint8Array;
  if (bobPqopks.length > 0) {
    const pqopk = bobPqopks.shift()!;
    pqpk = pqopk.publicKey;
    pqpkId = pqopk.id;
    pqpkSig = bobPqopkSigs.shift()!;
  } else {
    pqpk = bobPqspk.publicKey;
    pqpkId = bobPqspk.id;
    pqpkSig = bobPqspkSig;
  }
  let opk: CurvePublicKey | undefined, opkId: KeyId | undefined;
  if (bobOpks.length > 0) {
    const opkSelected = bobOpks.shift()!;
    opk = opkSelected.publicKey;
    opkId = opkSelected.id;
  }
  return {
    ikSign: bobKeys.ikSign.publicKey,
    ikDh: bobKeys.ikDh.publicKey,
    spk: bobSpk.publicKey,
    spkId: bobSpk.id,
    spkSig: bobSpkSig,
    pqpk,
    pqpkId,
    pqpkSig,
    opk,
    opkId
  };
}

// Alice's identity key (for this example)
const aliceKeys = generateIdentityKeys();

// Alice sends the initial message
async function aliceSendInitialMessage(plaintext: Uint8Array): Promise<InitialMessage> {
  const bundle = getPrekeyBundle();

  // Verify signatures
  if (!sodium.crypto_sign_verify_detached(bundle.spkSig, encodeEC(bundle.spk), bundle.ikSign)) {
    throw new Error('Invalid SPK signature');
  }
  if (!sodium.crypto_sign_verify_detached(bundle.pqpkSig, encodeKEM(bundle.pqpk), bundle.ikSign)) {
    throw new Error('Invalid PQPK signature');
  }

  // Generate ephemeral key
  const ekA = sodium.crypto_box_keypair();

  // PQKEM encapsulation
  const { ciphertext: ct, sharedSecret: ss } = ml_kem768.encapsulate(bundle.pqpk);

  // Compute DH values
  const dh1 = sodium.crypto_scalarmult(aliceKeys.ikDh.privateKey, bundle.spk);
  const dh2 = sodium.crypto_scalarmult(ekA.privateKey, bundle.ikDh);
  const dh3 = sodium.crypto_scalarmult(ekA.privateKey, bundle.spk);
  const km = bundle.opk
    ? concatenate(dh1, dh2, dh3, sodium.crypto_scalarmult(ekA.privateKey, bundle.opk), ss)
    : concatenate(dh1, dh2, dh3, ss);

  const sk = kdf(km);

  // Construct AD
  const ad = concatenate(encodeEC(aliceKeys.ikDh.publicKey), encodeEC(bundle.ikDh), encodeKEM(bundle.pqpk));

  // Encrypt initial message
  const nonce = sodium.randombytes_buf(sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES);
  const ciphertext = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(plaintext, ad, null, nonce, sk);

  return {
    ikA: aliceKeys.ikDh.publicKey,
    ekA: ekA.publicKey,
    ct,
    spkId: bundle.spkId,
    pqpkId: bundle.pqpkId,
    opkId: bundle.opkId,
    nonce,
    ciphertext
  };
}

// Bob receives and processes the initial message
async function bobReceiveInitialMessage(message: InitialMessage): Promise<Uint8Array> {
  // Load private keys (in practice, use identifiers to fetch from storage)
  const sskDh = bobSpk.privateKey;
  const pqssk = bobPqopks.length > 0 && message.pqpkId === bobPqopks[0].id
    ? bobPqopks[0].privateKey
    : bobPqspk.privateKey;
  const opkSk = message.opkId && bobOpks.find(opk => sodium.memcmp(opk.id, message.opkId))?.privateKey;

  // Decapsulate PQKEM
  const ss = ml_kem768.decapsulate(pqssk, message.ct);

  // Compute DH values
  const dh1 = sodium.crypto_scalarmult(sskDh, message.ikA);
  const dh2 = sodium.crypto_scalarmult(bobKeys.ikDh.privateKey, message.ekA);
  const dh3 = sodium.crypto_scalarmult(sskDh, message.ekA);
  const km = message.opkId && opkSk
    ? concatenate(dh1, dh2, dh3, sodium.crypto_scalarmult(opkSk, message.ekA), ss)
    : concatenate(dh1, dh2, dh3, ss);

  const sk = kdf(km);

  // Construct AD (assuming pqpk is the one used)
  const ad = concatenate(encodeEC(message.ikA), encodeEC(bobKeys.ikDh.publicKey), encodeKEM(bobPqspk.publicKey));

  // Decrypt
  const plaintext = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(null, message.ciphertext, ad, message.nonce, sk);

  // Clean up one-time prekeys (simplified here)
  if (message.opkId) bobOpks.shift();
  if (message.pqpkId !== bobPqspk.id) bobPqopks.shift();

  return plaintext;
}

// Example usage
(async () => {
  const message = new TextEncoder().encode('Hello, Bob!');
  const initialMessage = await aliceSendInitialMessage(message);
  const receivedPlaintext = await bobReceiveInitialMessage(initialMessage);
  console.log(new TextDecoder().decode(receivedPlaintext)); // "Hello, Bob!"
})();
