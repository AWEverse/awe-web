export interface DHKeyPair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

export interface State {
  DHs: DHKeyPair; // Текущая собственная DH-пара (отправителя)
  DHr: Uint8Array | null; // Последний полученный DH-публичный ключ собеседника
  RK: Uint8Array; // Корневой ключ (Root Key)
  CKs: Uint8Array | null; // Цепной ключ для исходящих сообщений (Chain Key Send)
  CKr: Uint8Array | null; // Цепной ключ для входящих сообщений (Chain Key Receive)
  Ns: number; // Счётчик отправленных сообщений в текущей цепочке
  Nr: number; // Счётчик полученных сообщений в текущей цепочке
  PN: number; // Количество сообщений, отправленных с предыдущей цепочкой
  MKSKIPPED: Map<string, Uint8Array>; // Хранилище пропущенных ключей сообщений (Skipped Message Keys)
}

export interface Message {
  header: Uint8Array;
  ciphertext: Uint8Array;
}
