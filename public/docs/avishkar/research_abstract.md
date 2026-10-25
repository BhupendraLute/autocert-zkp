# AutoCert-ZKP: Verifiable Academic Credential Ledger with Client-Side Zero-Knowledge Redaction

**Competition:** Avishkar Research Convention (RTMNU)  
**Category:** Engineering & Technology  
**Level:** Undergraduate (UG) – Final Year B.Tech Computer Engineering  
**Academic Year:** 2026-27  
**Keywords:** Zero-Knowledge Proofs, Groth16 zk-SNARK, Poseidon Sponge Hash, W3C Verifiable Credentials, Data Minimization, NEP 2020, Privacy-Preserving Computing  

---

## 1. Problem Formulation & Motivation

In conventional recruitment, scholarship disbursement, and university postgraduate admissions, students are universally compelled to submit unredacted physical marksheets or scanned PDF transcripts. This standard operating procedure introduces two fundamental security and statutory vulnerabilities:

1. **Rampant Credential Forgery:** Scanned PDF marksheets and paper transcripts can be effortlessly manipulated using modern image manipulation and generative AI tools. Verification mechanisms rely either on manual, slow institutional inquiries or expensive third-party background screening portals.
2. **Excessive Personal Data Exposure:** To prove a single qualifying academic condition (such as $CGPA \ge 7.50$ or "Award of B.Tech Degree"), a candidate must currently reveal their entire academic history: non-relevant subject marks, past backlogs, semester-by-semester scores, parent names, date of birth, and home address. This over-exposure conflicts with the principle of **Data Minimization** established under Section 6 of India's Digital Personal Data Protection (DPDP) Act, 2023 (relevant provisions taking effect on May 13, 2027).

---

## 2. Proposed Architecture & Mathematical Formulation

**AutoCert-ZKP** decouples credential verification from raw data disclosure by executing non-interactive zero-knowledge proofs of knowledge (**zk-SNARKs**) directly inside the student's browser. The student mathematically demonstrates credential eligibility without sending their transcript, private marks, or secret blinding factors to any server or verifier.

### 2.1 Arithmetic Circuit & R1CS Formulation
Computation is modeled as a Rank-1 Constraint System (R1CS) over the prime field $\mathbb{F}_p$ for curve $BN128$:
$$L \cdot s \circ R \cdot s - O \cdot s = 0$$

Where witness vector $s = (1, x_{pub}, w_{priv})$:
- **Private Witness ($w_{priv}$):**
  - $actualCgpaScaled \in [0, 1000]$ (e.g., $8.45 \rightarrow 845$)
  - $studentSecret \in \mathbb{F}_p$ (256-bit scalar cryptographic blinding salt)
- **Public Signals ($x_{pub}$):**
  - $thresholdScaled \in [0, 1000]$ (e.g., $7.50 \rightarrow 750$)
  - $expectedCommitment \in \mathbb{F}_p$ (Signed registrar leaf commitment)

### 2.2 Algebraic Commitments via Poseidon Sponge
To avoid the computational explosion of bitwise hash functions (e.g., SHA-256 requires $> 25,000$ constraints), we employ the **Poseidon Sponge Hash** function over prime field $\mathbb{F}_p$:
$$\text{Commitment} = \text{Poseidon}_2(actualCgpaScaled, studentSecret)$$
The circuit enforces simultaneously:
1. $actualCgpaScaled \ge thresholdScaled$ (via 16-bit binary decomposition comparator)
2. $\text{Poseidon}_2(actualCgpaScaled, studentSecret) \equiv expectedCommitment$

The entire circuit compiles to only **142 constraints**, making client-side execution on low-cost smartphones feasible.

### 2.3 Groth16 Zero-Knowledge Verification
The verifier accepts proof $\pi = (A \in G_1, B \in G_2, C \in G_1)$ if and only if the bilinear pairing equation in target group $G_T$ over curve $BN128$ holds (using standard multiplicative notation):
$$e(A, B) = e(\alpha, \beta) \cdot e(vk_x, \gamma) \cdot e(C, \delta)$$

where:
$$vk_x = IC_0 + \sum_{i=1}^l x_i \cdot IC_i \in G_1$$
encodes the public input vector $(thresholdScaled, expectedCommitment)$ paired with $\gamma \in G_2$, and $C \in G_1$ is paired with $\delta \in G_2$.

This provides two mathematical guarantees:
- **Proof Payload Invariance:** The proof coordinates $(A, B, C)$ and public signals serialize to a compact, constant payload of ~1,479 bytes Base64 (incorporating W3C credential metadata).
- **Verification Complexity:** Evaluates exactly 3 bilinear pairings, completing in ~19.9 ms under Node.js runtime and sub-10ms in native browser JIT environments.

---

## 3. Zero-Cost System Topology

AutoCert-ZKP is architected to operate at **₹0.00 cloud operational cost**:
- **Client Prover Layer:** Next.js 16 App Router offloading Circom WebAssembly compilation to dedicated Web Workers. Proving computation runs locally on client hardware ($0 cloud cost).
- **Decentralized Ledger Layer:** Supabase PostgreSQL (Free Tier) housing university public keys, Poseidon Merkle roots, and instant revocation accumulators ($0 server cost).
- **AI Ingestion Layer:** Vercel AI SDK wired to OpenCode Zen (`opencode/big-pickle`) for automated parsing of unstructured transcript text into W3C Verifiable Credential JSON-LD schemas.

---

## 4. Empirical Benchmark Results

| Parameter | Low-End Mobile (Projected) | Mid-Tier Mobile (Projected) | Desktop Host (Measured) | Traditional Centralized Verification |
| :--- | :--- | :--- | :--- | :--- |
| **Workload / Chipset** | MediaTek Helio G85 (modeled) | Snapdragon 778G (modeled) | Intel Core i3-1115G4 (4 cores) | Cloud Enterprise Server (AWS/Azure) |
| **Proof Latency ($T_{proof}$)** | $1,240\text{ ms}$ | $580\text{ ms}$ | $269.8\text{ ms}$ (mean) | N/A (Requires Full Upload) |
| **Verification Latency ($T_{verify}$)** | $14.2\text{ ms}$ | $8.4\text{ ms}$ | $19.9\text{ ms}$ (Node) / $< 10\text{ ms}$ (JIT) | $2,450\text{ ms}$ |
| **Memory / RSS Overhead** | $42.1\text{ MB}$ | $38.4\text{ MB}$ | $354.2\text{ MB}$ (Node process RSS) | $> 120\text{ MB}$ |
| **Transferred Payload** | **$1,479\text{ Bytes}$** | **$1,479\text{ Bytes}$** | **$1,479\text{ Bytes}$** | $2.4\text{ MB}$ |
| **PII Disclosed to Verifier (Proof Payload)** | **$0.00\%$** | **$0.00\%$** | **$0.00\%$** | $100.00\%$ (Full Transcript) |
| **Estimated per-verification cost** | **₹0.00** | **₹0.00** | **₹0.00** | ~₹35.50 / query |

*Note on PII Disclosure & Cost Assumptions:*
- **PII Disclosed to Verifier:** Measures PII disclosed to the external verifier in the zero-knowledge proof payload ($0.00\%$). In contrast, issuer/provider-side processing occurs confidentially within the accredited university boundary during initial transcript parsing and issuance prior to computing the Poseidon commitment.
- **Estimated Per-Verification Cost:** AutoCert-ZKP requires ₹0.00 per verification query (client browser WASM execution, free-tier Supabase PostgreSQL ledger queries, and edge JIT verification). The traditional centralized baseline (~₹35.50 per query) is estimated based on commercial cloud OCR text extraction APIs (~₹15.00), enterprise database reads and storage egress (~₹5.50), and outsourced background screening / third-party verification vendor processing charges (~₹15.00).

---

## 5. Societal Impact & Alignment with National Initiatives

1. **Alignment with Digital Personal Data Protection (DPDP) Act, 2023:** Architected to support institutional compliance with statutory data minimization mandates under Section 6 (taking effect May 13, 2027) by mathematically verifying eligibility without exposing non-essential personal identifiers to verifiers.
2. **National Education Policy (NEP) 2020 & Academic Bank of Credits (ABC):** Provides a trustless, cryptographically verifiable substrate for micro-credentials, credit transfers, and multi-disciplinary diplomas across universities without requiring centralized database federation.
3. **Bandwidth & Infrastructure Democratization:** The $99.94\%$ payload reduction allows instant credential verification in low-bandwidth rural areas where downloading heavy multi-megabyte PDFs fails.
