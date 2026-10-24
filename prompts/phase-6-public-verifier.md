# Implementation Prompt: Phase 6 — Public Verifier Portal & Sub-10ms Engine

## 1. Goal & Background
Build the instant public verification portal (**Public Verifier**) at `src/app/verify/page.tsx` and the high-speed cryptographic verification engine (`src/lib/zk/verifier-engine.ts`) for the Avishkar 2026-27 Research Convention.

In conventional verification systems, employers and recruiters wait days or weeks for manual institutional checks, or demand unredacted marksheets exposing full transcripts, failed subjects, and sensitive PII. AutoCert-ZKP enables instant recruiter verification:
1. When an applicant shares their proof URL (`/verify?data=<token>`) or displays their QR code, the public verifier ingests the ~384-byte Groth16 proof payload.
2. In **under 10 milliseconds**, the verifier evaluates the 3 bilinear pairing equations over curve $BN128$:
   $$e(A, B) = e(\alpha, \beta) + e(x \cdot \gamma, \delta) + e(C, \delta)$$
   against the authoritative static `verification_key.json`.
3. Simultaneously, it validates the Poseidon commitment leaf against the immutable PostgreSQL Merkle ledger (`src/lib/supabase/ledger.ts`), confirming that the credential was issued by an accredited institution (RTMNU) and has not been revoked.
4. The verifier renders an award-winning cryptographic authenticity certificate confirming the threshold condition (e.g., "$CGPA \ge 7.50$") with **0.00% PII revealed** and **₹0.00 gas or compute cost**.

---

## 2. Skills Consulted
- `.agents/skills/design-taste-frontend/SKILL.md`: Art direction for web applications, modern dark slate palette, emerald authenticated badge, crimson tamper alerts, JetBrains Mono for cryptographic commitments and curve coordinates, glassmorphism, responsive cards, micro-animations, and anti-slop guidelines.
- `.agents/skills/vercel-react-best-practices/SKILL.md`: Next.js 16 App Router performance, dynamic client boundaries, wrapping `useSearchParams()` in a `<Suspense>` boundary, eliminating client-side waterfalls, and sub-10ms execution.
- `.agents/skills/supabase/SKILL.md` & `.agents/skills/supabase-postgres-best-practices/SKILL.md`: Supabase ledger querying, Merkle root verification, and real-time revocation checks without leaking private data.
- `.agents/skills/check/SKILL.md` & `.agents/skills/test/SKILL.md`: Rigorous test coverage for valid proofs, tampered signals, corrupted proofs, and revoked credentials.
- Next.js 16 Bundled Documentation (`node_modules/next/dist/docs/`): App Router client boundaries, Suspense conventions, and async request APIs.

---

## 3. Decisions & Assumptions

1. **Dual-Layer Verification Architecture:**
   - **Layer 1: Groth16 zk-SNARK Pairing Verification:** Uses `snarkjs.groth16.verify` with `/zk/verification_key.json` to prove mathematically that the prover satisfied the arithmetic circuit:
     1. $actualCgpaScaled \ge thresholdScaled$
     2. $Poseidon(actualCgpaScaled, studentSecret) == expectedCommitment$
   - **Layer 2: Institutional Ledger Anchoring & Revocation Check:** Uses `verifyCredentialLedgerState(commitmentHash, rootHash, institutionCode)` from `src/lib/supabase/ledger.ts` to guarantee that the commitment belongs to an accredited university batch root and has not been revoked.
2. **Sub-10ms Edge Engine (`src/lib/zk/verifier-engine.ts`):**
   - Verification is extremely lightweight ($< 10\text{ms}$) because verifying Groth16 requires only 3 bilinear pairings on $BN128$, unlike proving which requires multi-scalar multiplications and FFTs.
   - The engine measures high-precision verification latency $T_{verify}$ using `performance.now()` and records detailed diagnostics (pairing verification status, ledger status, revocation status).
3. **Next.js 16 App Router Client Boundary with `<Suspense>`:**
   - In Next.js 16, components consuming `useSearchParams()` must be wrapped in a `<Suspense>` boundary to prevent CSR bailout or hydration mismatch.
   - `src/app/verify/page.tsx` will provide a sleek loading fallback while the query params are parsed.
4. **Recruiter Ingestion Modes:**
   - **URL Query Token:** Automatic decoding and verification when navigating to `/verify?data=<token>`.
   - **Manual Token / JSON Paste:** Allows recruiters to paste Base64 tokens or raw proof JSON directly.
   - **JSON File Drop:** Drag-and-drop or upload `autocert-proof-*.json` generated from the Student Vault.
   - **Camera QR Scanner:** Recruiter can scan a candidate's smartphone screen directly via their camera or upload a QR image.
   - **Preset Avishkar Test Proofs:** Instant one-click test cases for convention judges:
     1. *Valid Proof (8.45 CGPA $\ge$ 7.50 Threshold)* — Pass
     2. *Valid Proof (7.60 CGPA $\ge$ 7.00 Threshold)* — Pass
     3. *Tampered Signal Proof (Attempted threshold inflation or forged commitment)* — Mathematical Pairing Rejection
     4. *Corrupted Proof Coordinate (Tampered $\pi_A$ or $\pi_B$ bytes)* — Rejection
     5. *Revoked Credential Proof (Revoked degree commitment)* — Flagged as Revoked on Ledger
5. **Cryptographic Inspector Modal / Drawer:**
   - For academic judges and technical recruiters who want to inspect the mathematics:
     - Groth16 curve coordinates ($A \in G_1, B \in G_2, C \in G_1$)
     - Public signals ($Signal[0] = thresholdScaled, Signal[1] = Poseidon Commitment$)
     - Bilinear pairing verification equation on curve $BN128$
     - Merkle root hash and batch identifier on Supabase
     - Micro-benchmark telemetry ($T_{verify}$, payload size, gas cost = ₹0.00)

---

## 4. Files to Create / Touch
- `src/lib/types/verifier.ts`: TypeScript interfaces for verification results, status states, diagnostics, and inspector data.
- `src/lib/zk/verifier-engine.ts`: Core cryptographic verification engine executing SnarkJS Groth16 verification, ledger cross-checks, and latency measurement.
- `src/app/verify/page.tsx`: Main verifier page wrapped in `<Suspense>`.
- `src/app/verify/hooks/useVerifier.ts`: Custom hook managing verification state, intake modes, auto-verification, and timing.
- `src/app/verify/components/VerifierHeader.tsx`: Header with Avishkar UG badge, protocol indicators, and status badges.
- `src/app/verify/components/VerificationCertificate.tsx`: Award-winning authenticated certificate card with emerald/crimson visual states, verified threshold, and zero-PII guarantees.
- `src/app/verify/components/VerifierIntake.tsx`: Intake tab selector (URL Token, Paste, JSON File Upload, Camera QR Scanner).
- `src/app/verify/components/CryptographicInspector.tsx`: Deep-dive modal/drawer detailing Groth16 proof coordinates, public signals, and ledger proofs.
- `src/app/verify/components/PresetProofSelector.tsx`: Quick-load test suite for Avishkar judge demonstrations.
- `scripts/test-verifier.ts`: Automated integration test suite validating sub-10ms verification, tampering detection, and revocation rejection.
- `package.json`: Add `verifier:test` script.
- `docs/scope/scope.md`: Update Phase 6 status to `in-progress` and then `done`.

---

## 5. Security & Privacy Considerations
- **Data Minimization Guarantee:** The verifier receives strictly the Groth16 proof and public signals. The verifier cannot learn the student's actual CGPA, individual subject grades, backlog count, or private blinding salt.
- **Mathematical Soundness:** Due to the computational soundness of Groth16 over BN128, a dishonest candidate cannot forge a valid proof for a false statement (e.g., claiming CGPA $\ge 8.50$ when true CGPA is $6.20$) without solving the discrete logarithm problem.
- **Tamper Evident:** Modifying even a single character in the Base64 token or changing the threshold signal causes the pairing check $e(A, B) \neq e(\dots)$ to fail instantly.
- **Revocation Enforcement:** Even if a zk-SNARK proof is cryptographically valid, the ledger layer ensures revoked credentials are immediately rejected.

---

## 6. Acceptance Criteria
- [ ] `src/lib/zk/verifier-engine.ts` executes `snarkjs.groth16.verify` against `public/zk/verification_key.json` and records latency $< 10\text{ms}$.
- [ ] `src/app/verify/page.tsx` auto-detects and verifies incoming URL tokens (`?data=<token>`) wrapped cleanly in Next.js 16 `<Suspense>`.
- [ ] Recruiter can paste tokens, upload proof JSON files, or scan QR codes.
- [ ] Preset demonstration buttons allow judges to test valid proofs, tampered signals, and revoked credentials with one click.
- [ ] Detailed cryptographic inspector displays Groth16 coordinates, public signals, and ledger verification details.
- [ ] Automated test suite `npm run verifier:test` passes 100% of test cases.
- [ ] `npm run build` and `npm run lint` pass cleanly with zero errors.

---

## 7. Verification Steps
1. Run `npm run verifier:test` to verify valid proof verification ($T < 10\text{ms}$), tampered signal rejection, corrupted proof rejection, and revocation detection.
2. Run `npm run build` to verify Next.js 16 App Router build and type integrity.
3. Start `npm run dev` and navigate to `/verify`:
   - Click preset "Valid Proof (8.45 CGPA $\ge$ 7.50)" and confirm instant verified certificate badge in $< 10\text{ms}$.
   - Click preset "Tampered Signal Proof" and verify instant cryptographic rejection.
   - Click preset "Revoked Credential" and verify ledger revocation warning.
   - Navigate from Student Vault (`/student`) by clicking "Test Instantly in Public Verifier" and confirm seamless end-to-end verification.
