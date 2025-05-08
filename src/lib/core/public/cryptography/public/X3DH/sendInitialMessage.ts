/**
 * Implementation of the sending side of the X3DH (Extended Triple Diffie-Hellman) protocol.
 * This module provides functionality for initiating secure communication channels by establishing
 * shared secrets and sending initial encrypted messages.
 *
 * @module X3DH/sendInitialMessage
 */

import { memzero } from "libsodium-wrappers";
import { KeyBundle, PublicKeyBundle, InitialMessage } from "../../interfaces";
import { Ed25519 } from "../Curves/ed25519";
import { X25519 } from "../Curves/x25519";
import BundleManager from "./BundleManager";
import {
  CONSTANTS,
  CryptoError,
  computeDH,
  deriveSharedSecret,
  createAssociatedData,
  encryptMessage
} from "../utils/cryptoUtils";

/** Result object returned after sending an initial message */
interface SendInitialMessageResult {
  /** The encrypted initial message to be sent to the recipient */
  initialMessage: InitialMessage;
  /** The derived shared secret to be used for subsequent communications */
  sharedSecret: Uint8Array;
}

/** Options for customizing the initial message sending process */
interface SendInitialMessageOptions {
  /** Optional context info string for key derivation */
  info?: string;
  /** Optional index of the one-time prekey to use */
  oneTimePrekeyIndex?: number;
  /** Optional additional data for encryption */
  additionalData?: { [key: string]: string };
}

function validateBundle(recipientBundle: PublicKeyBundle): void {
  if (!recipientBundle.identityKeyX25519 ||
    !recipientBundle.signedPrekey?.publicKey ||
    recipientBundle.identityKeyX25519.length !== CONSTANTS.KEY_LENGTH ||
    recipientBundle.signedPrekey.publicKey.length !== CONSTANTS.KEY_LENGTH) {
    throw new CryptoError(
      CONSTANTS.ERROR_CODES.INVALID_KEY_LENGTH,
      "Invalid recipient bundle key lengths"
    );
  }
}

function verifySignedPrekey(
  recipientBundle: PublicKeyBundle,
  encodedSPK: Uint8Array
): void {
  const isValid = Ed25519.verify(
    recipientBundle.signedPrekey.signature,
    encodedSPK,
    recipientBundle.identityKeyEd25519
  );
  if (!isValid) {
    throw new CryptoError(
      CONSTANTS.ERROR_CODES.INVALID_SIGNATURE,
      "Invalid signed prekey signature"
    );
  }
}

function computeX3DHSecrets(
  senderKeys: KeyBundle,
  recipientBundle: PublicKeyBundle,
  ephemeralKey: { privateKey: Uint8Array },
  oneTimePrekeyIndex?: number
): Uint8Array[] {
  const dhSecrets: Uint8Array[] = [];

  // DH1 = SignedPrekey * IKs
  dhSecrets.push(computeDH(
    senderKeys.identityKey.privateKey,
    recipientBundle.signedPrekey.publicKey
  ));

  // DH2 = IKr * EKs
  dhSecrets.push(computeDH(
    ephemeralKey.privateKey,
    recipientBundle.identityKeyX25519
  ));

  // DH3 = SPKr * EKs
  dhSecrets.push(computeDH(
    ephemeralKey.privateKey,
    recipientBundle.signedPrekey.publicKey
  ));

  // DH4 = OPKr * EKs (if one-time prekey is used)
  if (oneTimePrekeyIndex !== undefined &&
    recipientBundle.oneTimePrekeys.length > oneTimePrekeyIndex) {
    dhSecrets.push(computeDH(
      ephemeralKey.privateKey,
      recipientBundle.oneTimePrekeys[oneTimePrekeyIndex]
    ));
  }

  return dhSecrets;
}

/**
 * Sends an initial message using the X3DH protocol.
 *
 * This function implements the sending side of the X3DH protocol by:
 * 1. Verifying the recipient's signed prekey
 * 2. Generating an ephemeral key pair
 * 3. Computing DH shared secrets
 * 4. Deriving the shared secret key
 * 5. Encrypting the message with associated data
 *
 * The function follows memory safety practices by securely wiping sensitive data after use.
 *
 * @param senderKeys - The sender's key bundle containing identity and signed prekeys
 * @param recipientBundle - The recipient's public key bundle
 * @param message - The plaintext message to encrypt
 * @param options - Optional parameters for customizing the protocol
 * @returns An object containing the initial message and derived shared secret
 * @throws {Error} If the signed prekey verification fails
 */
export default function sendInitialMessage(
  senderKeys: KeyBundle,
  recipientBundle: PublicKeyBundle,
  message: string,
  options: SendInitialMessageOptions = {}
): SendInitialMessageResult {
  const {
    info = CONSTANTS.PROTOCOL_INFO,
    oneTimePrekeyIndex,
    additionalData
  } = options;

  // Validate recipient bundle
  validateBundle(recipientBundle);

  // Verify signed prekey
  const encodedSPK = BundleManager.encodePublicKey(recipientBundle.signedPrekey.publicKey);
  verifySignedPrekey(recipientBundle, encodedSPK);

  // Generate ephemeral key
  const ephemeralKey = X25519.generateKeyPair();



  // Derive shared secret
  const SK = deriveSharedSecret(computeX3DHSecrets(
    senderKeys,
    recipientBundle,
    ephemeralKey,
    oneTimePrekeyIndex
  ), info);

  // Prepare Associated Data (AD)
  const AD = createAssociatedData(
    senderKeys.identityKey.publicKey,
    recipientBundle.identityKeyX25519,
    additionalData
  );

  // Encrypt message
  const { ciphertext, nonce } = encryptMessage(message, SK, AD);

  // Clean up sensitive data
  memzero(ephemeralKey.privateKey);
  memzero(SK);

  return {
    initialMessage: {
      identityKey: senderKeys.identityKey.publicKey,
      ephemeralKey: ephemeralKey.publicKey,
      usedPrekeys: {
        signedPrekey: true,
        oneTimePrekeyIndex
      },
      ciphertext,
      nonce
    },
    sharedSecret: new Uint8Array(SK)
  };
}
