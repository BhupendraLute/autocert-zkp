# Avishkar 2026-27: Live Demonstration Script & Defense Q&A

**Project:** AutoCert-ZKP: Verifiable Academic Credential Ledger with Client-Side Zero-Knowledge Redaction  
**Competition:** Avishkar Research Convention (RTMNU)  
**Category:** Engineering & Technology (UG Level)  
**Total Allocated Pitch Duration:** 90 Seconds  

---

## 1. 90-Second Competitive Presentation Pitch

### 00:00 – 00:30 | The Hook: The Pervasive Credential Privacy Paradox
*(Presenter stands before the panel, holding a printed physical degree marksheet and a smartphone)*

> *"Respected judges, whenever an employer or scholarship committee asks an engineering graduate to prove they attained a First Class degree—say, a CGPA $\ge 7.50$—why is the graduate forced to hand over an unredacted marksheet that also exposes their home address, parent names, date of birth, and past semester backlogs?*
>
> *Every year, background verification pipelines face pervasive credential tampering and manual screening delays, while conventional verification routinely conflicts with Section 6 Data Minimization under India's Digital Personal Data Protection (DPDP) Act, 2023 (with relevant provisions taking effect on May 13, 2027).*
>
> *Today, our team presents **AutoCert-ZKP**: a cryptographic architecture where students mathematically prove their academic eligibility client-side without disclosing private marks or identity data, running at ₹0 cloud compute cost."*

---

### 00:30 – 01:00 | The Live Demonstration
*(Presenter navigates to `/student` on a live smartphone screen mirrored to the display)*

> *"Allow us to demonstrate live. Here on this standard Android smartphone, our student vault holds an accredited RTMNU degree with an actual CGPA of 8.45.
>
> An employer posts an eligibility requirement: **Minimum CGPA $\ge 7.50$**.
>
> We set the threshold slider to 7.50 and tap **'Generate Zero-Knowledge Proof'**.
>
> Watch the live WebAssembly witness compilation. In under a second, using an isolated Web Worker, the phone computes a Groth16 zk-SNARK proof over elliptic curve $BN128$.
>
> Notice the browser's Network Inspector tab: **Zero private data packets were transmitted to any server**. The student's private marks remain in browser memory during proof generation.
>
> The output is this compact, ~1.4 KB cryptographic token and dynamic QR code."*

---

### 01:00 – 01:30 | Instant Recruiter Verification & Empirical Impact
*(Presenter scans the QR code using a recruiter laptop at `/verify`)*

> *"Now, the recruiter scans the candidate's QR code.
>
> In just milliseconds on edge, the verifier computes three bilinear pairings:
> $$e(A, B) = e(\alpha, \beta) \cdot e(vk_x, \gamma) \cdot e(C, \delta)$$
> and cross-references the university Merkle root on Supabase.
>
> Instantly: **Credential Authenticated: CGPA $\ge 7.50$**. 
>
> What did the recruiter learn? Only that the mathematical statement is true. What did the student expose? **Zero personal data**.
>
> Compared to a traditional 2.4 MB scanned PDF, our compact proof achieves over **99.9% bandwidth reduction**, runs on ₹0 gas, and requires ₹0 cloud servers. AutoCert-ZKP aligns with NEP 2020 and India's Academic Bank of Credits to make verification tamper-proof, private, and universal. Thank you."*

---

## 2. Judge Defense Q&A Cheatsheet

### Q1: Can a dishonest student alter their local CGPA in browser memory before running the proof?
**Answer:**
> *"No, because the Circom arithmetic circuit enforces two simultaneous constraints:
> 1. $\text{comp.out} === 1$ (where $actualCgpaScaled \ge thresholdScaled$)
> 2. $expectedCommitment === \text{Poseidon}(actualCgpaScaled, studentSecret)$
>
> The $expectedCommitment$ is an immutable leaf anchored to the University Registrar's Merkle root in the ledger. If a student modifies $actualCgpaScaled$ from 6.20 to 8.50, the computed Poseidon hash will no longer match the registrar's signed commitment, and Groth16 witness generation immediately fails mathematically."*

---

### Q2: Why did you choose Poseidon hash over standard SHA-256 inside the circuit?
**Answer:**
> *"SHA-256 operates on 32-bit words using bitwise XORs, shifts, and modular addition, which forces Circom to unpack field elements into binary bits. A single SHA-256 compression consumes over **25,000 R1CS constraints**.
>
> In contrast, the Poseidon hash is an algebraic sponge function designed natively over the prime field $\mathbb{F}_p$ using power S-boxes ($x^5$). Poseidon consumes only **142 constraints** for a 2-element commitment. This 176x gate reduction is what enables a budget Indian Android phone to generate proofs in ~1.2 seconds without running out of RAM."*

---

### Q3: Why not deploy this as an Ethereum or Polygon smart contract?
**Answer:**
> *"Public blockchains introduce three prohibitive barriers for university students and public universities:
> 1. **Gas Cost Barrier:** Verifying a Groth16 pairing on Ethereum mainnet typically consumes ~200,000 gas ($2 to $15 per verification depending on 15–40 Gwei market conditions), making it cost-prohibitive for routine job applications.
> 2. **Transaction Latency:** Block confirmation times range from 12 seconds to several minutes, whereas recruiters demand sub-second verification.
> 3. **Public Ledger Privacy Leakage:** Even pseudonymous addresses on public ledgers can be deanonymized via timing analysis.
>
> AutoCert-ZKP delivers **₹0.00 gas cost**, instant edge verification, and anchors Merkle roots to Supabase PostgreSQL free tier with cryptographic signatures."*

---

### Q4: How does your system handle degree revocation if a student's degree is rescinded?
**Answer:**
> *"We maintain a cryptographic Revocation Accumulator on the Supabase ledger table `revocations`. When a degree is revoked, the university registrar publishes the commitment hash to the revocation registry.
>
> During public verification on `/verify`, the edge verifier checks `checkRevocation(commitmentHash)` alongside the Groth16 pairing check. If the commitment exists in the revocation registry, the verifier rejects the proof immediately, without ever needing to know the student's name or identity."*

---

### Q5: How is AutoCert-ZKP architected around the Indian Digital Personal Data Protection (DPDP) Act, 2023?
**Answer:**
> *"Section 6 of the DPDP Act 2023 establishes the **Principle of Data Minimization** (with relevant provisions taking effect on May 13, 2027): data fiduciaries must only process personal data that is strictly necessary for the specified purpose.
>
> When an employer verifies if a candidate satisfies an academic threshold, collecting unredacted marksheets containing dates of birth, parentage, residential addresses, and backlog records is disproportionate. AutoCert-ZKP is designed to align with statutory data minimization principles by providing zero-knowledge mathematical evidence of the qualifying criterion with **0.00% PII disclosed to the verifier in the proof payload** (with confidential institutional processing restricted strictly to the university issuer during issuance)."*
