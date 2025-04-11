const HKDF_INFO = new TextEncoder().encode("DoubleRatchet");
const MAX_SKIPPED_KEYS = 1000;

interface SessionState {
  rootKey: Uint8Array;
  sendChainKey: Uint8Array | null;
  recvChainKey: Uint8Array | null;
  ratchetKeyPair: { publicKey: Uint8Array; privateKey: Uint8Array } | null;
  remoteRatchetPub: Uint8Array | null;
  prevChainLength: number;
  sendMessageNum: number;
  recvMessageNum: number;
  skippedKeys: Map<string, Uint8Array>;
}

interface MessageHeader {
  ratchetPub: Uint8Array;
  prevChainLength: number;
  messageNum: number;
}

interface EncryptedMessage {
  header: MessageHeader;
  ciphertext: Uint8Array;
}
