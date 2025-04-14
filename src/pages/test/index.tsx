import React, { useState } from "react";
import nacl from "tweetnacl";
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

const styles = {
  container: {
    overflow: "scroll",
    height: "100dvh",
    maxWidth: "800px",
    margin: "0 auto",
    padding: "30px",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f5f5f5",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  title: {
    color: "#333",
    marginBottom: "20px",
    textAlign: "center" as const,
  },
  input: {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "16px",
    backgroundColor: "black",
  },
  buttonContainer: {
    display: "flex",
    gap: "10px",
    margin: "15px 0",
  },
  button: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
    transition: "background-color 0.3s",
  },
  encryptButton: {
    backgroundColor: "#4CAF50",
    color: "white",
  },
  decryptButton: {
    backgroundColor: "#2196F3",
    color: "white",
  },
  toggleButton: {
    backgroundColor: "#666",
    color: "white",
  },
  output: {
    padding: "15px",
    backgroundColor: "black",
    borderRadius: "4px",
    margin: "10px 0",
    wordBreak: "break-all" as const,
    border: "1px solid #eee",
  },
  keyDisplay: {
    padding: "15px",
    backgroundColor: "black",
    borderRadius: "4px",
    margin: "10px 0",
    fontSize: "14px",
  },
};

const AdvancedEncryptionPage: React.FC = () => {
  const [message, setMessage] = useState("");
  const [encryptedMessage, setEncryptedMessage] = useState("");
  const [decryptedMessage, setDecryptedMessage] = useState("");
  const [showKeys, setShowKeys] = useState(false);

  // Generate key pairs for Sender and Receiver
  const [aliceKeys] = useState(() => nacl.box.keyPair());
  const [bobKeys] = useState(() => nacl.box.keyPair());

  const handleEncrypt = () => {
    try {
      const nonce = nacl.randomBytes(nacl.box.nonceLength);
      const messageUint8 = new TextEncoder().encode(message);
      const encrypted = nacl.box(
        messageUint8,
        nonce,
        bobKeys.publicKey,
        aliceKeys.secretKey,
      );

      // Combine nonce and encrypted message for easier decryption
      const fullMessage = new Uint8Array(nonce.length + encrypted.length);
      fullMessage.set(nonce);
      fullMessage.set(encrypted, nonce.length);

      const encryptedBase64 = Buffer.from(fullMessage).toString("base64");
      setEncryptedMessage(encryptedBase64);
      setDecryptedMessage("");
    } catch (error) {
      console.error("Encryption error:", error);
      setEncryptedMessage("Error during encryption");
    }
  };

  const handleDecrypt = () => {
    try {
      const fullMessage = Buffer.from(encryptedMessage, "base64");
      const nonce = fullMessage.subarray(0, nacl.box.nonceLength);
      const encrypted = fullMessage.subarray(nacl.box.nonceLength);

      const decrypted = nacl.box.open(
        encrypted,
        nonce,
        aliceKeys.publicKey,
        bobKeys.secretKey,
      );

      if (!decrypted) {
        setDecryptedMessage("Decryption failed");
        return;
      }

      const decryptedText = new TextDecoder().decode(decrypted);
      setDecryptedMessage(decryptedText);
    } catch (error) {
      console.error("Decryption error:", error);
      setDecryptedMessage("Error during decryption");
    }
  };

  const publicKeyToString = (key: Uint8Array) =>
    Buffer.from(key).toString("hex");
  const secretKeyToString = (key: Uint8Array) =>
    Buffer.from(key).toString("hex");

  const { openModal, closeModal } = useModalContext();

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Advanced Encryption Demo</h2>

      <button onClick={() => openModal("calendar", {}, 0)}>
        Open Calendar
      </button>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter your secret message"
        style={styles.input}
      />

      <div style={styles.buttonContainer}>
        <button
          onClick={handleEncrypt}
          style={{ ...styles.button, ...styles.encryptButton }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#45a049")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#4CAF50")
          }
        >
          Encrypt Message
        </button>
        <button
          onClick={handleDecrypt}
          style={{ ...styles.button, ...styles.decryptButton }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#1e88e5")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#2196F3")
          }
          disabled={!encryptedMessage}
        >
          Decrypt Message
        </button>
        <button
          onClick={() => setShowKeys(!showKeys)}
          style={{ ...styles.button, ...styles.toggleButton }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#555")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#666")}
        >
          {showKeys ? "Hide" : "Show"} Keys
        </button>
      </div>

      {showKeys && (
        <div style={styles.keyDisplay}>
          <p>
            <strong>Sender's Public Key:</strong>{" "}
            {publicKeyToString(aliceKeys.publicKey)}
          </p>
          <p>
            <strong>Receiver's Public Key:</strong>{" "}
            {publicKeyToString(bobKeys.publicKey)}
          </p>
        </div>
      )}

      {encryptedMessage && (
        <div style={styles.output}>
          <strong>Encrypted Message:</strong>
          <p>{encryptedMessage}</p>
        </div>
      )}

      {decryptedMessage && (
        <div style={styles.output}>
          <strong>Decrypted Message:</strong>
          <p>{decryptedMessage}</p>
        </div>
      )}
    </div>
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

export async function main() {
  // Инициализация
  const stateSender: State = {} as State;
  const stateReceiver: State = {} as State;
  const SK = sodium.randombytes_buf(32); // Общий секрет (например, от X3DH)
  const bobKeyPair = Crypto.generateDH();

  console.log("Sender Initialization:");
  console.log("Sender Secret Key:", sodium.to_base64(SK));
  console.log("Receiver Public Key:", sodium.to_base64(bobKeyPair.publicKey));

  // Initialize the ratchet states
  ratchetInitSender(stateSender, SK, bobKeyPair.publicKey);
  ratchetInitReceiver(stateReceiver, SK, bobKeyPair);

  const AD = Buffer.from("AssociatedData");

  // A1 → B
  const { header: h1, ciphertext: c1 } = ratchetEncrypt(
    stateSender,
    "Привет, Боб!",
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
    "Привет, Алиса!",
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
    "Как дела?",
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
    "Всё хорошо, ты как?",
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
    "Тоже отлично. Пишу Double Ratchet",
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

  // --- эмуляция отложенного сообщения ---
  // B3 → A, B4 → A, но B3 задерживается

  const { header: h6b4, ciphertext: c6b4 } = ratchetEncrypt(
    stateReceiver,
    "B4: Это впечатляет!",
    AD,
  ); // отправляется первым
  const { header: h6b3, ciphertext: c6b3 } = ratchetEncrypt(
    stateReceiver,
    "B3: Отличная работа!",
    AD,
  ); // но будет доставлено позже

  // A ← B4 (прежде, чем получен B3)
  const m6b4 = ratchetDecrypt(stateSender, h6b4, c6b4, AD);
  console.log("\n--- A ← B4 ---");
  console.log(
    "Encrypted (h6b4, c6b4):",
    sodium.to_base64(h6b4),
    sodium.to_base64(c6b4),
  );
  console.log("Decrypted (A ← B4):", m6b4);

  // A ← B3 (позже, out-of-order)
  const m6b3 = ratchetDecrypt(stateSender, h6b3, c6b3, AD);
  console.log("\n--- A ← B3 (задержка) ---");
  console.log(
    "Encrypted (h6b3, c6b3):",
    sodium.to_base64(h6b3),
    sodium.to_base64(c6b3),
  );
  console.log("Decrypted (A ← B3):", m6b3);
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

  ratchetInitSender(aliceState, SK, bobKeyPair.publicKey);
  ratchetInitReceiver(bobState, SK, bobKeyPair);

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
