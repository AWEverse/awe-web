import {
  PublicKey,
  Curve,
  PQKEMPublicKey,
  PQKEM,
  PQXDHParameters,
} from "./types";

enum CURVE_ID {
  curve25519 = 0x01,
  curve448 = 0x02
}

enum KEM_ID {
  'CRYSTALS-KYBER-512' = 0x01,
  'CRYSTALS-KYBER-768' = 0x02,
  'CRYSTALS-KYBER-1024' = 0x03
}

namespace PQXDHParamsManager {
  // Reverse mapping: number -> Curve or PQKEM
  const ID_TO_CURVE: Record<number, Curve> = {
    [CURVE_ID.curve25519]: "curve25519",
    [CURVE_ID.curve448]: "curve448"
  };

  const ID_TO_KEM: Record<number, PQKEM> = {
    [KEM_ID['CRYSTALS-KYBER-512']]: "CRYSTALS-KYBER-512",
    [KEM_ID['CRYSTALS-KYBER-768']]: "CRYSTALS-KYBER-768",
    [KEM_ID['CRYSTALS-KYBER-1024']]: "CRYSTALS-KYBER-1024"
  };

  /**
   * Creates default PQXDH parameters per Signal specification.
   */
  export function createDefaultParams(): PQXDHParameters {
    return {
      curve: "curve25519",
      hash: "SHA-256",
      info: "PQXDH_SIGNAL_v1",
      pqkem: "CRYSTALS-KYBER-1024",
      aead: "AES-256-GCM",

      // Encodes an elliptic curve public key into Uint8Array
      encodeEC(pk: PublicKey): Uint8Array {
        const out = new Uint8Array(1 + pk.data.length);
        out[0] = CURVE_ID[pk.curve];
        out.set(pk.data, 1);
        return out;
      },

      // Decodes an elliptic curve public key from Uint8Array
      decodeEC(bytes: Uint8Array): PublicKey {
        const curve = ID_TO_CURVE[bytes[0]];
        const data = bytes.subarray(1);
        return { curve, data };
      },

      // Encodes a post-quantum KEM public key into Uint8Array
      encodeKEM(pk: PQKEMPublicKey): Uint8Array {
        const out = new Uint8Array(1 + pk.data.length);
        out[0] = KEM_ID[pk.kem as keyof typeof KEM_ID];
        out.set(pk.data, 1);
        return out;
      },

      // Decodes a post-quantum KEM public key from Uint8Array
      decodeKEM(bytes: Uint8Array): PQKEMPublicKey {
        const kem = ID_TO_KEM[bytes[0]];
        const data = bytes.subarray(1);
        return { kem, data };
      }
    };
  }
}

export default PQXDHParamsManager;
