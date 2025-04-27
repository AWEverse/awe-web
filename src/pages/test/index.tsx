import React, { useState } from "react";
import { Buffer } from "buffer";
import useModalContext from "@/composers/modals/utils/hooks/useModalComposer";
import {
  computeReceiverSharedSecret,
  computeSenderSharedSecret,
  generateKeyBundle,
} from "@/lib/core/public/cryptography/X3DHPQ";
import {
  Crypto,
  State,
  ratchetDecrypt,
  ratchetEncrypt,
  ratchetInitSender,
  ratchetInitReceiver,
} from "@/lib/core/public/cryptography/DoubleRatchet";
import sodium from "libsodium-wrappers";
import TimePicker from "@/entities/date-picker/public/ui/additional/TimePicker";

const AdvancedEncryptionPage: React.FC = () => {
  const { openModal, closeModal } = useModalContext();

  return (
    <>
      <button onClick={() => openModal("calendar", {}, 0)}>
        Open Calendar
      </button>
      <TimePicker />
    </>
  );
};

// Тестовая функция
async function testProtocol() {
  try {
    const aliceBundle = await generateKeyBundle();
    const bobBundle = await generateKeyBundle();

    console.log(aliceBundle);
    console.log(bobBundle);

    const { sharedSecret: aliceSecret, initialMessage } =
      await computeSenderSharedSecret(aliceBundle, bobBundle);

    const bobSecret = await computeReceiverSharedSecret(
      bobBundle,
      initialMessage,
    );

    console.log("Sender Secret:", Buffer.from(aliceSecret).toString("hex"));
    console.log("Receiver Secret:", Buffer.from(bobSecret).toString("hex"));
    console.log(
      "Secrets match:",
      Buffer.from(aliceSecret).toString("hex") ===
        Buffer.from(bobSecret).toString("hex"),
    );
  } catch (error) {
    console.error("Test failed:", error);
  }
}

// --- Detailed Performance and Speed Tests ---
async function runAllTests(iterations = 10) {
  console.log("🚀 Starting performance & integrity tests...");

  const time = async <T,>(
    label: string,
    fn: () => Promise<T>,
    statsArray?: number[],
  ): Promise<T> => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    const duration = end - start;
    console.log(`${label}: ${duration.toFixed(2)} ms`);
    if (statsArray) statsArray.push(duration);
    return result;
  };

  const stats = {
    keyGen: [] as number[],
    sender: [] as number[],
    receiver: [] as number[],
  };

  for (let i = 0; i < iterations; i++) {
    console.log(`\n--- Iteration ${i + 1} ---`);

    const keyBundleA = await time(
      "KeyBundle generation (Sender)",
      () => generateKeyBundle(),
      stats.keyGen,
    );
    const keyBundleB = await time(
      "KeyBundle generation (Receiver)",
      () => generateKeyBundle(),
      stats.keyGen,
    );

    const { sharedSecret: secretA, initialMessage } = await time(
      "Sender shared secret (Sender)",
      () => computeSenderSharedSecret(keyBundleA, keyBundleB),
      stats.sender,
    );

    const secretB = await time(
      "Receiver shared secret (Receiver)",
      () => computeReceiverSharedSecret(keyBundleB, initialMessage),
      stats.receiver,
    );

    if (!Buffer.from(secretA).equals(Buffer.from(secretB))) {
      throw new Error(`❌ Shared secret mismatch at iteration ${i + 1}`);
    }
  }

  console.log(`\n✅ All ${iterations} iterations passed successfully`);

  const average = (arr: number[]) =>
    (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2);

  console.log("\n📊 --- Average Timing Summary ---");
  console.log(
    `KeyBundle generation (avg per bundle): ${average(stats.keyGen)} ms`,
  );
  console.log(`Sender shared secret computation: ${average(stats.sender)} ms`);
  console.log(
    `Receiver shared secret computation: ${average(stats.receiver)} ms`,
  );
}

// runAllTests();
// testProtocol();
testProtocol();

export async function main() {
  // Ініціалізація
  const stateSender: State = {} as State;
  const stateReceiver: State = {} as State;
  const SK = sodium.randombytes_buf(32); // Загальний секрет (наприклад, від X3DH)
  const bobKeyPair = Crypto.generateDH();

  console.log("Ініціалізація відправника:");
  console.log("Секретний ключ відправника:", sodium.to_base64(SK));
  console.log(
    "Публічний ключ приймача:",
    sodium.to_base64(bobKeyPair.publicKey),
  );

  // Ініціалізуємо стани ратчету
  await ratchetInitSender(stateSender, SK, bobKeyPair.publicKey);
  ratchetInitReceiver(stateReceiver, SK, bobKeyPair);

  const AD = Buffer.from("ДодатковіДані");

  // A1 → B
  const { header: h1, ciphertext: c1 } = ratchetEncrypt(
    stateSender,
    "Привіт, Боб! Як справи? 😉",
    AD,
  );
  const m1 = ratchetDecrypt(stateReceiver, h1, c1, AD);
  console.log("\n--- A1 → B ---");
  console.log(
    "Зашифроване (h1, c1):",
    sodium.to_base64(h1),
    sodium.to_base64(c1),
  );
  console.log("Розшифроване (B ← A1):", m1);

  // B1 → A
  const { header: h2, ciphertext: c2 } = ratchetEncrypt(
    stateReceiver,
    "Привіт, Алиса! Все ок, у тебе як? 😎",
    AD,
  );
  const m2 = ratchetDecrypt(stateSender, h2, c2, AD);
  console.log("\n--- B1 → A ---");
  console.log(
    "Зашифроване (h2, c2):",
    sodium.to_base64(h2),
    sodium.to_base64(c2),
  );
  console.log("Розшифроване (A ← B1):", m2);

  // A2 → B
  const { header: h3, ciphertext: c3 } = ratchetEncrypt(
    stateSender,
    "Як там у тебе? Щось цікаве є? 😊",
    AD,
  );
  const m3 = ratchetDecrypt(stateReceiver, h3, c3, AD);
  console.log("\n--- A2 → B ---");
  console.log(
    "Зашифроване (h3, c3):",
    sodium.to_base64(h3),
    sodium.to_base64(c3),
  );
  console.log("Розшифроване (B ← A2):", m3);

  // B2 → A
  const { header: h4, ciphertext: c4 } = ratchetEncrypt(
    stateReceiver,
    "Все добре, ти як? Може, поговоримо ще трохи? 😁",
    AD,
  );
  const m4 = ratchetDecrypt(stateSender, h4, c4, AD);
  console.log("\n--- B2 → A ---");
  console.log(
    "Зашифроване (h4, c4):",
    sodium.to_base64(h4),
    sodium.to_base64(c4),
  );
  console.log("Розшифроване (A ← B2):", m4);

  // A3 → B
  const { header: h5, ciphertext: c5 } = ratchetEncrypt(
    stateSender,
    "Теж нормально! Продовжую робити цей Double Ratchet 😁💪",
    AD,
  );
  const m5 = ratchetDecrypt(stateReceiver, h5, c5, AD);
  console.log("\n--- A3 → B ---");
  console.log(
    "Зашифроване (h5, c5):",
    sodium.to_base64(h5),
    sodium.to_base64(c5),
  );
  console.log("Розшифроване (B ← A3):", m5);

  // --- емітуємо затримане повідомлення ---
  // B3 → A, B4 → A, але B3 затримується

  const { header: h6b4, ciphertext: c6b4 } = ratchetEncrypt(
    stateReceiver,
    "B4: Ого, це вражаюче! 😲",
    AD,
  ); // відправляється першим
  const { header: h6b3, ciphertext: c6b3 } = ratchetEncrypt(
    stateReceiver,
    "B3: Молодець! Чудова робота! 👏",
    AD,
  ); // але буде доставлено пізніше

  // A ← B4 (до того, як отримали B3)
  const m6b4 = ratchetDecrypt(stateSender, h6b4, c6b4, AD);
  console.log("\n--- A ← B4 ---");
  console.log(
    "Зашифроване (h6b4, c6b4):",
    sodium.to_base64(h6b4),
    sodium.to_base64(c6b4),
  );
  console.log("Розшифроване (A ← B4):", m6b4);

  // A ← B3 (пізніше, out-of-order)
  const m6b3 = ratchetDecrypt(stateSender, h6b3, c6b3, AD);
  console.log("\n--- A ← B3 (затримка) ---");
  console.log(
    "Зашифроване (h6b3, c6b3):",
    sodium.to_base64(h6b3),
    sodium.to_base64(c6b3),
  );
  console.log("Розшифроване (A ← B3):", m6b3);

  console.log(stateSender);
  console.log(stateReceiver);
}

export async function benchmark() {
  await sodium.ready;
  console.log("Running Double Ratchet benchmarks...");

  const iterations = 1000;
  const messageSize = 1024; // 1KB
  const message = "A".repeat(messageSize);
  const AD = Buffer.from("AssociatedData");

  // Setup
  const aliceState: State = {} as State;
  const bobState: State = {} as State;
  const SK = sodium.randombytes_buf(32);
  const bobKeyPair = Crypto.generateDH();

  await ratchetInitSender(aliceState, SK, bobKeyPair.publicKey);
  await ratchetInitReceiver(bobState, SK, bobKeyPair);

  // Benchmark encryption
  console.log(`\nEncryption Benchmark (${iterations} iterations):`);
  const encryptStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    ratchetEncrypt(aliceState, message, AD);
  }
  const encryptEnd = performance.now();
  const encryptTime = encryptEnd - encryptStart;
  console.log(`Total time: ${encryptTime.toFixed(2)}ms`);
  console.log(
    `Average per operation: ${(encryptTime / iterations).toFixed(2)}ms`,
  );
  console.log(
    `Operations per second: ${((1000 * iterations) / encryptTime).toFixed(2)}`,
  );

  // Reset states
  ratchetInitSender(aliceState, SK, bobKeyPair.publicKey);
  ratchetInitReceiver(bobState, SK, bobKeyPair);

  // Pre-generate messages for decryption benchmark
  const headers: Uint8Array[] = [];
  const ciphertexts: Uint8Array[] = [];
  for (let i = 0; i < iterations; i++) {
    const { header, ciphertext } = ratchetEncrypt(aliceState, message, AD);
    headers.push(header);
    ciphertexts.push(ciphertext);
  }

  // Reset Receiver's state
  ratchetInitReceiver(bobState, SK, bobKeyPair);

  // Benchmark decryption
  console.log(`\nDecryption Benchmark (${iterations} iterations):`);
  const decryptStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    ratchetDecrypt(bobState, headers[i], ciphertexts[i], AD);
  }
  const decryptEnd = performance.now();
  const decryptTime = decryptEnd - decryptStart;
  console.log(`Total time: ${decryptTime.toFixed(2)}ms`);
  console.log(
    `Average per operation: ${(decryptTime / iterations).toFixed(2)}ms`,
  );
  console.log(
    `Operations per second: ${((1000 * iterations) / decryptTime).toFixed(2)}`,
  );

  // Benchmark DH ratchet steps
  console.log("\nDH Ratchet Step Benchmark (100 iterations):");
  const dhIterations = 100;

  const aliceStateDH: State = {} as State;
  const bobStateDH: State = {} as State;
  ratchetInitSender(aliceStateDH, SK, bobKeyPair.publicKey);
  ratchetInitReceiver(bobStateDH, SK, bobKeyPair);

  const dhStart = performance.now();
  for (let i = 0; i < dhIterations; i++) {
    // Sender sends to Receiver
    const { header: h1, ciphertext: c1 } = ratchetEncrypt(
      aliceStateDH,
      "A→B",
      AD,
    );
    ratchetDecrypt(bobStateDH, h1, c1, AD);

    // Receiver sends to Sender (triggers DH ratchet)
    const { header: h2, ciphertext: c2 } = ratchetEncrypt(
      bobStateDH,
      "B→A",
      AD,
    );
    ratchetDecrypt(aliceStateDH, h2, c2, AD);
  }
  const dhEnd = performance.now();
  const dhTime = dhEnd - dhStart;
  console.log(`Total time: ${dhTime.toFixed(2)}ms`);
  console.log(
    `Average per DH ratchet: ${(dhTime / dhIterations).toFixed(2)}ms`,
  );
}

main();
benchmark();
export default AdvancedEncryptionPage;
