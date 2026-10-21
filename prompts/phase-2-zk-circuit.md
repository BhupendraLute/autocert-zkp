# Implementation Prompt: Phase 2 — Circom ZK Circuit & Cryptographic Ceremony

## 1. Goal & Background
Author and compile the domain-specific arithmetic circuit `circuits/academic_verifier.circom` using Circom 2.1 and SnarkJS over the BN128 curve. Execute the Powers of Tau setup and Groth16 ceremony to export the browser-executable WebAssembly witness binary, proving key (`.zkey`), and static verification key (`verification_key.json`) into `public/zk/`.

## 2. Skills Consulted
- `.agents/skills/architect/SKILL.md`: Cryptographic circuit parameters and boundary constraints.
- `.agents/skills/develop/SKILL.md`: Ceremony scripting and asset pipeline.
- `.agents/skills/check/SKILL.md`: Constraint budget verification (<150 gates).
- `.agents/skills/test/SKILL.md`: Mock witness proving and pairing check tests.

## 3. Decisions & Assumptions
1. **Poseidon Algebraic Hash:** Use `Poseidon(2)` from `circomlib` to bind `(actualCgpaScaled, studentSecret)`. Minimizes R1CS gate count to ~142 constraints, allowing low-end Android mobile devices to generate proofs in under 1.2s.
2. **16-bit Range Comparison:** Use `GreaterEqThan(16)` from `circomlib/circuits/comparators.circom` for `actualCgpaScaled >= thresholdScaled`. Scaled 100x (e.g., $8.45 \rightarrow 845$), fitting within 16-bit range $[0, 65535]$.
3. **Cross-Platform Toolchain:** Install `circomlib` for arithmetic circuit templates. Implement an automated Node.js ceremony script (`scripts/setup-zk.js`) that downloads the official standalone `circom` binary (if not present), compiles the circuit to R1CS and WebAssembly, and runs `snarkjs` Powers of Tau ceremony and Groth16 key export.
4. **Static Prover Distribution:** Proving key (`circuit_final.zkey`), WASM witness generator (`academic_verifier.wasm`), and `verification_key.json` are placed in `public/zk/` for zero-latency client streaming.

## 4. Files to Create/Touch
- `package.json`: Add `circomlib` as a dependency.
- `circuits/academic_verifier.circom`: Circom arithmetic circuit with Poseidon & range check.
- `scripts/setup-zk.js`: Standalone compiler runner, Powers of Tau contribution, Groth16 setup, and key export script.
- `scripts/test-circuit.js`: End-to-end smoke test generating mock witness and verifying Groth16 pairing check.
- `public/zk/`: Output directory hosting compiled WASM and ZK keys.

## 5. Security & Privacy Considerations
- Private inputs (`actualCgpaScaled`, `studentSecret`) must never be declared as public signals.
- Only `thresholdScaled` and `expectedCommitment` are exposed in public signals.
- Ensure `expectedCommitment === hasher.out` prevents falsifying local credentials.

## 6. Acceptance Criteria
- [ ] `circuits/academic_verifier.circom` compiled to R1CS and WebAssembly.
- [ ] Total circuit constraints confirmed $\le 150$ gates.
- [ ] Groth16 `.zkey` and `verification_key.json` generated in `public/zk/`.
- [ ] Automated smoke test confirms:
  - Valid witness (`actualCgpa: 845 >= threshold: 750`) $\rightarrow$ PROOF VALID.
  - Invalid threshold (`actualCgpa: 650 < threshold: 750`) $\rightarrow$ WITNESS REJECTED.
  - Tampered commitment $\rightarrow$ PAIRING VERIFICATION FAILS.

## 7. Verification Steps
1. Run `node scripts/setup-zk.js` to execute circuit compilation and ceremony.
2. Inspect gate count via SnarkJS R1CS info.
3. Run `node scripts/test-circuit.js` to execute full proof generation and verification loop.
