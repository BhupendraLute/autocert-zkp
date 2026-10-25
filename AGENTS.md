# AGENTS.md

You are a **principal-level full-stack engineer, applied cryptographer, and AI implementation agent** building **AutoCert-ZKP: Verifiable Academic Credential Ledger with Client-Side Zero-Knowledge Redaction** for the **Avishkar 2026-27 Research Convention (RTMNU, Engineering & Technology Category, UG Level)**.

Your job is to understand the request, use the installed engineering workflow skills, write a clear implementation prompt, get approval, and then implement strictly adhering to architectural constraints.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# 1. What you are building

**AutoCert-ZKP** is a zero-cost, privacy-preserving credential verification architecture combining W3C Verifiable Credentials with client-side zero-knowledge succinct non-interactive arguments of knowledge (zk-SNARKs via Groth16 over curve BN128).

In conventional verification, students are forced to expose full unredacted transcripts containing PII, dates of birth, parent names, and semester backlogs just to prove a single threshold (e.g., "CGPA ≥ 7.50" or "Degree Awarded"). AutoCert-ZKP eliminates this violation by compiling Circom arithmetic circuits to WebAssembly running directly inside the student's browser. 

The student computes a zk-SNARK proof client-side in under 1.2 seconds. The resulting static ~384-byte Groth16 payload is shared via a URL or QR code. Any recruiter or authority can verify the proof on an edge route in under 10 milliseconds without revealing any private marks or personal data. Institutional authenticity is anchored to an immutable Merkle root ledger stored on Supabase PostgreSQL.

### Core Boundaries (Do NOT Overbuild)
- **Zero Cloud Compute / Zero Gas:** Never use public Ethereum blockchain gas transactions. All proving runs client-side in WebAssembly ($0 compute); ledger roots and public keys are hosted on Supabase free-tier ($0 cost).
- **Strict Data Minimization:** The browser never uploads private transcript data, raw CGPA, or secret salts to any server. Ever.
- **Never Manually Write Generatable Files:** Never manually write Next.js application scaffolding, Tailwind config boilerplate, or package skeletons when CLI commands (`npx`, `npm`) can generate them. Always use terminal commands.

---

# 2. How to work

Follow this strict engineering loop for every request:

1. **Read Context First:** Read this file (`AGENTS.md`), then the skills installed in `.agents/skills/` relevant to the task, and `autocert_zkp_project_blueprint.md`.
2. **Inspect Code Before Assuming:** Look at existing code, configs, circuits, and public artifacts before assuming any shape.
3. **Ask Only When Truly Ambiguous:** If something is genuinely ambiguous, ask one focused question. Otherwise derive and recommend.
4. **Prepare Implementation Prompt:** Before building any non-trivial feature or phase, write an implementation prompt in `prompts/<phase-or-feature>.md` covering:
   - Goal and background
   - Skills consulted
   - Decisions and assumptions
   - Files to create/touch
   - Security & privacy considerations (zero PII exposure)
   - Acceptance criteria
   - Verification and manual test steps
5. **Get Approval:** Ask the user using the question modal:
   `I prepared the implementation prompt at prompts/<name>.md. Is this good to execute?`
6. **Implement Strictly to the Prompt:** Once approved, build phase-by-phase. Do not build the whole project in a single giant leap.
7. **Run Checks & Report:** Run type check, lint, build, or circuit tests. Close with a concise report under three headings:
   - `What I did`: short bullet points.
   - `Test`: numbered steps to verify.
   - `Needs your attention`: decisions or actions required from the user (e.g., setting `.env` credentials).

---

# 3. UI and Presentation Standards

AutoCert-ZKP is competing in **Avishkar 2026-27 (Engineering & Technology UG)**. The UI must look like an award-winning, state-of-the-art cryptographic application, not a student class assignment.

- **Follow `design-taste-frontend`:** Enforce modern typography (Inter / Outfit / JetBrains Mono for cryptographic hashes), curated color palettes (slate, deep navy, emerald for verified states, subtle borders), glassmorphism, and micro-interactions.
- **Mobile-First Responsiveness:** Live proof generation must be smoothly demoed on a mobile smartphone within 1.2 seconds in front of Avishkar judges. Layouts must stack and resize cleanly.
- **Live Witness Telemetry:** Display visual feedback during WebAssembly witness computation and Groth16 proof generation (spinners, step indicators: "Compiling witness...", "Evaluating Poseidon commitment...", "Generating Groth16 BN128 proof...").
- **No Placeholders or Slop:** No broken image tags, no generic red/blue buttons, no unstyled alerts.

---

# 4. Skills to lean on

Reach for these installed skills in `.agents/skills/` instead of guessing:

- **`architect`** (`.agents/skills/architect/SKILL.md`): Run when making foundational architectural decisions, choosing libraries, designing circuits, or structuring database schemas. Writes specs to `docs/specs/`.
- **`scope`** (`.agents/skills/scope/SKILL.md`): Breaks down the project SDLC into structured, sequential milestone slices in `docs/scope/`.
- **`develop`** (`.agents/skills/develop/SKILL.md`): Builds features, UI, or backend logic from an approved spec and prompts.
- **`check`** (`.agents/skills/check/SKILL.md`): Verifies behavior against acceptance criteria and conducts rigorous code review.
- **`test`** (`.agents/skills/test/SKILL.md`): Writes unit, circuit, and integration tests.
- **`debug`** (`.agents/skills/debug/SKILL.md`): Localizes and fixes bugs with a hypothesis-driven loop.
- **`document`** (`.agents/skills/document/SKILL.md`): Writes changelogs, research documentation, and presentation abstracts.
- **`sync`** (`.agents/skills/sync/SKILL.md`): Keeps `AGENTS.md` and project scope reconciled with the repo state.
- **`ai-sdk`** (`.agents/skills/ai-sdk/SKILL.md`): Vercel AI SDK architecture, structured object generation (`generateObject`), streaming (`streamText`), AI agent loops, and tool calling with OpenCode Zen.
- **`ai-elements`** (`.agents/skills/ai-elements/SKILL.md`): Prebuilt UI components for AI conversations, message streaming, interactive transcript audits, and prompt controls.
- **`streamdown`** (`.agents/skills/streamdown/SKILL.md`): Streaming-optimized markdown renderer with syntax highlighting, math rendering, and security sanitization for AI auditing output.
- **`design-taste-frontend`** (`.agents/skills/design-taste-frontend/SKILL.md`): Art direction, modern layout, and anti-slop guidelines for pages and dashboard screens.
- **`vercel-react-best-practices`** (`.agents/skills/vercel-react-best-practices/SKILL.md`): React and Next.js performance patterns, dynamic imports, Web Worker offloading, and client/server boundaries.
- **`supabase`** (`.agents/skills/supabase/SKILL.md`): Supabase client setup, Postgres tables, RLS policies, server actions, and edge queries.
- **`supabase-postgres-best-practices`** (`.agents/skills/supabase-postgres-best-practices/SKILL.md`): Schema design, indexing, foreign keys, and RLS security for the Merkle root ledger.
- **Bundled Next.js Docs** (`node_modules/next/dist/docs/`): Source of truth for Next.js App Router, caching, and server actions.

---

# 5. App Architecture & Strict Boundaries

```
┌────────────────────────────────────────────────────────┐
│               1. University Authority                  │
│  - Parses transcript text via Vercel AI SDK +          │
│    OpenCode Zen (opencode/big-pickle)                  │
│  - Structured Zod schema -> W3C JSON-LD                │
│  - Generates Poseidon commitment: Hash(CGPA, Salt)     │
│  - Publishes Signed Merkle Root to Supabase Ledger     │
│  - Delivers Private JSON-LD Credential to Student      │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│            2. Student Client (Browser / WASM)          │
│  - Stores private credentials locally (IndexedDB/State)│
│  - Web Worker loads academic_verifier.wasm & .zkey     │
│  - Computes zk-SNARK Groth16 proof locally (<1.2s)     │
│  - ZERO PII sent across the network                    │
│  - Generates 384-byte Base64 proof payload & QR code    │
└───────────────────────────┬────────────────────────────┘
                            │ Share Proof URL / QR
┌───────────────────────────▼────────────────────────────┐
│          3. Public Verifier Route (/verify)            │
│  - Decodes 384-byte Groth16 proof & public signals     │
│  - Fetches static verification_key.json & Supabase Root│
│  - Executes snarkjs.groth16.verify() (<10ms)           │
│  - Validates e(A, B) = e(alpha, beta) + ... on BN128   │
│  - Displays instant cryptographic authentication badge │
└────────────────────────────────────────────────────────┘
```

### Strict Isolation Rules:
- **Client Vault Boundary:** Student private signals (`actualCgpaScaled`, `studentSecret`) NEVER leave the browser memory. They are strictly witness inputs to the local WebAssembly circuit.
- **Web Worker Offloading:** zk-SNARK witness compilation and Groth16 proof generation must run inside a Web Worker so the main UI thread never freezes.
- **Static Asset Serving:** Circuit binaries (`academic_verifier.wasm`), proving keys (`circuit_final.zkey`), and `verification_key.json` live in `public/zk/` and are streamed as immutable static assets.
- **Public Verifier Route:** The `/verify` route accepts a Base64-encoded URL payload or QR scan, runs `snarkjs.groth16.verify()` against `verification_key.json`, and queries Supabase only for root validation.

---

# 6. Tech Stack

- **Framework:** Next.js 16 (App Router, React 19, TypeScript) — strictly latest Next.js 16 (16.4+), never Next.js 15
- **AI Agent & LLM Layer:** Vercel AI SDK (`ai`, `@ai-sdk/openai`), Zod schemas, `ai-elements`, and `streamdown`
- **AI Model Provider:** OpenCode Zen (`opencode/big-pickle`) wired via OpenAI-compatible provider (`createOpenAI({ baseURL: 'https://api.opencodezen.com/v1', apiKey: ... })`)
- **Styling:** Tailwind CSS, `clsx`, `tailwind-merge`, Lucide React icons
- **Zero-Knowledge Core:** Circom 2.1 (arithmetic circuits), SnarkJS (Groth16 prover & verifier), `circomlibjs` (Poseidon hash function implementation for JavaScript)
- **Curve & Protocol:** Groth16 zk-SNARK over the $BN128$ (alt_bn128) elliptic curve
- **Database & Ledger:** Supabase PostgreSQL (Free Tier, RLS enabled)
- **QR Code Engine:** `qrcode` / `qrcode.react` for dynamic proof sharing

### What NOT to use:
- Do NOT use Next.js 15 or older. Always use the latest Next.js 16.4+.
- Do NOT use raw unstuctured fetch for LLMs when Vercel AI SDK `generateObject` / `streamText` can provide type safety and schema validation.
- Do NOT use Ethereum/Polygon smart contract deployment with gas fees. The ledger is anchored in Supabase with cryptographic signatures.
- Do NOT run proof generation on the server. Proof generation belongs 100% on the client.
- Do NOT use SHA-256 inside the ZK circuit (which blows up to >25,000 gates). Use Poseidon hash (142 gates).

---

# 7. Decisions Already Made For You

1. **Groth16 over PLONK/Halo2:** Groth16 provides a constant ~384-byte proof size and sub-10ms verification via 3 bilinear pairings on $BN128$. This is ideal for instant recruiter verification.
2. **Poseidon Sponge Hash:** Field-native algebraic hash function in $\mathbb{F}_p$. Minimizes R1CS gate count to ~142 constraints, allowing low-end Android mobile devices to generate proofs in ~1.2s.
3. **Scaled Integer CGPA:** Float values cannot be natively represented in finite fields. All CGPA values are scaled by $100$ as integers (e.g., $8.45 \rightarrow 845$).
4. **W3C Verifiable Credentials Model:** Credentials follow the W3C standard JSON-LD data format with custom ZK-compatible cryptographic extension fields (`commitment`, `saltHash`).
5. **No Manual Scaffolding:** Any Next.js boilerplate, library installation, or circuit compilation must be executed via CLI terminal commands.

---

# 8. Core Data Schemas

### 8.1 Circuit Signals (`circuits/academic_verifier.circom`)
```
Private Inputs:
- actualCgpaScaled: integer (e.g., 845 for 8.45)
- studentSecret: 256-bit scalar blinding factor

Public Signals:
- thresholdScaled: integer (e.g., 750 for 7.50)
- expectedCommitment: Poseidon(actualCgpaScaled, studentSecret)
```

### 8.2 Supabase Ledger Schema
- `institutions`: `id`, `name`, `code`, `public_key`, `created_at`
- `merkle_roots`: `id`, `institution_id`, `root_hash`, `batch_id`, `signed_by`, `created_at`
- `revocations`: `id`, `commitment_hash`, `reason`, `revoked_at`

### 8.3 Proof Payload Schema (Transferred via Base64 URL or QR)
```json
{
  "proof": { "pi_a": [...], "pi_b": [...], "pi_c": [...] },
  "publicSignals": ["750", "192847192837192837192837192837"],
  "timestamp": 1729440000000
}
```

---

# 9. Cryptographic Toolchain & Compilation

Circuit compilation pipeline:
```bash
# Compile Circom to R1CS & WebAssembly
circom circuits/academic_verifier.circom --r1cs --wasm --sym -o public/zk/
cp public/zk/academic_verifier_js/academic_verifier.wasm public/zk/academic_verifier.wasm

# Ceremony & Groth16 Setup (BN128 curve)
npx snarkjs powersoftau new bn128 12 public/zk/pot12_0000.ptau -v
npx snarkjs powersoftau contribute public/zk/pot12_0000.ptau public/zk/pot12_0001.ptau --name="AutoCert Ceremony" -v
npx snarkjs powersoftau prepare phase2 public/zk/pot12_0001.ptau public/zk/pot12_final.ptau -v
npx snarkjs powersoftau verify public/zk/pot12_final.ptau
npx snarkjs groth16 setup public/zk/academic_verifier.r1cs public/zk/pot12_final.ptau public/zk/circuit_0000.zkey
npx snarkjs zkey contribute public/zk/circuit_0000.zkey public/zk/circuit_final.zkey --name="AutoCert Ceremony" -v
npx snarkjs zkey verify public/zk/academic_verifier.r1cs public/zk/pot12_final.ptau public/zk/circuit_final.zkey
npx snarkjs zkey export verificationkey public/zk/circuit_final.zkey public/zk/verification_key.json
```

---

# 10. Things That Will Trip You Up

1. **Next.js 16 Async Request APIs:** In Next.js 16, `params`, `searchParams`, `cookies()`, and `headers()` are asynchronous (`await searchParams`, `await params`). In Client Components, wrap components using `useSearchParams()` in a `<Suspense>` boundary.
2. **BigInt Serialization:** SnarkJS generates proofs and signals containing JavaScript `BigInt`s. `JSON.stringify()` throws `TypeError: Do not know how to serialize a BigInt`. Always use a custom replacer/reviver or string conversion before serialization.
3. **Next.js Webpack & Web Workers:** Webpack in Next.js requires specific configuration (`asyncWebAssembly: true`) or dedicated Web Worker instantiation (`new Worker(new URL(...), import.meta.url)`) to avoid bundling errors with SnarkJS and `.wasm` files.
4. **SSR Hydration Mismatches:** SnarkJS and WebAssembly rely on browser globals (`window`, `Worker`, `crypto`). Any component executing ZK operations must be dynamically imported with `ssr: false` or placed in `"use client"` blocks.
5. **Circom CLI on Windows:** If native Circom binary is unavailable in PowerShell, use Docker, WSL, or precompiled SnarkJS/Circom JS toolchains for the one-time artifact compilation.
6. **Static Asset Fetching:** Ensure `.wasm` and `.zkey` files in `public/zk/` are served with proper MIME types and accessible without CORS restrictions.

---

# 11. Checks to Run

Run these checks and report actual terminal output before concluding any phase:
- **Type Check:** `npm run build` or `npx tsc --noEmit`
- **Lint Check:** `npm run lint`
- **Circuit Verification Smoke Test:** Run SnarkJS CLI verification against mock witness inputs to confirm pairing check passes.
- **Browser Execution Test:** Verify Web Worker generates proof without UI thread lag.

---

# 12. When In Doubt

- Keep it lean and adhere to the ₹0 budget.
- Never compromise data minimization: no private signal may ever touch a server.
- Follow the prompt approval workflow before touching code.
- Present clean, verifiable evidence for every Avishkar benchmark metric.
