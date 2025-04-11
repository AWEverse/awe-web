import React, { useState } from "react";
import nacl from "tweetnacl";
import { Buffer } from "buffer";
import useModalContext from "@/composers/modals/utils/hooks/useModalComposer";
import {
  computeReceiverSharedSecret,
  computeSenderSharedSecret,
  generateKeyBundle,
} from "@/lib/core/public/cryptography/X3DH";

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

  // Generate key pairs for Alice and Bob
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
            <strong>Alice's Public Key:</strong>{" "}
            {publicKeyToString(aliceKeys.publicKey)}
          </p>
          <p>
            <strong>Bob's Public Key:</strong>{" "}
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

    console.log("Alice Secret:", Buffer.from(aliceSecret).toString("hex"));
    console.log("Bob Secret:", Buffer.from(bobSecret).toString("hex"));
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
      "KeyBundle generation (Alice)",
      () => generateKeyBundle(),
      stats.keyGen,
    );
    const keyBundleB = await time(
      "KeyBundle generation (Bob)",
      () => generateKeyBundle(),
      stats.keyGen,
    );

    const { sharedSecret: secretA, initialMessage } = await time(
      "Sender shared secret (Alice)",
      () => computeSenderSharedSecret(keyBundleA, keyBundleB),
      stats.sender,
    );

    const secretB = await time(
      "Receiver shared secret (Bob)",
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

runAllTests();
testProtocol();

export default AdvancedEncryptionPage;
