# 📄 Device ID Protocol v3.0 — Specification

## Document Information
- **Version**: 3.0
- **Original Author**: Andrii Volynets (v1.0)
- **Previous Revision**: AWE Industries (v2.0)
- **Current Revision**: May 6, 2025

## 1. Executive Summary

The Device ID Protocol provides a **cross-platform**, **privacy-preserving**, and **tamper-resistant** mechanism for generating and verifying device identifiers. This specification leverages established cryptographic primitives to deliver a robust solution for device authentication without relying on personally identifiable information (PII).

### 1.1 Core Principles

| Principle | Description |
|-----------|-------------|
| **Uniqueness** | Each conforming device produces a cryptographically distinct identifier |
| **Stability** | Identifiers remain consistent despite routine system updates |
| **Privacy** | No personally identifiable information (PII) is collected or transmitted |
| **Security** | Strong protections against impersonation and device cloning |
| **Auditability** | Complete lifecycle management with comprehensive event logs |
| **Recovery** | Defined processes for key recovery and identifier restoration |

### 1.2 Target Use Cases

- **Authentication and access control**
  - Secure authentication in mobile applications
  - Support for multi-factor authentication (MFA)
  - Device authentication when accessing corporate systems
  - Enhanced identity verification for high-risk operations
- **IoT and distributed systems**
  - Registration and identification of devices in IoT networks
  - Authentication of devices in distributed infrastructures
  - Secure device registration in multi-tenant architectures
- **Financial security and fraud prevention**
  - Detection and prevention of fraudulent activities in fintech environments
  - Protection of payment transactions and e-commerce operations
  - Issuance of temporary or enhanced access to high-risk functions
- **Privacy-preserving analytics**
  - Identification of devices without revealing user identity
  - Collection of statistical data while preserving device confidentiality

## 2. Protocol Overview

### 2.1 Architectural Components

The Device ID Protocol consists of four primary components:

1. **Device Key Pair (DKP)**: An Ed25519 asymmetric key pair stored in secure hardware
2. **Device Fingerprint (FP)**: A structured collection of non-PII device attributes
3. **Device ID (DID)**: A cryptographic digest of the device fingerprint
4. **Attestation Token (AT)**: Platform-specific evidence of device authenticity

### 2.2 Workflow Summary

```mermaid
graph TD
    A[Device Initialization] -->|Generate Key Pair| B[Key Generation]
    B -->|Store in TEE/SE| C[Protected Storage]
    A -->|Collect Metadata| D[Data Collection]
    D -->|Canonicalize| E[Fingerprint Computation]
    E -->|Hash| F[Device ID Generation]
    F -->|Sign| G[Signature Generation]
    G -->|Send| H[Registration]
    H -->|Verify| I[Server Validation]
    I -->|Store| J[Device Registry]
```

## 3. Cryptographic Foundations

### 3.1 Notation and Symbols

For cryptographic operations, we use the following notation:

- $DID$: Device Identifier (final output)
- $FP$: Device Fingerprint (metadata hash)
- $(sk_{device}, pk_{device})$: Device Key Pair (private, public)
- $\sigma$: Digital signature
- $H(\cdot)$: Cryptographic hash function
- $S(\cdot, \cdot)$: Signature function
- $V(\cdot, \cdot, \cdot)$: Verification function
- $r$: Random salt (32 bytes)
- $AT$: Attestation Token
- $C$: Context identifier
- $DID_C$: Context-derived Device Identifier

### 3.2 Core Functions

1. **Key Generation:** $(sk_{device}, pk_{device}) \leftarrow KeyGen(1^\lambda)$ where $\lambda$ is security parameter
2. **Fingerprint Computation:** $FP = Encode(M \mathbin\Vert r)$ where $\mathbin\Vert$ denotes concatenation
3. **Device ID Generation:** $DID = H(FP)$
4. **Signature Generation:** $\sigma = S(sk_{device}, DID)$
5. **Signature Verification:** $V(pk_{device}, DID, \sigma) \in \{true, false\}$

### 3.3 Cryptographic Primitives

| Component | Algorithm | Standard | Security Level |
|-----------|-----------|----------|---------------|
| Key Generation | Ed25519 | RFC 8032 | 128-bit |
| Hash Function | BLAKE3 | BLAKE3 Spec | 256-bit |
| Alternative Hash | SHA-256 | FIPS 180-4 | 128-bit |
| Data Encoding | JCS | RFC 8785 | N/A |
| Alternative Encoding | CBOR | RFC 8949 | N/A |
| Key Derivation | HKDF | RFC 5869 | 256-bit |
| Post-Quantum Option | Dilithium | NIST PQC | 128-bit quantum |

## 4. Protocol Components

### 4.1 Device Key Pair (DKP)

The foundation of the protocol is an Ed25519 asymmetric key pair:

$$
(sk_{device}, pk_{device}) \leftarrow \text{Ed25519\_KeyGen}()
$$

**Security Requirements:**
- Private key material **MUST** be stored in hardware-backed secure storage:
  - Android: Android Keystore with StrongBox when available
  - iOS: Secure Enclave
  - Windows: TPM-backed Windows Hello
  - Linux: TPM 2.0 or HSM
- Key usage **MUST** be gated by device authentication (biometric, PIN, or password)
- Key **MUST NOT** be exportable from secure storage

### 4.2 Device Fingerprint (FP)

A structured collection of device attributes that does not contain PII:

```json
{
  "platform": "String",          // e.g., "android", "ios", "windows"
  "os_version": {
    "major": "Integer",          // Semantic versioning
    "minor": "Integer"
  },
  "app_version": {
    "major": "Integer",
    "minor": "Integer"
  },
  "install_ts": "Integer",       // Installation timestamp (seconds since epoch)
  "random_salt": "ByteString",   // 32 bytes of cryptographically secure randomness
  "device_model": "String",      // Optional, for UI display only
  "protocol_version": "3.0",     // Required field, updated for current version
  "security_level": "String"     // e.g., "strongbox", "tee", "software"
}
```

### 4.3 Device ID (DID)

The cryptographic digest of the fingerprint:

$$
DID_{raw} = H(FP)
$$
$$
DID = \text{base64url}(DID_{raw})
$$

Where $H$ is either SHA-256 or BLAKE3 hash function.

### 4.4 Device Signature ($\sigma$)

Ed25519 signature over the raw device ID:

$$
\sigma = S(sk_{device}, DID_{raw})
$$

Verification:

$$
V(pk_{device}, DID_{raw}, \sigma) = true
$$

### 4.5 Attestation Token (AT)

Platform-specific evidence of device authenticity:

* **Android:** SafetyNet or Play Integrity API JWT
* **iOS:** DeviceCheck or App Attest JWT
* **Windows:** TPM attestation or Windows Hello
* **Custom Hardware:** Vendor-specific attestation mechanism

## 5. Protocol Lifecycle

### 5.1 Initial Registration

```mermaid
sequenceDiagram
    participant Device
    participant Server

    Device->>Device: Generate (sk_device, pk_device)
    Device->>Device: Generate random_salt
    Device->>Device: Collect device metadata
    Device->>Device: Compute FP = Encode(metadata)
    Device->>Device: Compute DID = H(FP)
    Device->>Device: Generate σ = Sign(sk_device, DID)
    Device->>Device: Request AT from platform
    Device->>Server: Send (DID, σ, pk_device, metadata, AT)
    Server->>Server: Verify σ using pk_device
    Server->>Server: Verify AT with platform vendor
    Server->>Server: Store (DID, pk_device, metadata)
    Server->>Device: Registration confirmation
```

### 5.2 Authentication Flow

1. **Device** retrieves stored $sk_{device}$ and computes:
   * $FP = Encode(metadata)$
   * $DID = H(FP)$
   * $\sigma = S(sk_{device}, DID || nonce)$ where $nonce$ is server-provided

2. **Device** sends $(DID, \sigma, nonce)$ to server

3. **Server** verifies:
   * $V(pk_{device}, DID || nonce, \sigma) = true$
   * $DID$ matches a registered device
   * $nonce$ is valid and not reused

### 5.3 Salt Rotation

Salt rotation occurs every 90 days or according to server policy:

1. **Server** sends rotation request with timestamp $t_{rot}$
2. **Device** generates new $r'$ and computes:
   * $FP' = Encode(metadata, r')$
   * $DID' = H(FP')$
   * $\sigma' = S(sk_{device}, DID' || t_{rot})$
3. **Device** sends $(DID', \sigma', pk_{device}, metadata, r')$ to server
4. **Server** verifies $\sigma'$ and updates records

Mathematical relationship:
$$
P(DID = DID') \approx 0 \text{ when } r \neq r'
$$

### 5.4 Key Rotation

For enhanced security, the device key pair may be rotated:

1. **Device** generates new key pair $(sk_{device}', pk_{device}')$
2. **Device** signs link between old and new keys:
   $$\sigma_{link} = S(sk_{device}, pk_{device}' || t_{rot})$$
3. **Device** sends $(DID, pk_{device}', \sigma_{link}, t_{rot})$ to server
4. **Server** verifies $\sigma_{link}$ using $pk_{device}$ and updates to $pk_{device}'$

## 6. Implementation Guidelines

### 6.1 Platform-Specific Storage

| Platform | Secure Storage | Property Protection |
|----------|----------------|---------------------|
| Android | Android Keystore / StrongBox | `setUserAuthenticationRequired(true)` |
| iOS | Secure Enclave | `kSecAttrAccessibleWhenPasscodeSetThisDeviceOnly` |
| Windows | TPM / Windows Hello | `CRYPTOAPI_BLOB` with user authentication |
| Linux | TPM2.0 / PKCS#11 | Hardware token with PIN protection |

### 6.2 Canonical Encoding

To ensure consistent hashing across platforms:

* **JSON:** Use RFC 8785 JSON Canonicalization Scheme (JCS)
* **Binary:** Use CBOR in canonical mode (RFC 8949)

Example encoding process:
```
metadata = {platform: "android", os_version: {major: 14, minor: 0}, ...}
canonical = JCS_Encode(metadata)
// Result: fixed byte representation regardless of field order
```

### 6.3 Collision Resistance

With proper implementation, collision probability is negligible:

$$
P(DID_1 = DID_2 | FP_1 \neq FP_2) \approx \frac{1}{2^{256}}
$$

For context, this is approximately 1 in 10^77, far lower than cosmic ray bit-flip probability.

## 7. Security Analysis

### 7.1 Threat Model

| Threat Vector | Description | Security Level |
|---------------|-------------|---------------|
| Network Snooping | Passive observation of DID traffic | **Strong** |
| Device Cloning | Copying device identity to another device | **Strong** |
| Key Extraction | Attempts to extract $sk_{device}$ | **Strong** (HW-backed) / **Moderate** (SW-only) |
| Metadata Manipulation | Altering device properties to forge identity | **Strong** |
| Attestation Forgery | Falsifying platform attestation | **Strong** (with attestation) / **Weak** (without) |
| Replay Attacks | Reusing valid authentication messages | **Strong** (with nonce) |
| Quantum Attacks | Future quantum computer threats | **Moderate** (need PQ extension) |

### 7.2 Security Proofs

Assuming secure primitives, the protocol achieves:

1. **Unforgeability:** Without $sk_{device}$, an adversary cannot produce valid $\sigma$ for a given $DID$
2. **Non-transferability:** $sk_{device}$ cannot be extracted from secure hardware
3. **Unlinkability:** Different $DID$ values (after salt rotation) cannot be linked without server cooperation

### 7.3 Defense-in-Depth Measures

1. **Mandatory attestation** for high-security operations
2. **Rate limiting** on registration and authentication endpoints
3. **Anomaly detection** for unusual device behavior
4. **Geo-fencing** to detect impossible travel patterns
5. **Revocation lists** for compromised devices

## 8. Privacy Considerations

### 8.1 Data Minimization

The protocol adheres to privacy-by-design principles:

* No collection of hardware identifiers (IMEI, MAC address)
* No tracking of IP addresses within the protocol
* No geolocation or user demographic information
* No persistent user identifiers in the DID

### 8.2 Salt Rotation Impact

Regular salt rotation provides pseudonymity properties:

$$
\forall i \neq j: r_i \neq r_j \implies DID_i \neq DID_j
$$

This prevents long-term tracking across services if the same protocol is used independently.

### 8.3 Compliance

The protocol supports compliance with:

* GDPR (EU)
* CCPA/CPRA (California)
* LGPD (Brazil)
* PIPL (China)

Through its data minimization approach and support for right-to-be-forgotten via device revocation.

## 9. API Specifications

### 9.1 Registration Endpoint

```http
POST /api/v3/device/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "device_id": "base64url(DID)",
  "signature": "base64url(σ)",
  "device_key": "base64url(pk_device)",
  "metadata": {
    "platform": "android",
    "os_version": {"major": 14, "minor": 1},
    "app_version": {"major": 2, "minor": 0},
    "install_ts": 1715000000,
    "random_salt": "base64url(32B)",
    "device_model": "Pixel 7",
    "protocol_version": "3.0",
    "security_level": "strongbox"
  },
  "attestation_token": "JWT"
}
```

**Response (Success):**
```json
{
  "status": "success",
  "registration_id": "uuid",
  "expiry": "ISO8601 timestamp"
}
```

### 9.2 Authentication Endpoint

```http
POST /api/v3/device/authenticate
Content-Type: application/json
```

**Request Body:**
```json
{
  "device_id": "base64url(DID)",
  "signature": "base64url(σ)",
  "nonce": "server_provided_nonce",
  "timestamp": 1715000123
}
```

**Response (Success):**
```json
{
  "status": "success",
  "session_token": "JWT",
  "expiry": "ISO8601 timestamp"
}
```

### 9.3 Salt Rotation Endpoint

```http
POST /api/v3/device/rotate-salt
Content-Type: application/json
```

**Request Body:**
```json
{
  "old_device_id": "base64url(DID)",
  "new_device_id": "base64url(DID')",
  "signature": "base64url(σ')",
  "metadata": {
    "platform": "android",
    "os_version": {"major": 14, "minor": 1},
    "app_version": {"major": 2, "minor": 0},
    "install_ts": 1715000000,
    "random_salt": "base64url(new_32B)",
    "device_model": "Pixel 7",
    "protocol_version": "3.0",
    "security_level": "strongbox"
  },
  "rotation_timestamp": 1715090000
}
```

### 9.4 Key Rotation Endpoint

```http
POST /api/v3/device/rotate-key
Content-Type: application/json
```

**Request Body:**
```json
{
  "device_id": "base64url(DID)",
  "new_device_key": "base64url(pk_device')",
  "link_signature": "base64url(σ_link)",
  "rotation_timestamp": 1715090000
}
```

**Response (Success):**
```json
{
  "status": "success",
  "expiry": "ISO8601 timestamp"
}
```

## 10. Extensions

### 10.1 Post-Quantum Resistance

Hybrid signature approach combining classical and post-quantum algorithms:

$$
\sigma_{hybrid} = (\sigma_{Ed25519}, \sigma_{Dilithium})
$$

Verification requires both signatures to be valid:

$$
V_{hybrid}(pk, m, \sigma_{hybrid}) = V_{Ed25519}(pk_{Ed25519}, m, \sigma_{Ed25519}) \land V_{Dilithium}(pk_{Dilithium}, m, \sigma_{Dilithium})
$$

### 10.2 Multi-Device Federation

Hierarchical identity structure where multiple devices can be linked:

$$
DID_{parent} \rightarrow \{DID_{child1}, DID_{child2}, ...\}
$$

With signature chain:

$$
\sigma_{link} = S(sk_{parent}, DID_{child} || t_{link})
$$

### 10.3 Offline Validation

Distributed revocation lists using signed Merkle trees:

$$
RevList = \{DID_1, DID_2, ..., DID_n\}
$$

$$
MerkleRoot = H(H(DID_1 || DID_2) || H(DID_3 || DID_4) || ...)
$$

$$
\sigma_{revlist} = S(sk_{server}, MerkleRoot || t_{issue})
$$

## 11. Reference Implementation

### 11.1 Client SDK (Pseudocode)

```typescript
class DeviceIdProtocol {
  constructor(options: {
    platform: string;
    appVersion: {major: number, minor: number};
    secureStorage: SecureStorageProvider;
  }) {
    this.options = options;
    this.storage = options.secureStorage;
  }

  async initialize(): Promise<void> {
    // Check for existing key
    let keyPair = await this.storage.getKeyPair('device_id_keypair');

    if (!keyPair) {
      // Generate new key pair
      keyPair = await crypto.subtle.generateKey(
        { name: 'Ed25519' },
        false, // non-extractable
        ['sign', 'verify']
      );

      await this.storage.storeKeyPair('device_id_keypair', keyPair);

      // Generate random salt
      const salt = crypto.getRandomValues(new Uint8Array(32));
      await this.storage.storeBytes('device_id_salt', salt);

      // Store installation timestamp
      await this.storage.storeData('install_ts', Date.now() / 1000);
    }
  }

  async generateDeviceId(): Promise<{
    deviceId: string;
    signature: string;
    publicKey: string;
    metadata: object;
  }> {
    const keyPair = await this.storage.getKeyPair('device_id_keypair');
    const salt = await this.storage.getBytes('device_id_salt');
    const installTs = await this.storage.getData('install_ts');

    // Collect OS info
    const osInfo = await getOsInfo();

    // Create metadata object
    const metadata = {
      platform: this.options.platform,
      os_version: {
        major: osInfo.major,
        minor: osInfo.minor
      },
      app_version: this.options.appVersion,
      install_ts: installTs,
      random_salt: arrayBufferToBase64Url(salt),
      device_model: await getDeviceModel(),
      protocol_version: "3.0",
      security_level: await getSecurityLevel()
    };

    // Canonicalize and hash
    const canonicalData = canonicalizeJson(metadata);
    const fingerprint = new TextEncoder().encode(canonicalData);
    const didRaw = await crypto.subtle.digest('SHA-256', fingerprint);

    // Sign the DID
    const signature = await crypto.subtle.sign(
      'Ed25519',
      keyPair.privateKey,
      didRaw
    );

    // Export public key
    const publicKeyRaw = await crypto.subtle.exportKey(
      'raw',
      keyPair.publicKey
    );

    return {
      deviceId: arrayBufferToBase64Url(didRaw),
      signature: arrayBufferToBase64Url(signature),
      publicKey: arrayBufferToBase64Url(publicKeyRaw),
      metadata
    };
  }

  async authenticate(nonce: string): Promise<{
    deviceId: string;
    signature: string;
    nonce: string;
    timestamp: number;
  }> {
    const keyPair = await this.storage.getKeyPair('device_id_keypair');
    const didRaw = await this.getDeviceIdRaw();

    // Prepare data to sign (DID + nonce)
    const dataToSign = new Uint8Array(didRaw.byteLength + nonce.length);
    dataToSign.set(new Uint8Array(didRaw), 0);
    dataToSign.set(new TextEncoder().encode(nonce), didRaw.byteLength);

    // Sign the data
    const signature = await crypto.subtle.sign(
      'Ed25519',
      keyPair.privateKey,
      dataToSign
    );

    return {
      deviceId: arrayBufferToBase64Url(didRaw),
      signature: arrayBufferToBase64Url(signature),
      nonce: nonce,
      timestamp: Math.floor(Date.now() / 1000)
    };
  }

  async rotateSalt(): Promise<{
    oldDeviceId: string;
    newDeviceId: string;
    signature: string;
    metadata: object;
    rotationTimestamp: number;
  }> {
    const keyPair = await this.storage.getKeyPair('device_id_keypair');
    const oldSalt = await this.storage.getBytes('device_id_salt');
    const oldDidRaw = await this.getDeviceIdRaw();

    // Generate new salt
    const newSalt = crypto.getRandomValues(new Uint8Array(32));

    // Create updated metadata
    const metadata = await this.getMetadata();
    metadata.random_salt = arrayBufferToBase64Url(newSalt);

    // Compute new DID
    const canonicalData = canonicalizeJson(metadata);
    const fingerprint = new TextEncoder().encode(canonicalData);
    const newDidRaw = await crypto.subtle.digest('SHA-256', fingerprint);

    // Current timestamp
    const timestamp = Math.floor(Date.now() / 1000);

    // Prepare data to sign (new DID + timestamp)
    const dataToSign = new Uint8Array(newDidRaw.byteLength + 8);
    dataToSign.set(new Uint8Array(newDidRaw), 0);
    new DataView(dataToSign.buffer).setBigUint64(newDidRaw.byteLength, BigInt(timestamp));

    // Sign the data
    const signature = await crypto.subtle.sign(
      'Ed25519',
      keyPair.privateKey,
      dataToSign
    );

    // Store the new salt
    await this.storage.storeBytes('device_id_salt', newSalt);

    return {
      oldDeviceId: arrayBufferToBase64Url(oldDidRaw),
      newDeviceId: arrayBufferToBase64Url(newDidRaw),
      signature: arrayBufferToBase64Url(signature),
      metadata: metadata,
      rotationTimestamp: timestamp
    };
  }

  // Helper methods
  private async getDeviceIdRaw(): Promise<ArrayBuffer> {
    const metadata = await this.getMetadata();
    const canonicalData = canonicalizeJson(metadata);
    const fingerprint = new TextEncoder().encode(canonicalData);
    return await crypto.subtle.digest('SHA-256', fingerprint);
  }

  private async getMetadata(): Promise<object> {
    const salt = await this.storage.getBytes('device_id_salt');
    const installTs = await this.storage.getData('install_ts');
    const osInfo = await getOsInfo();

    return {
      platform: this.options.platform,
      os_version: {
        major: osInfo.major,
        minor: osInfo.minor
      },
      app_version: this.options.appVersion,
      install_ts: installTs,
      random_salt: arrayBufferToBase64Url(salt),
      device_model: await getDeviceModel(),
      protocol_version: "3.0",
      security_level: await getSecurityLevel()
    };
  }
}
```

### 11.2 Server Verification (Pseudocode)

```typescript
async function verifyDeviceId(request) {
  const {
    device_id: deviceId,
    signature,
    device_key: publicKey,
    metadata
  } = request;

  // Decode from base64url
  const didRaw = base64UrlToArrayBuffer(deviceId);
  const signatureRaw = base64UrlToArrayBuffer(signature);
  const publicKeyRaw = base64UrlToArrayBuffer(publicKey);

  // Import public key
  const publicKeyObj = await crypto.subtle.importKey(
    'raw',
    publicKeyRaw,
    { name: 'Ed25519' },
    false,
    ['verify']
  );

  // Verify signature
  const isValid = await crypto.subtle.verify(
    'Ed25519',
    publicKeyObj,
    signatureRaw,
    didRaw
  );

  if (!isValid) {
    throw new Error('Invalid signature');
  }

  // Verify DID matches metadata
  const canonicalData = canonicalizeJson(metadata);
  const fingerprint = new TextEncoder().encode(canonicalData);
  const computedDid = await crypto.subtle.digest('SHA-256', fingerprint);

  const computedDidBase64 = arrayBufferToBase64Url(computedDid);

  if (computedDidBase64 !== deviceId) {
    throw new Error('Device ID does not match metadata');
  }

  // Verify attestation if present
  if (request.attestation_token) {
    await verifyAttestation(request.attestation_token, metadata.platform);
  }

  return true;
}

async function verifyAuthentication(request, registeredDevice) {
  const {
    device_id: deviceId,
    signature,
    nonce,
    timestamp
  } = request;

  // Validate timestamp is recent
  const currentTime = Math.floor(Date.now() / 1000);
  if (Math.abs(currentTime - timestamp) > 300) { // 5 minute window
    throw new Error('Authentication timestamp expired');
  }

  // Verify nonce hasn't been used before
  if (await isNonceReused(nonce)) {
    throw new Error('Nonce reuse detected');
  }

  // Decode from base64url
  const didRaw = base64UrlToArrayBuffer(deviceId);
  const signatureRaw = base64UrlToArrayBuffer(signature);

  // Prepare data that should have been signed
  const dataToVerify = new Uint8Array(didRaw.byteLength + nonce.length);
  dataToVerify.set(new Uint8Array(didRaw), 0);
  dataToVerify.set(new TextEncoder().encode(nonce), didRaw.byteLength);

  // Import public key from registered device
  const publicKeyRaw = base64UrlToArrayBuffer(registeredDevice.publicKey);
  const publicKeyObj = await crypto.subtle.importKey(
    'raw',
    publicKeyRaw,
    { name: 'Ed25519' },
    false,
    ['verify']
  );

  // Verify signature
  const isValid = await crypto.subtle.verify(
    'Ed25519',
    publicKeyObj,
    signatureRaw,
    dataToVerify
  );

  if (!isValid) {
    throw new Error('Invalid signature');
  }

  // Mark nonce as used
  await storeUsedNonce(nonce, timestamp);

  return true;
}
```

## 12. Security Considerations

### 12.1 Key Protection Requirements

| Platform | Recommended Storage | Minimum Security Level |
|----------|---------------------|------------------------|
| Android 9+ | StrongBox Keymaster | Hardware-backed TEE |
| Android <9 | Android Keystore | TEE |
| iOS | Secure Enclave | Hardware Security |
| Windows 10+ | TPM 2.0 | Hardware security |
| macOS | Secure Enclave | Hardware security |
| Linux | TPM 2.0 / HSM | Hardware or software TEE |
| Web | WebAuthn | FIDO2 security key |

### 12.2 Implementation Vulnerabilities

Common implementation pitfalls to avoid:

1. **Improper key storage**: Failing to use hardware-backed storage when available
2. **Weak entropy**: Using predictable random sources for salt generation
3. **Time-of-check/time-of-use**: Not atomically verifying and using device credentials
4. **Signature replay**: Not including timestamps or nonces in authenticated requests
5. **Side-channel leaks**: Exposing key material through timing or power analysis

## 13. References

1. RFC 8032 — Edwards-Curve Digital Signature Algorithm (EdDSA)
2. RFC 8785 — JSON Canonicalization Scheme (JCS)
3. RFC 8949 — Concise Binary Object Representation (CBOR)
4. RFC 7519 — JSON Web Token (JWT)
5. BLAKE3 — Cryptographic Hash Function Specification
6. FIPS 180-4 — Secure Hash Standard (SHA-256)
7. NIST SP 800-56A — Recommendation for Pair-Wise Key Establishment
8. Android KeyStore System & StrongBox
9. Apple Secure Enclave & App Attest
10. Windows Hello & TPM Attestation
11. NIST SP 800-38D — Galois/Counter Mode (GCM)
12. NIST IR 8105 — Report on Post-Quantum Cryptography
