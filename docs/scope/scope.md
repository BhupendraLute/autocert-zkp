# Scope: AutoCert-ZKP

Verifiable Academic Credential Ledger with Client-Side Zero-Knowledge Redaction for Avishkar 2026-27 (RTMNU). Eliminates document tampering and protects student privacy by proving academic eligibility (e.g., CGPA thresholds) via client-side Groth16 WebAssembly zk-SNARKs and an immutable Poseidon Merkle ledger at zero cost.

**Build approach:** Tracer Bullet (thin end-to-end cryptographic proof pipeline from browser prover to verifier first, then thicken with AI ingestion and Supabase registry).
**Workflow:** Beta (check verify, then test). The project default level of rigor. `/architect` is the recommended first stop for features with load-bearing decisions, but skippable when you already know the build. Any feature can carry its own tag (e.g. `· GA`) to do more or less.

_These are recommendations to keep your build orderly, not requirements. Skip anything that does not fit: if you already know how to build a feature, use `/develop` and skip `/architect`. You decide when a feature is `done`._

## At a glance

| # | Feature | Phase | Status |
|---|---------|-------|--------|
| 1 | Stack Foundation & Scaffolding | Foundation | done |
| 2 | Circom ZK Circuit & Cryptographic Ceremony | Foundation | done |
| 3 | Supabase Ledger & Merkle Root Registry | Foundation | done |
| 4 | OpenCode Zen AI Parser & W3C Credential Schema | Slice 1 | done |
| 5 | Student Vault & Web Worker Prover | Slice 1 | done |
| 6 | Public Verifier Portal & Sub-10ms Engine | Slice 2 | done |
| 7 | Benchmarking Suite & Avishkar Deliverables | Slice 2 | in-progress |

---

## Foundations

### 1. Stack Foundation & Scaffolding · done
Scaffold the latest Next.js 16 (16.4+) App Router application with React 19 using CLI commands, configure WebAssembly/Web Worker compilation, and install core cryptographic, AI SDK, and styling packages.
**Done when:** `create-next-app@latest` initializes Next.js 16.4+ via terminal, `next.config.ts` supports WASM/workers, all core dependencies (including Vercel AI SDK) are installed, and `npm run dev` boots cleanly.
- [x] Scaffold via CLI: `/develop scaffold`
   - [x] Run `npx create-next-app@latest` in terminal with non-interactive flags (Next.js 16.4+, React 19)
   - [x] Install `snarkjs`, `circomlibjs`, `lucide-react`, `clsx`, `tailwind-merge`, `@supabase/supabase-js`, `qrcode`, `ai`, `@ai-sdk/openai`, `zod`
   - [x] Configure `next.config.ts` for WebAssembly and Web Worker support
- [x] Check dev server & production build runs clean: `/test`
code in `./`

### 2. Circom ZK Circuit & Cryptographic Ceremony · done
Author arithmetic circuit `academic_verifier.circom`, execute bn128 Powers of Tau ceremony, compile to R1CS/WASM, and export Groth16 zkey and verification key.
**Done when:** `academic_verifier.circom` compiles to R1CS and WebAssembly, generates WASM/zkey into `public/zk/`, and a smoke test proof verifies in <10ms.
- [x] Design circuit & ceremony (spec): `/architect zk circuit`
- [x] Build it: `/develop zk circuit`
   - [x] Write `circuits/academic_verifier.circom` with 16-bit comparator & Poseidon(2) commitment
   - [x] Run ceremony scripts generating `pot12_prepared.ptau`, `circuit_final.zkey`, `verification_key.json`
   - [x] Place compiled WebAssembly and keys into `public/zk/`
- [x] Verify circuit constraints & Groth16 proof: `/check verify zk circuit`
- [x] Test it: `/test zk circuit`
code in `circuits/`, `scripts/`, `public/zk/`

### 3. Supabase Ledger & Merkle Root Registry · done
PostgreSQL schema for institutional public keys, Merkle roots, and revocation registry with strict RLS and indexing.
**Done when:** Supabase tables (`institutions`, `merkle_roots`, `revocations`) exist with RLS policies, and server actions can query roots without leaks.
- [x] Design schema & security policies (spec): `/architect supabase ledger`
- [x] Build it: `/develop supabase ledger`
   - [x] Draft and apply migration for institutions, roots, and revocation tables
   - [x] Configure Supabase client in `src/lib/supabase/` with server/client boundaries
   - [x] Implement query utilities for root validation and revocation check
- [x] Verify RLS & queries: `/check verify supabase ledger`
- [x] Test it: `/test supabase ledger`
code in `supabase/migrations/`, `src/lib/supabase/`, `src/lib/types/`, `scripts/test-ledger.ts`

---

## Slice 1: Credential Issuance & Client-Side Prover

### 4. Vercel AI SDK & OpenCode Zen Credential Ingestion Agent · done
Ingest unstructured university grade cards into standardized W3C JSON-LD credential schemas using Vercel AI SDK (`generateText` + `Output.object`) connected to OpenCode Zen (`opencode/big-pickle`), with interactive AI audit support and resilient heuristic parsing.
**Done when:** Raw marksheet text is parsed via Vercel AI SDK into a strictly validated Zod W3C JSON-LD schema with scaled integer CGPA and client-side Poseidon commitment.
- [x] Design AI agent & VC schema (spec): `/architect ai parser`
- [x] Build it: `/develop ai parser`
   - [x] Configure OpenCode Zen provider with Vercel AI SDK (`createOpenAI` with custom baseURL)
   - [x] Define Zod schemas and TypeScript types in `src/lib/types/credential.ts`
   - [x] Implement Server Action `src/app/actions/parse-credential.ts` using `generateText` with `Output.object`
   - [x] Build client-side Poseidon hashing & blinding salt generator in `src/lib/crypto/poseidon.ts`
   - [x] Create Authority Ingestion & Audit Portal at `src/app/issue/page.tsx`
- [x] Verify schema extraction accuracy: `/check verify ai parser`
- [x] Test it: `/test ai parser`
code in `src/lib/types/`, `src/lib/crypto/`, `src/lib/ai/`, `src/app/actions/`, `src/app/issue/`, `scripts/test-credential-ingestion.ts`

### 5. Student Vault & Web Worker Prover · done
Client-side zero-knowledge prover UI executing inside a dedicated Web Worker to generate Groth16 zk-SNARK proofs in under 1.2s on mobile devices.
**Done when:** Student can enter a threshold, see live witness telemetry, generate a 384B Groth16 proof via WASM Worker without UI lag, and generate a dynamic QR / shareable URL.
- [x] Design student vault UI & worker (spec): `/architect student vault`
- [x] Build it: `/develop student vault`
   - [x] Implement `public/workers/zk-prover.worker.js` & `src/workers/zk-prover.worker.ts` for off-thread `snarkjs.groth16.fullProve`
   - [x] Build `app/student/page.tsx` adhering to `design-taste-frontend`
   - [x] Add dynamic QR code generator (`qrcode.react`) and Base64 URL payload generator
- [x] Verify proof generation latency & UI responsiveness: `/check verify student vault`
- [x] Test it: `/test student vault`
code in `src/app/student/`, `public/workers/`, `src/workers/`, `src/lib/zk/`, `scripts/test-student-prover.ts`

---

## Slice 2: Verification Engine & Avishkar Deliverables

### 6. Public Verifier Portal & Sub-10ms Engine · done
Instant edge verification portal decoding Base64 Groth16 payloads, validating pairings against `verification_key.json`, and checking registry roots in <10ms.
**Done when:** Opening `/verify?data=<token>` or scanning QR parses public signals, executes `snarkjs.groth16.verify`, and renders a verified badge with 0% PII revealed.
- [x] Design verifier portal (spec): `/architect verifier portal`
- [x] Build it: `/develop verifier portal`
   - [x] Build `app/verify/page.tsx` with dynamic payload decoder and camera QR scanner fallback
   - [x] Wire Groth16 pairing check and Supabase root verification
   - [x] Implement tamper detection alerts and cryptographic authenticity certificate card
- [x] Verify pairing check speed and invalid proof rejection: `/check verify verifier portal`
- [x] Test it: `/test verifier portal`
code in `src/app/verify/`, `src/lib/zk/`, `src/lib/types/verifier.ts`, `src/lib/data/mock-proofs.ts`, `scripts/test-verifier.ts`

### 7. Benchmarking Suite & Avishkar Deliverables · in-progress
Automated empirical benchmarking across simulated device profiles and generation of Avishkar 2026-27 presentation artifacts (poster figures, tables, demo script).
**Done when:** Quantitative benchmark table confirms $T_{proof} < 1.2s$, $T_{verify} < 10ms$, payload = 384B, and the live demonstration script runs flawlessly.
- [x] Design benchmark harness (spec): `/architect benchmark suite`
- [x] Build it: `/develop benchmark suite`
   - [x] Implement `scripts/benchmark.ts` measuring memory, proving time, and verification time
   - [x] Generate Avishkar presentation tables, comparison charts, and live demo script
- [ ] Verify benchmark metrics: `/check verify benchmark suite`
- [ ] Test it: `/test benchmark suite`
code in `scripts/benchmark.ts`, `docs/benchmarks/`, `docs/avishkar/`, `src/app/benchmarks/`, `src/lib/zk/benchmark-runner.ts`, `src/lib/types/benchmark.ts`

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
