import { randombytes_buf } from "libsodium-wrappers";
import PQXDHCrypto from "./PQXDHCrypto";
import PQXDHKeyManager from "./PQXDHKeyManager";
import {
  PQXDHContext,
  PQXDHParameters,
  PrekeyBundle,
  InitialMessage,
  AssociatedData,
  PQXDHResult,
} from "./types";

class PQXDHProtocol {
  private context: PQXDHContext;

  constructor(context: PQXDHContext) {
    this.context = context;
  }

  /**
   * Ініціалізує базовий контекст для протоколу PQXDH.
   *
   * @param params - Параметри протоколу
   * @returns Ініціалізований контекст PQXDH
   */
  static createContext(params: PQXDHParameters): PQXDHContext {
    const crypto = new PQXDHCrypto();

    return {
      parameters: params,
      sender: PQXDHKeyManager.createSenderKeys(params),
      receiver: PQXDHKeyManager.createReceiverKeys(params),
      dh: crypto.dh.bind(crypto),
      sig: crypto.sig.bind(crypto),
      verify: crypto.verify.bind(crypto),
      kdf: crypto.kdf.bind(crypto),
      pqkemEnc: crypto.pqkemEnc.bind(crypto),
      pqkemDec: crypto.pqkemDec.bind(crypto),
      aeadEnc: crypto.aeadEnc.bind(crypto),
      aeadDec: crypto.aeadDec.bind(crypto),
    };
  }

  /**
   * Створює набір попередніх ключів для протоколу PQXDH.
   * Цей набір передається потенційним відправникам через сервер.
   *
   * @returns Набір попередніх ключів
   */
  createPrekeyBundle(): PrekeyBundle {
    const { receiver, parameters, sig } = this.context;
    const { IK_r, SPK_r, OPK_r, PQSPK_r, PQOPK_r } = receiver;

    const random = randombytes_buf(32);

    const encodedSPK = parameters.encodeEC(SPK_r.publicKey);
    const encodedPQKEM = parameters.encodeKEM(
      PQOPK_r ? PQOPK_r.publicKey : PQSPK_r.publicKey,
    );

    const SPK_r_Sig = sig(IK_r.privateKey, encodedSPK, random);
    const PQPK_r_Sig = sig(IK_r.privateKey, encodedPQKEM, random);

    const usePQOPK = !!PQOPK_r;
    const PQPK_r = usePQOPK ? PQOPK_r!.publicKey : PQSPK_r.publicKey;
    const PQPK_r_Id = usePQOPK ? PQOPK_r!.id : PQSPK_r.id;

    return {
      IK_r: IK_r.publicKey,
      SPK_r: SPK_r.publicKey,
      SPK_r_Id: SPK_r.id,
      SPK_r_Sig,
      PQPK_r,
      PQPK_r_Id,
      PQPK_r_Sig,
      OPK_r: OPK_r?.publicKey,
      OPK_r_Id: OPK_r?.id,
    };
  }

  runAsSender(
    prekeyBundle: PrekeyBundle,
    initialPlaintext: Uint8Array,
    associatedData: AssociatedData,
  ): PQXDHResult {
    const { sender, parameters, dh, verify, kdf, pqkemEnc, aeadEnc } =
      this.context;

    const encodedSPK = parameters.encodeEC(prekeyBundle.SPK_r);
    const isValidSPK = verify(
      prekeyBundle.IK_r,
      encodedSPK,
      prekeyBundle.SPK_r_Sig,
    );

    if (!isValidSPK) {
      throw new Error("Недійсний підпис для SPK_r");
    }

    const encodedPQPK = parameters.encodeKEM(prekeyBundle.PQPK_r);
    const isValidPQPK = verify(
      prekeyBundle.IK_r,
      encodedPQPK,
      prekeyBundle.PQPK_r_Sig,
    );

    if (!isValidPQPK) {
      throw new Error("Недійсний підпис для PQPK_r");
    }

    const DH1 = dh(prekeyBundle.SPK_r, sender.IK_s.privateKey);
    const DH2 = dh(prekeyBundle.IK_r, sender.EK_s.privateKey);
    const DH3 = dh(prekeyBundle.SPK_r, sender.EK_s.privateKey);

    let DH4: Uint8Array | null = null;
    if (prekeyBundle.OPK_r) {
      DH4 = dh(prekeyBundle.OPK_r, sender.EK_s.privateKey);
    }

    const { ciphertext: CT, sharedSecret: SS } = pqkemEnc(prekeyBundle.PQPK_r);

    let inputKeyMaterial = new Uint8Array(
      DH1.length + DH2.length + DH3.length + (DH4 ? DH4.length : 0) + SS.length,
    );

    let offset = 0;
    inputKeyMaterial.set(DH1, offset);
    offset += DH1.length;
    inputKeyMaterial.set(DH2, offset);
    offset += DH2.length;
    inputKeyMaterial.set(DH3, offset);
    offset += DH3.length;

    if (DH4) {
      inputKeyMaterial.set(DH4, offset);
      offset += DH4.length;
    }

    inputKeyMaterial.set(SS, offset);

    const infoBytes = new TextEncoder().encode(parameters.info);
    const salt = new Uint8Array(32); // Нульова сіль

    const masterKey = kdf(salt, inputKeyMaterial, infoBytes, 32);

    const combinedAD = new Uint8Array(
      associatedData.length +
      parameters.encodeEC(sender.IK_s.publicKey).length +
      parameters.encodeEC(prekeyBundle.IK_r).length,
    );

    let adOffset = 0;
    combinedAD.set(associatedData, adOffset);
    adOffset += associatedData.length;
    combinedAD.set(parameters.encodeEC(sender.IK_s.publicKey), adOffset);
    adOffset += parameters.encodeEC(sender.IK_s.publicKey).length;
    combinedAD.set(parameters.encodeEC(prekeyBundle.IK_r), adOffset);

    const ciphertext = aeadEnc(masterKey, initialPlaintext, combinedAD);

    const initialMessage: InitialMessage = {
      IK_s: sender.IK_s.publicKey,
      EK_s: sender.EK_s.publicKey,
      CT,
      identifiers: {
        SPK_r_Id: prekeyBundle.SPK_r_Id,
        PQPK_r_Id: prekeyBundle.PQPK_r_Id,
        OPK_r_Id: prekeyBundle.OPK_r_Id,
      },
      ciphertext,
    };

    return {
      masterKey,
      initialMessage,
      associatedData,
    };
  }

  runAsReceiver(
    initialMessage: InitialMessage,
    associatedData: AssociatedData,
  ): PQXDHResult & { plaintext: Uint8Array } {
    const { receiver, parameters, dh, kdf, pqkemDec, aeadDec } = this.context;

    const SPK_r =
      receiver.SPK_r.id === initialMessage.identifiers.SPK_r_Id
        ? receiver.SPK_r
        : null;

    if (!SPK_r) {
      throw new Error("Не знайдено відповідний SPK_r");
    }

    let PQPK_r_sk;
    if (receiver.PQSPK_r.id === initialMessage.identifiers.PQPK_r_Id) {
      PQPK_r_sk = receiver.PQSPK_r.privateKey;
    } else if (
      receiver.PQOPK_r &&
      receiver.PQOPK_r.id === initialMessage.identifiers.PQPK_r_Id
    ) {
      PQPK_r_sk = receiver.PQOPK_r.privateKey;
    } else {
      throw new Error("Не знайдено відповідний постквантовий ключ");
    }

    let OPK_r = null;
    if (
      initialMessage.identifiers.OPK_r_Id &&
      receiver.OPK_r &&
      receiver.OPK_r.id === initialMessage.identifiers.OPK_r_Id
    ) {
      OPK_r = receiver.OPK_r;
    }

    const DH1 = dh(initialMessage.IK_s, SPK_r.privateKey);
    const DH2 = dh(initialMessage.EK_s, receiver.IK_r.privateKey);
    const DH3 = dh(initialMessage.EK_s, SPK_r.privateKey);

    let DH4: Uint8Array | null = null;
    if (OPK_r) {
      DH4 = dh(initialMessage.EK_s, OPK_r.privateKey);
    }

    const SS = pqkemDec(PQPK_r_sk, initialMessage.CT);

    let inputKeyMaterial = new Uint8Array(
      DH1.length + DH2.length + DH3.length + (DH4 ? DH4.length : 0) + SS.length,
    );

    let offset = 0;
    inputKeyMaterial.set(DH1, offset);
    offset += DH1.length;
    inputKeyMaterial.set(DH2, offset);
    offset += DH2.length;
    inputKeyMaterial.set(DH3, offset);
    offset += DH3.length;

    if (DH4) {
      inputKeyMaterial.set(DH4, offset);
      offset += DH4.length;
    }

    inputKeyMaterial.set(SS, offset);

    const infoBytes = new TextEncoder().encode(parameters.info);
    const salt = new Uint8Array(32);

    const masterKey = kdf(salt, inputKeyMaterial, infoBytes, 32);

    const combinedAD = new Uint8Array(
      associatedData.length +
      parameters.encodeEC(initialMessage.IK_s).length +
      parameters.encodeEC(receiver.IK_r.publicKey).length,
    );

    let adOffset = 0;
    combinedAD.set(associatedData, adOffset);
    adOffset += associatedData.length;
    combinedAD.set(parameters.encodeEC(initialMessage.IK_s), adOffset);
    adOffset += parameters.encodeEC(initialMessage.IK_s).length;
    combinedAD.set(parameters.encodeEC(receiver.IK_r.publicKey), adOffset);

    const plaintext = aeadDec(masterKey, initialMessage.ciphertext, combinedAD);

    return {
      masterKey,
      initialMessage,
      plaintext,
      associatedData,
    };
  }
}

export default PQXDHProtocol;
