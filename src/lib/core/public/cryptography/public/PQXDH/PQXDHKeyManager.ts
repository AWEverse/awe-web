// Fix for PQXDHKeyManager.ts
import {
  crypto_box_keypair,
  crypto_sign_keypair,
  randombytes_buf,
  to_base64,
  crypto_sign_ed25519_pk_to_curve25519,
  crypto_sign_ed25519_sk_to_curve25519,
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
  // Generate Ed25519 keypair for signing (IK_r)
  export function generateEd25519KeyPair(): ECKeyPair {
    const { publicKey, privateKey } = crypto_sign_keypair();
    return {
      publicKey: { curve: "ed25519", data: publicKey },
      privateKey: { curve: "ed25519", data: privateKey }, // 64-byte private key
    };
  }

  // Generate X25519 keypair for Diffie-Hellman from Ed25519 keys
  export function convertEd25519ToCurve25519(edKeyPair: ECKeyPair): ECKeyPair {
    if (edKeyPair.publicKey.curve !== "ed25519" || edKeyPair.privateKey.curve !== "ed25519") {
      throw new Error("Expected Ed25519 keypair");
    }

    // Convert Ed25519 public key to Curve25519 public key
    const curve25519Pk = crypto_sign_ed25519_pk_to_curve25519(edKeyPair.publicKey.data);

    // Convert Ed25519 private key to Curve25519 private key
    const curve25519Sk = crypto_sign_ed25519_sk_to_curve25519(edKeyPair.privateKey.data);

    return {
      publicKey: { curve: "curve25519", data: curve25519Pk },
      privateKey: { curve: "curve25519", data: curve25519Sk },
    };
  }

  // Generate Curve25519 or Curve448 keypair for Diffie-Hellman
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
        throw new Error("Curve448 не підтримується в поточній реалізації");
      }
    }
  }

  export function generatePQKEMKeyPair(kem: PQKEM): PQKEMKeyPair {
    // Implementation remains the same
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
    // For the sender, we need both Ed25519 for signing and Curve25519 for DH
    const edKeyPair = generateEd25519KeyPair();
    const dhKeyPair = convertEd25519ToCurve25519(edKeyPair);

    return {
      IK_s: {
        publicKey: { curve: "ed25519", data: edKeyPair.publicKey.data },
        privateKey: { curve: "ed25519", data: edKeyPair.privateKey.data }
      },
      // Store the equivalent curve25519 key for DH operations
      IK_s_dh: dhKeyPair, // Add this new property to store the converted keys
      EK_s: generateECKeyPair(params.curve),
    };
  }

  // The rest remains unchanged
  export function createReceiverKeys(params: PQXDHParameters): ReceiverKeys {
    // For the receiver, we need both Ed25519 for signing and Curve25519 for DH
    const edKeyPair = generateEd25519KeyPair();
    const dhKeyPair = convertEd25519ToCurve25519(edKeyPair);

    // Create curve25519 keypairs for DH operations
    const SPK_r = generateECKeyPair(params.curve);
    const OPK_r = generateECKeyPair(params.curve);

    return {
      IK_r: edKeyPair,
      IK_r_dh: dhKeyPair, // Add this new property to store the converted keys
      SPK_r: {
        ...SPK_r,
        id: to_base64(randombytes_buf(16)),
      },
      OPK_r: {
        ...OPK_r,
        id: to_base64(randombytes_buf(16)),
      },
      PQSPK_r: {
        ...generatePQKEMKeyPair(params.pqkem),
        id: to_base64(randombytes_buf(16)),
      },
      PQOPK_r: {
        ...generatePQKEMKeyPair(params.pqkem),
        id: to_base64(randombytes_buf(16)),
      },
    };
  }
}

export default PQXDHKeyManager;
