import crypto from "libsodium-wrappers";
import {
  Curve,
  ECKeyPair,
  PQKEM,
  PQKEMKeyPair,
  PQXDHParameters,
  ReceiverKeys,
  SenderKeys,
} from "./types";

namespace PQXDHKeyManager {
  export function generateECKeyPair(curve: Curve): ECKeyPair {
    switch (curve) {
      case "curve25519":
      default: {
        const keypair = crypto.crypto_box_keypair();
        const publicKeyData = keypair.publicKey;
        const privateKeyData = keypair.privateKey;

        return {
          publicKey: { curve, data: publicKeyData },
          privateKey: { curve, data: privateKeyData },
        };
      }
      case "curve448": {
        // curve448
        // Примітка: libcrypto не має реалізації curve448
        // В реальному коді використовувалась би інша бібліотека для curve448
        throw new Error("Curve448 не підтримується в поточній реалізації");
      }
    }
  }

  export function generatePQKEMKeyPair(kem: PQKEM): PQKEMKeyPair {
    let publicKeySize = 0;
    let privateKeySize = 0;

    switch (kem) {
      case "CRYSTALS-KYBER-512":
        publicKeySize = 800;
        privateKeySize = 1632;
        break;
      case "CRYSTALS-KYBER-768":
        publicKeySize = 1184;
        privateKeySize = 2400;
        break;
      case "CRYSTALS-KYBER-1024":
        publicKeySize = 1568;
        privateKeySize = 3168;
        break;
    }

    const publicKeyData = crypto.randombytes_buf(publicKeySize);
    const privateKeyData = crypto.randombytes_buf(privateKeySize);

    return {
      publicKey: { kem, data: publicKeyData },
      privateKey: { kem, data: privateKeyData },
    };
  }

  export function createSenderKeys(params: PQXDHParameters): SenderKeys {
    return {
      IK_s: generateECKeyPair(params.curve),
      EK_s: generateECKeyPair(params.curve),
    };
  }

  export function createReceiverKeys(params: PQXDHParameters): ReceiverKeys {
    return {
      IK_r: generateECKeyPair(params.curve),
      SPK_r: {
        ...generateECKeyPair(params.curve)                  /* SPK_r */,
        id: crypto.to_base64(crypto.randombytes_buf(16))  /*spkId  */,
      }, // SPK_r_with_id,
      OPK_r: {
        ...generateECKeyPair(params.curve)                  /* OPK_r */,
        id: crypto.to_base64(crypto.randombytes_buf(16))  /*opkId */,
      }, // OPK_r_with_id,
      PQSPK_r: {
        ...generatePQKEMKeyPair(params.pqkem)               /* PQSPK_r */,
        id: crypto.to_base64(crypto.randombytes_buf(16))  /*pqspkId */,
      }, // PQSPK_r_with_id,
      PQOPK_r: {
        ...generatePQKEMKeyPair(params.pqkem)               /* PQOPK_r */,
        id: crypto.to_base64(crypto.randombytes_buf(16))  /*pqopkId */,
      }, // PQOPK_r_with_id
    };
  }
}

export default PQXDHKeyManager;
