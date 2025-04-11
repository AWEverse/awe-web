import { InitialMessage, X3DHError } from "..";

export function validateInitialMessage(message: InitialMessage): void {
  if (!message || !message.senderIdentityKeyX25519 || !message.ephemeralKeyEC) {
    throw new X3DHError("Invalid InitialMessage: Missing required keys.", "INVALID_MESSAGE");
  }

  if (!message.pqEncapsulations || !message.pqEncapsulations.identity || !message.pqEncapsulations.signedPreKey) {
    throw new X3DHError("Invalid InitialMessage: Missing PQ encapsulations.", "INVALID_MESSAGE");
  }

  if (message.pqEncapsulations.oneTimePreKey && !message.pqEncapsulations.oneTimePreKey.length) {
    throw new X3DHError("Invalid InitialMessage: OneTimePreKey is empty.", "INVALID_MESSAGE");
  }
}
