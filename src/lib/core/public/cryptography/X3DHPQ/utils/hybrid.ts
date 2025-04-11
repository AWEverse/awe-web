// utils/hybrid.ts
import { concatUint8Arrays } from "../utils/arrays";

export type DHSecret = Promise<Uint8Array>;
export type PQSecret = Promise<{ sharedSecret: Uint8Array; cipherText?: Uint8Array }>;

/**
 * Объединяет все классические и PQ-секреты в один байтовый массив
 */
export async function computeHybridSecrets(
  dhSecrets: DHSecret[],
  pqSecrets: PQSecret[]
): Promise<{
  combinedSecret: Uint8Array;
  encapsulations: Uint8Array[];
}> {
  const resolvedDH = await Promise.all(dhSecrets);
  const resolvedPQ = await Promise.all(pqSecrets);

  const pqSharedSecrets = resolvedPQ.map(pq => pq.sharedSecret);
  const pqCiphertexts = resolvedPQ.map(pq => pq.cipherText).filter(Boolean) as Uint8Array[];

  const combinedSecret = concatUint8Arrays([...resolvedDH, ...pqSharedSecrets]);

  return {
    combinedSecret,
    encapsulations: pqCiphertexts,
  };
}
