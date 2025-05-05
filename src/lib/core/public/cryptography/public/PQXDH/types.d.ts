/**
 * TypeScript документація та імплементація для протоколу PQXDH (Post-Quantum Extended Diffie-Hellman)
 * Базується на офіційній специфікації: https://signal.org/docs/specifications/pqxdh/
 *
 * PQXDH - це протокол обміну ключами, що поєднує класичний X3DH (Extended Triple Diffie-Hellman)
 * з постквантовим механізмом інкапсуляції ключів (KEM) для забезпечення безпеки як проти
 * класичних, так і проти квантових атак.
 */

/**
 * Представляє еліптичну криву, що використовується для операцій Діффі-Геллмана.
 * Підтримує Curve25519 (основна для Signal) і Curve448 відповідно до RFC 7748.
 */
export type Curve = "curve25519" | "ed25519" | "curve448";

/**
 * Специфікує геш-функцію, що використовується в протоколі.
 * Підтримує SHA-256 або SHA-512 як 256-бітну або 512-бітну геш-функцію.
 */
export type Hash = "SHA-256" | "SHA-512";

/**
 * Визначає постквантовий механізм інкапсуляції ключів (KEM).
 * Початкова специфікація PQXDH використовувала SPHINCS+, але
 * сучасна реалізація підтримує CRYSTALS-KYBER як більш ефективний механізм.
 * CRYSTALS-KYBER надає IND-CCA постквантову безпеку.
 */
export type PQKEM = "CRYSTALS-KYBER-512" | "CRYSTALS-KYBER-768" | "CRYSTALS-KYBER-1024";

/**
 * Представляє схему автентифікованого шифрування з додатковими даними (AEAD).
 * Повинна забезпечувати IND-CPA та INT-CTXT постквантову безпеку.
 * Signal зазвичай використовує AES-256-GCM або ChaCha20-Poly1305.
 */
export type AEAD = "AES-256-GCM" | "ChaCha20-Poly1305" | string;

/**
 * ASCII рядок, що ідентифікує додаток.
 * Повинен бути довжиною не менше 8 байтів.
 * Використовується для розділення криптографічних контекстів між різними додатками.
 */
export type Info = string;

/**
 * Кодує публічний ключ еліптичної кривої в послідовність байтів.
 * Типово включає однобайтовий ідентифікатор кривої, за яким слідує кодування
 * u-координати в форматі little-endian.
 */
export type EncodeEC = (publicKey: PublicKey) => Uint8Array;

/**
 * Декодує послідовність байтів у публічний ключ еліптичної кривої.
 * Інверсія EncodeEC, перевіряє ідентифікатор кривої та декодує u-координату.
 */
export type DecodeEC = (bytes: Uint8Array) => PublicKey;

/**
 * Кодує публічний ключ постквантового KEM у послідовність байтів.
 * Включає однобайтовий ідентифікатор KEM, за яким слідує специфічне для KEM кодування.
 */
export type EncodeKEM = (publicKey: PQKEMPublicKey) => Uint8Array;

/**
 * Декодує послідовність байтів у публічний ключ постквантового KEM.
 * Інверсія EncodeKEM, перевіряє ідентифікатор KEM і застосовує специфічне для KEM декодування.
 */
export type DecodeKEM = (bytes: Uint8Array) => PQKEMPublicKey;

/**
 * Представляє публічний ключ еліптичної кривої.
 */
export interface PublicKey {
  /** Крива, що використовується для цього ключа (curve25519 або curve448). */
  curve: Curve;
  /** Необроблені дані ключа як послідовність байтів. */
  data: Uint8Array;
}

/**
 * Представляє приватний ключ еліптичної кривої.
 */
export interface PrivateKey {
  /** Крива, що використовується для цього ключа (curve25519 або curve448). */
  curve: Curve;
  /** Необроблені дані ключа як послідовність байтів. */
  data: Uint8Array;
}

/**
 * Представляє публічний ключ постквантового KEM.
 */
export interface PQKEMPublicKey {
  /** KEM, що використовується для цього ключа (наприклад, CRYSTALS-KYBER-1024). */
  kem: PQKEM;
  /** Необроблені дані ключа як послідовність байтів. */
  data: Uint8Array;
}

/**
 * Представляє приватний ключ постквантового KEM.
 */
export interface PQKEMPrivateKey {
  /** KEM, що використовується для цього ключа (наприклад, CRYSTALS-KYBER-1024). */
  kem: PQKEM;
  /** Необроблені дані ключа як послідовність байтів. */
  data: Uint8Array;
}

/**
 * Представляє пару ключів еліптичної кривої (публічний і приватний ключі).
 */
export interface ECKeyPair {
  /** Публічний ключ пари. */
  publicKey: PublicKey;
  /** Приватний ключ пари. */
  privateKey: PrivateKey;
}

/**
 * Представляє пару ключів постквантового KEM (публічний і приватний ключі).
 */
export interface PQKEMKeyPair {
  /** Публічний ключ пари. */
  publicKey: PQKEMPublicKey;
  /** Приватний ключ пари. */
  privateKey: PQKEMPrivateKey;
}

/**
 * Унікальний ідентифікатор для ключа, що використовується для посилання на попередні ключі на сервері.
 * Може бути гешем, випадковим значенням або послідовним ідентифікатором
 * для уникнення колізій.
 */
export type KeyIdentifier = string;

/**
 * Визначає ключі, що використовуються відправником (Sender) у протоколі PQXDH.
 */
export interface SenderKeys {
  /** Довгостроковий ідентифікаційний ключ відправника. */
  IK_s: ECKeyPair;
  IK_s_dh: ECKeyPair;
  /** Ефемерний ключ відправника, що генерується для кожного запуску протоколу. */
  EK_s: ECKeyPair;
}

/**
 * Визначає ключі, що використовуються одержувачем (Receiver) у протоколі PQXDH.
 */
export interface ReceiverKeys {
  /** Довгостроковий ідентифікаційний ключ одержувача. */
  IK_r: ECKeyPair;
  IK_r_dh: ECKeyPair;
  /** Підписана попередня пара ключів одержувача з її ідентифікатором, періодично замінюється. */
  SPK_r: ECKeyPair & { id: KeyIdentifier };
  /** Опціональна одноразова попередня пара ключів одержувача з її ідентифікатором,
      використовується один раз на запуск протоколу. */
  OPK_r?: ECKeyPair & { id: KeyIdentifier };
  /** Підписана резервна постквантова KEM пара ключів одержувача,
      використовується, коли одноразові KEM попередні ключі недоступні. */
  PQSPK_r: PQKEMKeyPair & { id: KeyIdentifier };
  /** Опціональна одноразова постквантова KEM пара ключів одержувача,
      використовується один раз на запуск протоколу. */
  PQOPK_r?: PQKEMKeyPair & { id: KeyIdentifier };
}

/**
 * Виконує операцію Діффі-Геллмана на еліптичній кривій (X25519 або X448).
 * Приймає публічний ключ і приватний ключ, повертає спільний секрет як послідовність байтів.
 */
export type DHFunction = (
  publicKey: PublicKey,
  privateKey: PrivateKey
) => Uint8Array;

/**
 * Генерує підпис XEdDSA на повідомленні, використовуючи публічний ключ і випадковість.
 * Повертає підпис як 64-байтову послідовність, що може бути перевірена з публічним ключем.
 */
export type SignatureFunction = (
  privateKey: PrivateKey,
  message: Uint8Array,
) => Uint8Array;

/**
 * Перевіряє підпис XEdDSA на повідомленні, використовуючи публічний ключ.
 * Повертає true, якщо підпис дійсний, і false в іншому випадку.
 */
export type VerifyFunction = (
  publicKey: PublicKey,
  message: Uint8Array,
  signature: Uint8Array
) => boolean;

/**
 * Виводить 32-байтовий ключ, використовуючи HKDF із вказаними вхідними даними.
 * Приймає матеріал ключа та генерує вихід фіксованої довжини на основі параметрів протоколу.
 */
export type KDFFunction = (
  salt: Uint8Array,
  inputKeyMaterial: Uint8Array,
  info: Uint8Array,
  outputLength: number
) => Uint8Array;

/**
 * Виконує постквантову KEM інкапсуляцію.
 * Приймає публічний KEM ключ, повертає шифротекст і інкапсульований спільний секрет.
 */
export type PQKEMEncFunction = (pk: PQKEMPublicKey) => {
  ciphertext: Uint8Array;
  sharedSecret: Uint8Array;
};

/**
 * Виконує постквантову KEM декапсуляцію.
 * Приймає приватний KEM ключ і шифротекст, повертає декапсульований спільний секрет.
 */
export type PQKEMDecFunction = (
  sk: PQKEMPrivateKey,
  ciphertext: Uint8Array,
) => Uint8Array;

/**
 * Функція для AEAD шифрування.
 * Приймає ключ, явний текст, додаткові дані та повертає шифротекст.
 */
export type AEADEncFunction = (
  key: Uint8Array,
  plaintext: Uint8Array,
  associatedData: Uint8Array
) => Uint8Array;

/**
 * Функція для AEAD розшифрування.
 * Приймає ключ, шифротекст, додаткові дані та повертає явний текст.
 * Викидає помилку, якщо автентифікація не пройшла успішно.
 */
export type AEADDecFunction = (
  key: Uint8Array,
  ciphertext: Uint8Array,
  associatedData: Uint8Array
) => Uint8Array;

/**
 * Представляє набір попередніх ключів, отриманий відправником від сервера для ініціації PQXDH.
 */
export interface PrekeyBundle {
  /** Ідентифікаційний публічний ключ одержувача. */
  IK_r: PublicKey;
  /** Підписаний попередній публічний ключ одержувача. */
  SPK_r: PublicKey;
  /** Ідентифікатор для підписаного попереднього ключа одержувача. */
  SPK_r_Id: KeyIdentifier;
  /** Підпис на підписаному попередньому ключі, підписаний IK_r. */
  SPK_r_Sig: Uint8Array;
  /** Постквантовий KEM попередній ключ одержувача (одноразовий або резервний). */
  PQPK_r: PQKEMPublicKey;
  /** Ідентифікатор для постквантового KEM попереднього ключа одержувача. */
  PQPK_r_Id: KeyIdentifier;
  /** Підпис на постквантовому KEM попередньому ключі, підписаний IK_r. */
  PQPK_r_Sig: Uint8Array;
  /** Опціональний одноразовий попередній публічний ключ одержувача. */
  OPK_r?: PublicKey;
  /** Ідентифікатор для опціонального одноразового попереднього ключа одержувача. */
  OPK_r_Id?: KeyIdentifier;
  random: UintArray;
}

/**
 * Представляє початкове повідомлення, надіслане відправником одержувачу.
 */
export interface InitialMessage {
  /** Ідентифікаційний публічний ключ відправника. */
  IK_s: PublicKey;
  /** Ефемерний публічний ключ відправника. */
  EK_s: PublicKey;
  /** Постквантовий KEM шифротекст, що інкапсулює спільний секрет. */
  CT: Uint8Array;
  /** Ідентифікатори для попередніх ключів, використаних у запуску протоколу. */
  identifiers: {
    /** Ідентифікатор для підписаного попереднього ключа одержувача. */
    SPK_r_Id: KeyIdentifier;
    /** Ідентифікатор для постквантового KEM попереднього ключа одержувача. */
    PQPK_r_Id: KeyIdentifier;
    /** Ідентифікатор для опціонального одноразового попереднього ключа одержувача. */
    OPK_r_Id?: KeyIdentifier;
  };
  /** AEAD-зашифрований початковий шифротекст, зазвичай перше повідомлення після PQXDH. */
  ciphertext: Uint8Array;
}

/**
 * Послідовність байтів, що містить ідентифікаційну інформацію для обох сторін.
 * Використовується як додаткові дані в AEAD шифруванні.
 */
export type AssociatedData = Uint8Array;

/**
 * Визначає криптографічні параметри для протоколу PQXDH.
 */
export interface PQXDHParameters {
  /** Еліптична крива, що використовується (curve25519 або curve448). */
  curve: Curve;
  /** Геш-функція, що використовується (SHA-256 або SHA-512). */
  hash: Hash;
  /** Ідентифікатор додатка (мінімум 8 байтів). */
  info: Info;
  /** Постквантовий KEM, що використовується (наприклад, CRYSTALS-KYBER-1024). */
  pqkem: PQKEM;
  /** Схема AEAD, що використовується для шифрування. */
  aead: AEAD;
  convertPublicKeyToCurve25519?: (ed25519PublicKey: Uint8Array) => Uint8Array;
  convertPrivateKeyToCurve25519?: (ed25519PrivateKey: Uint8Array) => Uint8Array;
  /** Функція для кодування публічних ключів еліптичної кривої. */
  encodeEC: EncodeEC;
  /** Функція для декодування публічних ключів еліптичної кривої. */
  decodeEC: DecodeEC;
  /** Функція для кодування постквантових KEM публічних ключів. */
  encodeKEM: EncodeKEM;
  /** Функція для декодування постквантових KEM публічних ключів. */
  decodeKEM: DecodeKEM;
}

/**
 * Представляє контекст клієнтської сторони для протоколу PQXDH.
 */
export interface PQXDHContext {
  /** Параметри протоколу. */
  parameters: PQXDHParameters;
  /** Ключі відправника. */
  sender: SenderKeys;
  /** Ключі одержувача. */
  receiver: ReceiverKeys;
  /** Функція Діффі-Геллмана для операцій на еліптичній кривій. */
  dh: DHFunction;
  /** Функція підпису для підписів XEdDSA. */
  sig: SignatureFunction;
  /** Функція перевірки підпису для підписів XEdDSA. */
  verify: VerifyFunction;
  /** Функція виведення ключа (HKDF). */
  kdf: KDFFunction;
  /** Функція постквантової KEM інкапсуляції. */
  pqkemEnc: PQKEMEncFunction;
  /** Функція постквантової KEM декапсуляції. */
  pqkemDec: PQKEMDecFunction;
  /** Функція для AEAD шифрування. */
  aeadEnc: AEADEncFunction;
  /** Функція для AEAD розшифрування. */
  aeadDec: AEADDecFunction;
}

/**
 * Результат виконання протоколу PQXDH, що містить спільні секрети та ключі сесії.
 */
export interface PQXDHResult {
  /** Головний ключ, отриманий з обміну ключами. */
  masterKey: Uint8Array;
  /** Додаткова криптографічна інформація для ініціалізації Double Ratchet. */
  associatedData: Uint8Array;
  /** Початкове повідомлення, що надсилається від відправника одержувачу. */
  initialMessage?: InitialMessage;
}
