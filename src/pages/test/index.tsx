import React, { useState } from "react";
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
import Image from "@/shared/ui/Image";

// Utility to convert Uint8Array to hex string
const toHex = (array: Uint8Array): string => {
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

// Utility to compare two Uint8Arrays
const uint8ArrayEquals = (a: Uint8Array, b: Uint8Array): boolean => {
  if (a.length !== b.length) return false;
  return a.every((val, i) => val === b[i]);
};

const AdvancedEncryptionPage: React.FC = () => {
  const { openModal, closeModal } = useModalContext();

  return (
    <>
      <button onClick={() => openModal("calendar", {}, 0)}>
        Open Calendar
      </button>
      <TimePicker />

      <Image
        src="/img/primary-background.jpg"
        alt="Sunset over mountain range"
        title="Mountain Landscape"
        width={800}
        height={600}
        aspectRatio={4 / 3}
        loading="eager"
        fetchPriority="high"
        placeholderType="shimmer"
        placeholderColor="#ddd"
        borderRadius="8px"
        srcSet="/img/primary-background.jpg 480w, /img/primary-background.jpg 800w,/img/primary-background.jpg 1200w"
        sizes="(max-width: 768px) 100vw, 800px"
        onError={() => console.error("Image failed")}
        onRetry={(attempt) => console.log(`Attempt ${attempt}`)}
      />
    </>
  );
};

// Test function
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

    console.log("Sender Secret:", toHex(aliceSecret));
    console.log("Receiver Secret:", toHex(bobSecret));
    console.log("Secrets match:", uint8ArrayEquals(aliceSecret, bobSecret));
  } catch (error) {
    console.error("Test failed:", error);
  }
}

// Detailed Performance and Speed Tests
async function runAllTests(iterations: number = 10) {
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

    if (!uint8ArrayEquals(secretA, secretB)) {
      throw new Error(`❌ Shared secret mismatch at iteration ${i + 1}`);
    }
  }

  console.log(`\n✅ All ${iterations} iterations passed successfully`);

  const average = (arr: number[]): string =>
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
  // Initialization
  const stateSender: State = {} as State;
  const stateReceiver: State = {} as State;
  const SK = sodium.randombytes_buf(32); // Shared secret (e.g., from X3DH)
  const bobKeyPair = Crypto.generateDH();

  console.log("Sender initialization:");
  console.log("Sender secret key:", sodium.to_base64(SK));
  console.log("Receiver public key:", sodium.to_base64(bobKeyPair.publicKey));

  // Initialize ratchet states
  await ratchetInitSender(stateSender, SK, bobKeyPair.publicKey);
  await ratchetInitReceiver(stateReceiver, SK, bobKeyPair);

  const AD = new TextEncoder().encode("AssociatedData");

  // A1 → B
  const { header: h1, ciphertext: c1 } = ratchetEncrypt(
    stateSender,
    "Hello, Bob! How are you? 😉",
    AD,
  );
  const m1 = ratchetDecrypt(stateReceiver, h1, c1, AD);
  console.log("\n--- A1 → B ---");
  console.log(
    "Encrypted (h1, c1):",
    sodium.to_base64(h1),
    sodium.to_base64(c1),
  );
  console.log("Decrypted (B ← A1):", m1);

  // B1 → A
  const { header: h2, ciphertext: c2 } = ratchetEncrypt(
    stateReceiver,
    "Hi, Alice! I'm good, you? 😎",
    AD,
  );
  const m2 = ratchetDecrypt(stateSender, h2, c2, AD);
  console.log("\n--- B1 → A ---");
  console.log(
    "Encrypted (h2, c2):",
    sodium.to_base64(h2),
    sodium.to_base64(c2),
  );
  console.log("Decrypted (A ← B1):", m2);

  // A2 → B
  const { header: h3, ciphertext: c3 } = ratchetEncrypt(
    stateSender,
    "What's up? Anything interesting? 😊",
    AD,
  );
  const m3 = ratchetDecrypt(stateReceiver, h3, c3, AD);
  console.log("\n--- A2 → B ---");
  console.log(
    "Encrypted (h3, c3):",
    sodium.to_base64(h3),
    sodium.to_base64(c3),
  );
  console.log("Decrypted (B ← A2):", m3);

  // B2 → A
  const { header: h4, ciphertext: c4 } = ratchetEncrypt(
    stateReceiver,
    "All good here! Wanna chat more? 😁",
    AD,
  );
  const m4 = ratchetDecrypt(stateSender, h4, c4, AD);
  console.log("\n--- B2 → A ---");
  console.log(
    "Encrypted (h4, c4):",
    sodium.to_base64(h4),
    sodium.to_base64(c4),
  );
  console.log("Decrypted (A ← B2):", m4);

  // A3 → B
  const { header: h5, ciphertext: c5 } = ratchetEncrypt(
    stateSender,
    "Doing great! Still working on this Double Ratchet 😁💪",
    AD,
  );
  const m5 = ratchetDecrypt(stateReceiver, h5, c5, AD);
  console.log("\n--- A3 → B ---");
  console.log(
    "Encrypted (h5, c5):",
    sodium.to_base64(h5),
    sodium.to_base64(c5),
  );
  console.log("Decrypted (B ← A3):", m5);

  // Simulate delayed message
  // B3 → A, B4 → A, but B3 is delayed
  const { header: h6b4, ciphertext: c6b4 } = ratchetEncrypt(
    stateReceiver,
    "B4: Wow, that's impressive! 😲",
    AD,
  ); // Sent first
  const { header: h6b3, ciphertext: c6b3 } = ratchetEncrypt(
    stateReceiver,
    "B3: Great job! Well done! 👏",
    AD,
  ); // Delivered later

  // A ← B4 (before B3)
  const m6b4 = ratchetDecrypt(stateSender, h6b4, c6b4, AD);
  console.log("\n--- A ← B4 ---");
  console.log(
    "Encrypted (h6b4, c6b4):",
    sodium.to_base64(h6b4),
    sodium.to_base64(c6b4),
  );
  console.log("Decrypted (A ← B4):", m6b4);

  // A ← B3 (later, out-of-order)
  const m6b3 = ratchetDecrypt(stateSender, h6b3, c6b3, AD);
  console.log("\n--- A ← B3 (delayed) ---");
  console.log(
    "Encrypted (h6b3, c6b3):",
    sodium.to_base64(h6b3),
    sodium.to_base64(c6b3),
  );
  console.log("Decrypted (A ← B3):", m6b3);

  console.log(stateSender);
  console.log(stateReceiver);
}

export async function benchmark() {
  await sodium.ready;
  console.log("Running Double Ratchet benchmarks...");

  const iterations = 1000;
  const messageSize = 1024; // 1KB
  const message = "A".repeat(messageSize);
  const AD = new TextEncoder().encode("AssociatedData");

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
  await ratchetInitSender(aliceState, SK, bobKeyPair.publicKey);
  await ratchetInitReceiver(bobState, SK, bobKeyPair);

  // Pre-generate messages for decryption benchmark
  const headers: Uint8Array[] = [];
  const ciphertexts: Uint8Array[] = [];
  for (let i = 0; i < iterations; i++) {
    const { header, ciphertext } = ratchetEncrypt(aliceState, message, AD);
    headers.push(header);
    ciphertexts.push(ciphertext);
  }

  // Reset Receiver's state
  await ratchetInitReceiver(bobState, SK, bobKeyPair);

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
  await ratchetInitSender(aliceStateDH, SK, bobKeyPair.publicKey);
  await ratchetInitReceiver(bobStateDH, SK, bobKeyPair);

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
