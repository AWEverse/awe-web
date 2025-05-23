# Mathematical Representation of Signal Protocol: X3DH and Double Ratchet

This document provides a formal mathematical representation of the Signal protocol's two primary components: Extended Triple Diffie-Hellman (X3DH) for initial key agreement and Double Ratchet for ongoing message encryption with forward secrecy and post-compromise security.

## 1. X3DH: Extended Triple Diffie-Hellman Key Agreement

### 1.1. Notation and Preliminaries

- $IK_A, IK_B$ - Long-term identity keys for users $A$ and $B$
- $EK_A$ - Ephemeral key generated by initiator $A$
- $SPK_B$ - Signed pre-key of recipient $B$
- $OPK_B$ - One-time pre-key of recipient $B$ (optional)
- $g$ - Generator of the elliptic curve group
- $DH(K_1, K_2)$ - Diffie-Hellman function between private key $K_1$ and public key $K_2$
- $Sign_K(M)$ - Signature of message $M$ with key $K$

### 1.2. Server-Published Key Bundles

Recipient $B$ publishes the following key bundle on the server:

$$\mathcal{P}_B = \{IK_B^{pub}, SPK_B^{pub}, Sign_{IK_B^{priv}}(SPK_B^{pub}), \{OPK_B^{pub,i}\}_{i=1}^n\}$$

Where:
- $IK_B^{pub}$ is the public component of $B$'s identity key
- $SPK_B^{pub}$ is the public component of $B$'s signed pre-key
- $Sign_{IK_B^{priv}}(SPK_B^{pub})$ is the signature of $SPK_B^{pub}$ using $B$'s private identity key
- $\{OPK_B^{pub,i}\}_{i=1}^n$ is a set of $n$ one-time pre-key public components

### 1.3. Key Agreement Process

When initiator $A$ wants to establish a secure session with $B$:

1. $A$ retrieves $B$'s key bundle from the server: $\mathcal{P}_B$
2. $A$ verifies the signature: $Verify(IK_B^{pub}, SPK_B^{pub}, Sign_{IK_B^{priv}}(SPK_B^{pub}))$
3. $A$ generates an ephemeral key pair: $(EK_A^{priv}, EK_A^{pub})$
4. $A$ selects an unused one-time pre-key $OPK_B^{pub,j}$ (if available)

The shared secret is computed as:

$$SK = KDF\left(\sum_{i=1}^{4} DH_i\right)$$

Where the DH components are:

$$\begin{aligned}
DH_1 &= DH(IK_A^{priv}, SPK_B^{pub}) \\
DH_2 &= DH(EK_A^{priv}, IK_B^{pub}) \\
DH_3 &= DH(EK_A^{priv}, SPK_B^{pub}) \\
DH_4 &= DH(EK_A^{priv}, OPK_B^{pub,j})
\end{aligned}$$

If no one-time pre-key is used, the shared secret excludes $DH_4$:

$$SK = KDF\left(\sum_{i=1}^{3} DH_i\right)$$

### 1.4. Key Derivation Function

The actual shared secret is derived using HKDF:

$$SK = HKDF(F || KM, L, info)$$

Where:
- $F = DH_1 || DH_2 || DH_3 [|| DH_4]$ (concatenation of all DH outputs)
- $KM$ is a fixed key material constant
- $L$ is the desired output length
- $info$ is the protocol identification string

### 1.5. Initial Message

$A$ sends an initial message to $B$ containing:

$$M_0 = \{IK_A^{pub}, EK_A^{pub}, id(SPK_B), id(OPK_B^j), E_{SK}(initial\_message)\}$$

Where $E_{SK}(initial\_message)$ is the encrypted initial message using shared secret $SK$.

### 1.6. Security Properties

#### 1.6.1. Forward Secrecy

The system provides forward secrecy through ephemeral keys. Compromise of long-term keys at time $t$ does not reveal messages from time $t' < t$:

$$\forall t, t': t' < t \implies Compromised(Keys_t) \nRightarrow Compromised(Messages_{t'})$$

#### 1.6.2. Key Compromise Protection

The probability of full compromise requires compromising multiple independent keys:

$$P_{compromise} = \prod_{i=1}^{4} p_i$$

Where $p_i$ is the probability of compromising the $i$-th key component.

#### 1.6.3. Identity Protection

The protocol provides deniability since any participant can compute valid signatures:

$$\forall A, B, \exists C \neq A, B : C \text{ can compute } Sign_{(A,B)}$$

## 2. Double Ratchet Algorithm

### 2.1. Notation and Key Components

- $RK_i$ - Root key at step $i$
- $CK_s^i$ - Sending chain key at step $i$
- $CK_r^i$ - Receiving chain key at step $i$
- $MK_s^{i,j}$ - Message key $j$ in sending chain $i$
- $MK_r^{i,j}$ - Message key $j$ in receiving chain $i$
- $DH_i$ - Output of the Diffie-Hellman function at step $i$
- $KDF_1, KDF_2$ - Key derivation functions
- $HMAC$ - Hash-based message authentication code

### 2.2. Initialization Using X3DH

The Double Ratchet is initialized with the shared secret $SK$ from X3DH:

$$RK_0 = SK$$
$$CK_s^0 = KDF_2(SK, "sending\_chain\_constant")$$
$$CK_r^0 = KDF_2(SK, "receiving\_chain\_constant")$$

### 2.3. DH Ratchet Key Update

When sending a message with a new ratchet key pair $(a_i, g^{a_i})$:

$$DH_i = (g^{b_{i-1}})^{a_i} = g^{a_i b_{i-1}} \mod p$$
$$RK_i, CK_s^i = KDF_1(RK_{i-1}, DH_i)$$

When receiving a message with a new ratchet public key $g^{b_i}$:

$$DH_i = (g^{b_i})^{a_i} = g^{a_i b_i} \mod p$$
$$RK_i, CK_r^i = KDF_1(RK_{i-1}, DH_i)$$

### 2.4. Symmetric Ratchet for Messages

#### 2.4.1. Sending Chain Updates

$$CK_s^{i,j} =
\begin{cases}
CK_s^i, & j = 0 \\
HMAC(CK_s^{i,j-1}, 0x02), & j \geq 1
\end{cases}$$

$$MK_s^{i,j} = HMAC(CK_s^{i,j}, 0x01)$$

#### 2.4.2. Receiving Chain Updates

$$CK_r^{i,j} =
\begin{cases}
CK_r^i, & j = 0 \\
HMAC(CK_r^{i,j-1}, 0x02), & j \geq 1
\end{cases}$$

$$MK_r^{i,j} = HMAC(CK_r^{i,j}, 0x01)$$

### 2.5. Message Encryption and Decryption

#### 2.5.1. Encryption

For plaintext message $P^{i,j}$ at DH ratchet iteration $i$ and message number $j$:

$$C^{i,j} = E_{MK_s^{i,j}}(P^{i,j}, AD^{i,j})$$

Where $AD^{i,j}$ represents authenticated associated data, including:
- Sender identity
- Recipient identity
- DH ratchet public key $g^{a_i}$
- Message number $j$
- Previous message count

#### 2.5.2. Decryption

For ciphertext $C^{i,j}$:

$$P^{i,j} = D_{MK_r^{i,j}}(C^{i,j}, AD^{i,j})$$

### 2.6. Ratchet State

The complete state of the Double Ratchet after $n$ DH ratchet steps with $m_i$ messages sent in each chain $i$ is:

$$\mathcal{S}(n, \{m_i\}_{i=1}^n) = \{RK_n, a_n, b_{n-1}, CK_s^{n,m_n}, CK_r^{n-1,m_{n-1}}, \{MK_s^{i,j}\}_{i=1,j=0}^{n,m_i}, \{MK_r^{i,j}\}_{i=1,j=0}^{n-1,m_i}\}$$

### 2.7. Security Properties

#### 2.7.1. Forward Secrecy

Even if the current state is compromised at time $t$, messages from time $t' < t$ remain secure:

$$\forall t, t': t' < t \implies Compromised(\mathcal{S}_t) \nRightarrow Compromised(Messages_{t'})$$

#### 2.7.2. Post-Compromise Security

For any compromised state $\mathcal{S}_t$ at time $t$, there exists a time $t+\delta$ such that messages sent after $t+\delta$ regain security:

$$\forall \mathcal{S}_t, \exists \delta > 0 : Compromised(\mathcal{S}_t) \nRightarrow Compromised(\{Messages_i\}_{i \geq t+\delta})$$

#### 2.7.3. Break-in Recovery

The system entropy increases with each DH ratchet step, providing recovery from compromise:

$$H_{total}(t_2) > H_{total}(t_1) \text{ for } t_2 > t_1$$

Where the total entropy at time $t$ after $n$ DH exchanges is:

$$H_{total}(t) = H(SK) + \sum_{i=1}^{n} H(DH_i)$$

## 3. Integration of X3DH and Double Ratchet in Signal

### 3.1. Protocol Flow

The complete Signal protocol can be represented as a composition of X3DH and Double Ratchet:

$$Signal = DoubleRatchet \circ X3DH$$

The sequence of operations follows:

1. X3DH establishes initial shared secret $SK$
2. $SK$ initializes the Double Ratchet state
3. Double Ratchet manages ongoing message encryption

### 3.2. Key Evolution Over Time

The entropy of the system increases monotonically over time:

$$H(Signal_t) \leq H(Signal_{t'}) \text{ for } t \leq t'$$

This is due to the continuous introduction of new randomness through DH exchanges.

### 3.3. Protocol State Transitions

The state transition function $\Gamma$ for Signal can be defined as:

$$\mathcal{S}_{t+1} = \Gamma(\mathcal{S}_t, Input_t)$$

Where $Input_t$ could be:
- New message to be sent
- Received message requiring decryption
- New DH ratchet key from the other party

### 3.4. Combined Security Guarantees

The composition of X3DH and Double Ratchet provides:

1. Authentication of initial key exchange
2. Perfect forward secrecy for all messages
3. Post-compromise security after a new DH ratchet step
4. Protection from replay attacks
5. Cryptographic deniability

This can be formalized as:

$$\forall t, \exists \delta > 0 : Signal_t \text{ provides } \{Auth, PFS, PCS_\delta, Replay, Deniability\}$$

Where $PCS_\delta$ represents post-compromise security after time interval $\delta$.

### 3.5. Information-Theoretic Bounds

The security of the Signal protocol against an adversary with computational power $\mathcal{C}$ can be bounded by:

$$P_{breach}(Signal_t, \mathcal{C}) \leq min(\frac{\mathcal{C}}{2^{H(RK_t)}}, \frac{\mathcal{C}}{2^{H(CK_t)}})$$

This demonstrates that as long as the root and chain keys maintain high entropy, the system remains secure against computationally bounded adversaries.

## 4. Advanced Properties and Extensions

### 4.1. Out-of-Order Message Handling

Signal's handling of out-of-order messages can be formalized as:

$$\forall j, k : j < k \land Receive(M_k) < Receive(M_j) \implies Decrypt(M_j) \text{ succeeds}$$

This is achieved by storing skipped message keys:

$$SkippedKeys = \{(i, j, MK_r^{i,j}) : \text{message } (i,j) \text{ not yet received}\}$$

### 4.2. Group Messaging Extensions

For group messaging with $n$ participants, the pairwise channels can be represented as:

$$GroupState = \{\mathcal{S}_{i,j} : 1 \leq i < j \leq n\}$$

Where $\mathcal{S}_{i,j}$ is the Signal state between participants $i$ and $j$.

### 4.3. Cryptographic Agility

The Signal protocol allows for cryptographic agility through parameterization:

$$Signal(Curve, Hash, Cipher) = DoubleRatchet(Hash, Cipher) \circ X3DH(Curve, Hash)$$

Where:
- $Curve$ is the elliptic curve used for DH operations
- $Hash$ is the hash function used in KDF and HMAC
- $Cipher$ is the symmetric encryption algorithm

This mathematical representation provides a comprehensive formal description of how X3DH and Double Ratchet work together in the Signal protocol to provide strong security guarantees for secure messaging.
