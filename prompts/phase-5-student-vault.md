# Implementation Prompt: Phase 5 — Student Vault & Web Worker Prover

## 1. Goal & Background
Build the client-side zero-knowledge prover application (**Student Vault**) where students hold their W3C Verifiable Academic Credentials locally and generate mathematical zk-SNARK Groth16 proofs off-thread inside a Web Worker.

In AutoCert-ZKP, students never reveal their unredacted transcript, raw CGPA, failed subjects, backlogs, or private blinding secret to recruiters or servers. Instead, when an employer specifies a qualifying threshold (e.g., $CGPA \ge 7.50$), the student's browser evaluates an arithmetic circuit in WebAssembly and produces a compact ~384-byte Groth16 proof in under 1.2 seconds.

This phase implements:
1. A dedicated Web Worker (`public/workers/zk-prover.worker.js` / `src/workers/zk-prover.worker.ts`) executing `snarkjs.groth16.fullProve` off the UI thread without freezing the main application.
2. A resilient client-side orchestrator (`src/lib/zk/prover-client.ts`) streaming real-time telemetry events (`COMPILING_WITNESS`, `EVALUATING_POSEIDON`, `GENERATING_GROTH16_PROOF`), recording latency $T_{proof}$ in milliseconds, and handling safe BigInt serialization and URL-safe Base64 token encoding.
3. An award-winning, state-of-the-art Student Vault interface at `src/app/student/page.tsx` adhering to `design-taste-frontend`:
   - Preset RTMNU credential loading, `localStorage` synchronization (linking seamlessly with credentials issued in Phase 4), and JSON-LD credential file upload.
   - Interactive threshold selector with live pre-flight constraint validation.
   - Live telemetry progress bar and stopwatch.
   - Dynamic SVG/Canvas QR Code generation (`qrcode.react`) for instant recruiter smartphone verification.
   - One-click shareable verification URL (`/verify?data=<token>`), JSON export, and instant verifier routing.
4. Comprehensive automated testing in `scripts/test-student-prover.ts`.

---

## 2. Skills Consulted
- `.agents/skills/design-taste-frontend/SKILL.md`: Art direction for web applications, modern dark slate palette, typography (Inter / Outfit, JetBrains Mono for cryptographic commitments and public signals), glassmorphism, responsive cards, micro-animations, and anti-slop guidelines.
- `.agents/skills/vercel-react-best-practices/SKILL.md`: Web Worker offloading, client-side rendering boundaries (`"use client"`, `dynamic` imports for browser-only APIs), avoiding waterfalls, safe localStorage synchronization, and responsive state transitions.
- `.agents/skills/check/SKILL.md` & `.agents/skills/test/SKILL.md`: Rigorous unit/integration testing of proof generation, signal validation, and edge-case handling.
- Next.js 16 Bundled Documentation (`node_modules/next/dist/docs/`): Dynamic client imports, Turbopack compatibility, and static asset streaming.

---

## 3. Decisions & Assumptions
1. **Web Worker Architecture & Asset Serving:**
   - In Next.js 16 with Turbopack, loading heavy cryptographic CJS/ESM libraries inside workers can encounter bundling hurdles.
   - We place `public/zk/snarkjs.min.js` (copied from `node_modules/snarkjs/build/snarkjs.min.js`) and host a dedicated worker script `public/workers/zk-prover.worker.js`.
   - The worker executes `self.importScripts('/zk/snarkjs.min.js')` and runs `snarkjs.groth16.fullProve` with `/zk/academic_verifier.wasm` and `/zk/circuit_final.zkey`.
   - The orchestrator (`src/lib/zk/prover-client.ts`) encapsulates worker lifecycle, timeouts, telemetry callbacks, and provides a direct fallback if workers are unsupported in certain environments.
2. **BigInt Serialization & URL-Safe Encoding:**
   - Groth16 proofs and field elements in SnarkJS contain `BigInt` objects. Standard `JSON.stringify` throws `TypeError: Do not know how to serialize a BigInt`.
   - We implement a custom replacer and reviver to serialize BigInts to strings.
   - The final proof payload is packaged into a compressed, URL-safe Base64 token for seamless sharing via URL parameters (`/verify?data=...`) or QR code.
3. **Data Minimization Guarantee (Strict Privacy Boundary):**
   - The Student Vault runs 100% on the client. Neither `actualCgpaScaled` nor `studentSecret` are transmitted over the network or included in the proof payload.
   - Only the public threshold, the Poseidon commitment, and the Groth16 proof coordinates ($\pi_A \in G_1, \pi_B \in G_2, \pi_C \in G_1$) are shared.
4. **Preset Credential Integration:**
   - For judge demonstrations at Avishkar 2026-27, the vault offers one-click loading of preset credentials:
     1. Rajesh S. Raut (8.45 CGPA - Distinction)
     2. Snehal M. Deshmukh (7.60 CGPA - First Class)
     3. Tanmay K. Agrawal (9.15 CGPA - Honours)
     4. Under-threshold test credential (6.20 CGPA to demonstrate that circuit constraints comp.out === 1 properly reject false claims)
   - In addition, it detects credentials recently issued via `/issue` stored in `localStorage`.
5. **QR Code Engine:**
   - Use `qrcode.react` (SVG & Canvas renderer) to display scannable QR codes optimized for mobile phone cameras.

---

## 4. Files to Create / Touch
- `public/zk/snarkjs.min.js`: Pre-bundled SnarkJS library for browser & Web Worker execution.
- `public/workers/zk-prover.worker.js`: Dedicated Web Worker script computing Groth16 proofs and emitting telemetry events.
- `src/lib/types/proof.ts`: TypeScript schemas and types for Groth16 proofs, proof payloads, worker messages, and telemetry stages.
- `src/lib/zk/prover-client.ts`: High-level client API orchestrating Web Worker execution, latency tracking, and Base64 serialization.
- `src/app/student/page.tsx`: Premium Student Vault page featuring credential management, threshold inputs, live witness telemetry, and dynamic QR code generation.
- `src/components/Navbar.tsx`: Shared navigation bar connecting University Issuer (`/issue`), Student Vault (`/student`), and Verifier (`/verify`).
- `scripts/test-student-prover.ts`: Automated integration test verifying proof generation, serialization, and roundtrip verification.
- `package.json`: Add `prover:test` script.
- `docs/scope/scope.md`: Update Phase 5 status to `in-progress` and then `done`.

---

## 5. Security & Privacy Considerations
- **Zero Server Compute / Zero PII Transmission:** The entire witness computation occurs inside the local Web Worker. No private credential data ever touches a network interface.
- **Proof Tamper Resistance:** The proof proves mathematically that `Poseidon(actualCgpaScaled, studentSecret) == expectedCommitment` and `actualCgpaScaled >= thresholdScaled`. Any tampering with public signals or threshold invalidates the pairing equation $e(A, B) = e(\alpha, \beta) + \dots$.
- **Field Element Sanitization:** All numbers and secrets are sanitized against the BN128 scalar field bounds.

---

## 6. Acceptance Criteria
- [ ] `public/zk/snarkjs.min.js` and `public/workers/zk-prover.worker.js` are configured and accessible via static routing.
- [ ] `src/lib/types/proof.ts` defines complete TypeScript types for proofs, payloads, and worker communication.
- [ ] `src/lib/zk/prover-client.ts` generates Groth16 proofs off-thread, emits real-time telemetry steps, and serializes payloads without BigInt errors.
- [ ] `src/app/student/page.tsx` renders an award-winning UI with preset credentials, custom upload, threshold slider, live telemetry progress, dynamic QR code, and copyable URL.
- [ ] Proving latency on standard hardware is $< 1.2\text{s}$ (meeting Avishkar UG target).
- [ ] Under-qualified inputs (e.g. threshold > actual CGPA) gracefully show failure without crashing the UI.
- [ ] `npm run prover:test` passes 100% of tests.
- [ ] `npm run build` and `npm run lint` compile cleanly with zero errors.

---

## 7. Verification Steps
1. Run `npm run prover:test` to verify worker payload generation, BigInt serialization, and cryptographic proof verification.
2. Run `npm run build` to verify Next.js 16 App Router build and TypeScript compilation.
3. Start `npm run dev` and open `/student` in browser:
   - Select preset credential (8.45 CGPA) and threshold 7.50.
   - Click "Generate Zero-Knowledge Proof".
   - Verify live witness telemetry progress and recorded latency ($< 1.2\text{s}$).
   - Inspect generated QR code and copyable share URL.
   - Test threshold 9.00 and verify graceful rejection.
