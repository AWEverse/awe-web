import { memzero } from "libsodium-wrappers";
import { KeyBundle, InitialMessage } from "../../interfaces";
import {
  CONSTANTS,
  CryptoError,
  computeDH,
  deriveSharedSecret,
  createAssociatedData,
  decryptMessage,
} from "../utils/cryptoUtils";

interface ReceiveInitialMessageResult {
  decryptedMessage: string;
  sharedSecret: Uint8Array;
  senderIdentityKey: Uint8Array;
}

interface ReceiveInitialMessageOptions {
  info?: string;
  additionalData?: { [key: string]: string };
}

function validateInitialMessage(initialMessage: InitialMessage): void {
  const { identityKey, ephemeralKey, usedPrekeys } = initialMessage;

  if (
    !identityKey ||
    !ephemeralKey ||
    identityKey.length !== CONSTANTS.KEY_LENGTH ||
    ephemeralKey.length !== CONSTANTS.KEY_LENGTH
  ) {
    throw new CryptoError(
      CONSTANTS.ERROR_CODES.INVALID_KEY_LENGTH,
      "Invalid key lengths in initial message",
    );
  }

  if (!usedPrekeys.signedPrekey) {
    throw new CryptoError(
      CONSTANTS.ERROR_CODES.INVALID_PREKEY,
      "Signed prekey is required",
    );
  }
}

function computeX3DHSecrets(
  recipientKeys: KeyBundle,
  initialMessage: InitialMessage,
  OPK?: Uint8Array,
): Uint8Array[] {
  const { identityKey: senderIdentityKey, ephemeralKey } = initialMessage;
  const dhSecrets: Uint8Array[] = [];

  // DH1 = SignedPrekey * IKs
  dhSecrets.push(
    computeDH(recipientKeys.signedPrekey.keyPair.privateKey, senderIdentityKey),
  );

  // DH2 = IKr * EKs
  dhSecrets.push(computeDH(recipientKeys.identityKey.privateKey, ephemeralKey));

  // DH3 = SPKr * EKs
  dhSecrets.push(
    computeDH(recipientKeys.signedPrekey.keyPair.privateKey, ephemeralKey),
  );

  // DH4 = OPKr * EKs (if one-time prekey was used)
  if (OPK) {
    dhSecrets.push(computeDH(OPK, ephemeralKey));
  }

  return dhSecrets;
}

function getOneTimePrekey(
  recipientKeys: KeyBundle,
  oneTimePrekeyIndex?: number,
): Uint8Array | undefined {
  if (oneTimePrekeyIndex === undefined) {
    return undefined;
  }

  if (
    oneTimePrekeyIndex < 0 ||
    oneTimePrekeyIndex >= recipientKeys.oneTimePrekeys.length
  ) {
    throw new CryptoError(
      CONSTANTS.ERROR_CODES.INVALID_PREKEY,
      "Invalid one-time prekey index",
    );
  }

  return recipientKeys.oneTimePrekeys[oneTimePrekeyIndex];
}

/**
 * Receives and processes an initial message using the X3DH protocol.
 *
 * This function implements the receiving side of the X3DH protocol by:
 * 1. Validating the initial message format
 * 2. Computing DH shared secrets
 * 3. Deriving the shared secret key
 * 4. Decrypting the message with associated data
 *
 * The function follows memory safety practices by securely wiping sensitive data after use.
 *
 * @param recipientKeys - The recipient's key bundle containing private keys
 * @param initialMessage - The received initial message containing sender's keys and encrypted data
 * @param options - Optional parameters for customizing the protocol
 * @returns An object containing the decrypted message and derived shared secret
 * @throws {CryptoError} If validation fails or decryption is unsuccessful
 */
export default function receiveInitialMessage(
  recipientKeys: KeyBundle,
  initialMessage: InitialMessage,
  options: ReceiveInitialMessageOptions = {},
): ReceiveInitialMessageResult {
  const { info = CONSTANTS.PROTOCOL_INFO, additionalData } = options;

  // Validate initial message
  validateInitialMessage(initialMessage);

  // Get one-time prekey if specified
  const OPK = getOneTimePrekey(
    recipientKeys,
    initialMessage.usedPrekeys.oneTimePrekeyIndex,
  );

  // Derive shared secret
  const SK = deriveSharedSecret(
    computeX3DHSecrets(recipientKeys, initialMessage, OPK),
    info,
  );

  // Create Associated Data (AD)
  const AD = createAssociatedData(
    initialMessage.identityKey,
    recipientKeys.identityKey.publicKey,
    additionalData,
  );

  // Decrypt message
  const decryptedMessage = decryptMessage(
    initialMessage.ciphertext,
    initialMessage.nonce,
    SK,
    AD,
  );

  // Clean up sensitive data
  memzero(SK);

  return {
    decryptedMessage,
    sharedSecret: new Uint8Array(SK),
    senderIdentityKey: new Uint8Array(initialMessage.identityKey),
  };
}
