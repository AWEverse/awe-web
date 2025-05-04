import {
  PublicKey,
  Curve,
  PQKEMPublicKey,
  PQKEM,
  PQXDHParameters,
} from "./types";

namespace PQXDHParamsManager {
  /**
   * Створює набір стандартних параметрів для протоколу PQXDH.
   * Використовує рекомендовані константи з специфікації Signal.
   */
  export function createDefaultParams(): PQXDHParameters {
    return {
      curve: "curve25519",
      hash: "SHA-256",
      info: "PQXDH_SIGNAL_v1", // Мінімум 8 байтів для контексту додатка
      pqkem: "CRYSTALS-KYBER-1024", // Найбільш безпечний варіант Kyber
      aead: "AES-256-GCM",
      // Функції кодування/декодування реалізуються залежно від платформи
      encodeEC: (pk: PublicKey): Uint8Array => {
        // Приклад: [1-байтовий ідентифікатор кривої | дані ключа]
        const result = new Uint8Array(1 + pk.data.length);
        result[0] = pk.curve === "curve25519" ? 0x01 : 0x02;
        result.set(pk.data, 1);
        return result;
      },
      decodeEC: (bytes: Uint8Array): PublicKey => {
        // Приклад: [1-байтовий ідентифікатор кривої | дані ключа]
        const curveId = bytes[0];
        const curve: Curve = curveId === 0x01 ? "curve25519" : "curve448";
        const data = bytes.slice(1);
        return { curve, data };
      },
      encodeKEM: (pk: PQKEMPublicKey): Uint8Array => {
        // Приклад: [1-байтовий ідентифікатор KEM | дані ключа]
        const result = new Uint8Array(1 + pk.data.length);
        result[0] =
          pk.kem === "CRYSTALS-KYBER-1024"
            ? 0x03
            : pk.kem === "CRYSTALS-KYBER-768"
              ? 0x02
              : 0x01;
        result.set(pk.data, 1);
        return result;
      },
      decodeKEM: (bytes: Uint8Array): PQKEMPublicKey => {
        // Приклад: [1-байтовий ідентифікатор KEM | дані ключа]
        const kemId = bytes[0];
        let kem: PQKEM;
        if (kemId === 0x03) kem = "CRYSTALS-KYBER-1024";
        else if (kemId === 0x02) kem = "CRYSTALS-KYBER-768";
        else kem = "CRYSTALS-KYBER-512";

        const data = bytes.slice(1);
        return { kem, data };
      },
    };
  }
}

export default PQXDHParamsManager;
