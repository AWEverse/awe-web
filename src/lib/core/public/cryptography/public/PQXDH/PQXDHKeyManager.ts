import {
  crypto_box_keypair,
  randombytes_buf,
  to_base64,
} from "libsodium-wrappers";
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
        const keypair = crypto_box_keypair();

        return {
          publicKey: { curve, data: keypair.publicKey },
          privateKey: { curve, data: keypair.privateKey },
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

    const publicKeyData = randombytes_buf(publicKeySize);
    const privateKeyData = randombytes_buf(privateKeySize);

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
        ...generateECKeyPair(params.curve) /* var: SPK_r */,
        id: to_base64(randombytes_buf(16)) /*var: spkId  */,
      }, // field: SPK_r_with_id,
      OPK_r: {
        ...generateECKeyPair(params.curve) /* var: OPK_r */,
        id: to_base64(randombytes_buf(16)) /*var: opkId */,
      }, // field: OPK_r_with_id,
      PQSPK_r: {
        ...generatePQKEMKeyPair(params.pqkem) /* var: PQSPK_r */,
        id: to_base64(randombytes_buf(16)) /*var: pqspkId */,
      }, // field: PQSPK_r_with_id,
      PQOPK_r: {
        ...generatePQKEMKeyPair(params.pqkem) /* var: PQOPK_r */,
        id: to_base64(randombytes_buf(16)) /*var: pqopkId */,
      }, // field: PQOPK_r_with_id
    };
  }
}

export default PQXDHKeyManager;
