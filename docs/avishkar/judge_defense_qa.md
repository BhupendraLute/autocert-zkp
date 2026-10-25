# Avishkar 2026-27: Evaluator Defense Q&A & Cryptographic Proofs

**Project:** AutoCert-ZKP: Verifiable Academic Credential Ledger with Client-Side Zero-Knowledge Redaction  
**Convention:** Avishkar Research Convention (RTMNU)  
**Category:** Engineering & Technology (UG Level)  

---

### Q1: Can a student manipulate their local input marks before running the proof?

**Answer:**
No. The Circom arithmetic circuit strictly enforces two simultaneous constraints:
```circom
comp.out === 1; // actualCgpaScaled >= thresholdScaled
expectedCommitment === Poseidon(actualCgpaScaled, studentSecret);
```
The `expectedCommitment` is signed and anchored to the University Registrar's immutable Merkle tree root in the Supabase ledger. If the student tampers with their CGPA locally in browser memory (e.g. altering 6.20 to 8.50), the computed Poseidon hash will fail to match the registrar's commitment, and Groth16 witness generation immediately fails mathematically.

---

### Q2: Why not just store student certificates on Ethereum or Polygon?

**Answer:**
Public blockchains introduce three prohibitive barriers for Indian public universities and students:
1. **Gas Cost Barrier:** Verifying a Groth16 pairing on Ethereum mainnet consumes ~200,000 gas ($2 to $15 per verification depending on market conditions). On Polygon, gas fluctuations still require holding crypto tokens, which public universities cannot require students to maintain.
2. **Transaction Latency:** Block confirmations take 15 seconds to several minutes, whereas recruiters and HR portals demand sub-second verification.
3. **Public Ledger Privacy Leakage:** Even pseudonymous wallet addresses on public ledgers can be deanonymized via graph and timing analysis.

AutoCert-ZKP operates at **₹0.00 gas cost**, completes edge verification in **< 10ms**, and anchors Merkle roots to Supabase PostgreSQL free-tier with cryptographic signatures.

---

### Q3: Why did you choose Poseidon hash over standard SHA-256 inside the circuit?

**Answer:**
SHA-256 operates on 32-bit words using bitwise XORs, shifts, and additions. Inside an arithmetic circuit, every bitwise operation requires decomposing field elements into binary bits, which consumes over **25,000 R1CS constraints**. Computing SHA-256 in a mobile browser freezes the UI thread.

In contrast, the **Poseidon hash** is an algebraic sponge function designed natively over the prime field $\mathbb{F}_p$ using power S-boxes ($x^5$). Poseidon consumes only **142 constraints** (a 176× reduction). This enables budget Indian Android smartphones (e.g. MediaTek Helio G85) to generate Groth16 proofs in ~1.2 seconds client-side.

---

### Q4: How is AutoCert-ZKP architecturally aligned with the Digital Personal Data Protection (DPDP) Act, 2023?

**Answer:**
Section 6(1) of India's DPDP Act, 2023 specifies the conditions for valid consent—requiring it to be free, specific, informed, unconditional, and unambiguous with clear affirmative action—and limits consent to such personal data as is necessary for the specified purpose (with relevant statutory provisions taking effect on May 13, 2027).

When a relying party (such as a recruiter or screening agency) merely needs to confirm whether a candidate meets a specific qualification cutoff (e.g. CGPA $\ge 7.50$), collecting unredacted transcripts containing dates of birth, parentage, residential addresses, and historical backlog counts risks processing personal data beyond what is strictly necessary for that specified verification purpose. AutoCert-ZKP adopts a privacy-by-design architecture: it mathematically proves compliance with the qualifying threshold with **0.00% extraneous PII disclosed to verifiers in the proof payload**, ensuring relying parties receive cryptographic assurance without accessing unnecessary personal data.

---

### Q5: How does AutoCert-ZKP handle degree revocation if a degree is rescinded?

**Answer:**
The system maintains a cryptographic Revocation Registry table (`revocations`) in the Supabase ledger. If a degree is revoked, the university registrar publishes the commitment hash to the revocation table.

During public verification on `/verify`, the edge verifier checks `checkRevocation(commitmentHash)` alongside the Groth16 pairing check. If the commitment exists in the revocation registry, the verifier immediately rejects the proof, without ever needing to know the student's name or identity.

---

### Q6: What happens if the student loses their private blinding secret?

**Answer:**
The student's private blinding secret (`studentSecret`) and scaled integer CGPA are embedded in the W3C Verifiable Credential JSON-LD file delivered by the university upon graduation. The student can re-download this credential from the University Ingestion portal at any time by proving their university authentication credentials. The secret is never sent to any verifier or public entity.

---

### Q7: Can a student prove eligibility using a self-selected weaker threshold such as CGPA ≥ 0.00?

**Answer:**
No. In the Circom arithmetic circuit, `thresholdScaled` is an immutable **public signal** ($x_0$), which is exposed directly in the proof payload alongside the Poseidon commitment leaf ($x_1$).

The Groth16 cryptographic verification certifies that the student's actual scaled CGPA satisfies $actualCgpaScaled \ge thresholdScaled$. Therefore, the relying party / verifier application (`/verify`) must compare the received public `thresholdScaled` input against the verifier's required cutoff (e.g., verifying `publicSignals[0] >= 750` for a 7.50 CGPA requirement). If a candidate presents a proof generated with a weaker self-selected cutoff such as 0 or 5.00, the Groth16 proof may verify mathematically, but the verifier's cutoff policy check immediately flags that the attested threshold fails to satisfy the mandated qualification requirement.
