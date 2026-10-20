# Scope: AutoCert-ZKP

Verifiable Academic Credential Ledger with Client-Side Zero-Knowledge Redaction for Avishkar 2026-27 (RTMNU). Eliminates document tampering and protects student privacy by proving academic eligibility (e.g., CGPA thresholds) via client-side Groth16 WebAssembly zk-SNARKs and an immutable Poseidon Merkle ledger at zero cost.

**Build approach:** Tracer Bullet (thin end-to-end cryptographic proof pipeline from browser prover to verifier first, then thicken with AI ingestion and Supabase registry).
**Workflow:** Beta (check verify, then test). The project default level of rigor. `/architect` is the recommended first stop for features with load-bearing decisions, but skippable when you already know the build. Any feature can carry its own tag (e.g. `· GA`) to do more or less.

_These are recommendations to keep your build orderly, not requirements. Skip anything that does not fit: if you already know how to build a feature, use `/develop` and skip `/architect`. You decide when a feature is `done`._

## At a glance

| # | Feature | Phase | Status |
|---|---------|-------|--------|
| 1 | Stack Foundation & Scaffolding | Foundation | planned |
| 2 | Circom ZK Circuit & Cryptographic Ceremony | Foundation | planned |
| 3 | Supabase Ledger & Merkle Root Registry | Foundation | planned |
| 4 | OpenCode Zen AI Parser & W3C Credential Schema | Slice 1 | planned |
| 5 | Student Vault & Web Worker Prover | Slice 1 | planned |
| 6 | Public Verifier Portal & Sub-10ms Engine | Slice 2 | planned |
| 7 | Benchmarking Suite & Avishkar Deliverables | Slice 2 | planned |

---

## Foundations

### 1. Stack Foundation & Scaffolding · needs a decision
Scaffold the latest Next.js 16 (16.4+) App Router application with React 19 using CLI commands, configure WebAssembly/Web Worker compilation, and install core cryptographic, AI SDK, and styling packages.
**Done when:** `create-next-app@latest` initializes Next.js 16.4+ via terminal, `next.config.ts` supports WASM/workers, all core dependencies (including Vercel AI SDK) are installed, and `npm run dev` boots cleanly.
- [ ] Decide the setup (spec): `/architect stack foundation`
- [ ] Scaffold via CLI: `/develop scaffold`
   - [ ] Run `npx create-next-app@latest` in terminal with non-interactive flags (Next.js 16.4+, React 19)
   - [ ] Install `snarkjs`, `circomlibjs`, `lucide-react`, `clsx`, `tailwind-merge`, `@supabase/supabase-js`, `qrcode`, `ai`, `@ai-sdk/openai`, `zod`
   - [ ] Configure `next.config.ts` for WebAssembly and Web Worker support
- [ ] Check dev server boots clean: `/test`
Spec 0001 · code in `./`

### 2. Circom ZK Circuit & Cryptographic Ceremony · needs a decision
Author arithmetic circuit `academic_verifier.circom`, execute bn128 Powers of Tau ceremony, compile to R1CS/WASM, and export Groth16 zkey and verification key.
**Done when:** `academic_verifier.circom` compiles under 150 constraints, generates WASM/zkey into `public/zk/`, and a smoke test proof verifies in <10ms.
- [ ] Design circuit & ceremony (spec): `/architect zk circuit`
- [ ] Build it: `/develop zk circuit`
   - [ ] Write `circuits/academic_verifier.circom` with 16-bit comparator & Poseidon(2) commitment
   - [ ] Run ceremony scripts generating `pot12_final.ptau`, `circuit_final.zkey`, `verification_key.json`
   - [ ] Place compiled WebAssembly and keys into `public/zk/`
- [ ] Verify circuit constraints & Groth16 proof: `/check verify zk circuit`
- [ ] Test it: `/test zk circuit`

### 3. Supabase Ledger & Merkle Root Registry · needs a decision
PostgreSQL schema for institutional public keys, Merkle roots, and revocation registry with strict RLS and indexing.
**Done when:** Supabase tables (`institutions`, `merkle_roots`, `revocations`) exist with RLS policies, and server actions can query roots without leaks.
- [ ] Design schema & security policies (spec): `/architect supabase ledger`
- [ ] Build it: `/develop supabase ledger`
   - [ ] Draft and apply migration for institutions, roots, and revocation tables
   - [ ] Configure Supabase client in `lib/supabase/` with server/client boundaries
   - [ ] Implement query utilities for root validation and revocation check
- [ ] Verify RLS & queries: `/check verify supabase ledger`
- [ ] Test it: `/test supabase ledger`

---

## Slice 1: Credential Issuance & Client-Side Prover

### 4. Vercel AI SDK & OpenCode Zen Credential Ingestion Agent · needs a decision
Ingest unstructured university grade cards into standardized W3C JSON-LD credential schemas using Vercel AI SDK (`generateObject`) connected to OpenCode Zen (`opencode/big-pickle`), with interactive AI audit support via `ai-elements` and `streamdown`.
**Done when:** Raw marksheet text is parsed via Vercel AI SDK into a strictly validated Zod W3C JSON-LD schema with scaled integer CGPA and client-side Poseidon commitment.
- [ ] Design AI agent & VC schema (spec): `/architect ai parser`
- [ ] Build it: `/develop ai parser`
   - [ ] Configure OpenCode Zen provider with Vercel AI SDK (`createOpenAI` with custom baseURL)
   - [ ] Define Zod schemas and TypeScript types in `lib/types/credential.ts`
   - [ ] Implement Server Action `app/actions/parse-credential.ts` using `generateObject`
   - [ ] Build client-side Poseidon hashing & blinding salt generator in `lib/crypto/`
- [ ] Verify schema extraction accuracy: `/check verify ai parser`
- [ ] Test it: `/test ai parser`

### 5. Student Vault & Web Worker Prover · needs a decision
Client-side zero-knowledge prover UI executing inside a dedicated Web Worker to generate Groth16 zk-SNARK proofs in under 1.2s on mobile devices.
**Done when:** Student can enter a threshold, see live witness telemetry, generate a 384B Groth16 proof via WASM Worker without UI lag, and generate a dynamic QR / shareable URL.
- [ ] Design student vault UI & worker (spec): `/architect student vault`
- [ ] Build it: `/develop student vault`
   - [ ] Implement `workers/zk-prover.worker.ts` for off-thread `snarkjs.groth16.fullProve`
   - [ ] Build `app/student/page.tsx` adhering to `design-taste-frontend`
   - [ ] Add dynamic QR code generator (`qrcode.react`) and Base64 URL payload generator
- [ ] Verify proof generation latency & UI responsiveness: `/check verify student vault`
- [ ] Test it: `/test student vault`

---

## Slice 2: Verification Engine & Avishkar Deliverables

### 6. Public Verifier Portal & Sub-10ms Engine · needs a decision
Instant edge verification portal decoding Base64 Groth16 payloads, validating pairings against `verification_key.json`, and checking registry roots in <10ms.
**Done when:** Opening `/verify?data=<token>` or scanning QR parses public signals, executes `snarkjs.groth16.verify`, and renders a verified badge with 0% PII revealed.
- [ ] Design verifier portal (spec): `/architect verifier portal`
- [ ] Build it: `/develop verifier portal`
   - [ ] Build `app/verify/page.tsx` with dynamic payload decoder and camera QR scanner fallback
   - [ ] Wire Groth16 pairing check and Supabase root verification
   - [ ] Implement tamper detection alerts and cryptographic authenticity certificate card
- [ ] Verify pairing check speed and invalid proof rejection: `/check verify verifier portal`
- [ ] Test it: `/test verifier portal`

### 7. Benchmarking Suite & Avishkar Deliverables · needs a decision
Automated empirical benchmarking across simulated device profiles and generation of Avishkar 2026-27 presentation artifacts (poster figures, tables, demo script).
**Done when:** Quantitative benchmark table confirms $T_{proof} < 1.2s$, $T_{verify} < 10ms$, payload = 384B, and the live demonstration script runs flawlessly.
- [ ] Design benchmark harness (spec): `/architect benchmark suite`
- [ ] Build it: `/develop benchmark suite`
   - [ ] Implement `scripts/benchmark.ts` measuring memory, proving time, and verification time
   - [ ] Generate Avishkar presentation tables, comparison charts, and live demo script
- [ ] Verify benchmark metrics: `/check verify benchmark suite`
- [ ] Test it: `/test benchmark suite`

---

## Deferred
Out of scope for the Avishkar competition slice, kept so the plan stays honest:
- **DigiLocker API Direct Integration**: production government API access requires institutional accreditation.
- **Multi-University Cross-Federation**: multi-tenant Merkle tree rollups across autonomous university registrars.
- **Selective Multi-Attribute Proofs**: proving both CGPA and graduation year simultaneously in a unified compound circuit.

---

## Legend
- **Next step** = the first unticked box.
- **needs a decision** = run `/architect` first; otherwise straight to `/develop`.
- **Atomic build tasks live in the spec's `## Build plan`, not here**: the scope carries only the milestone rollup.
- **Status** `planned` → `in-progress` → `done`.
- **Workflow** (header line) is the project default: **Beta** = `/check verify` then `/test`.
