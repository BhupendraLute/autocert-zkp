# Implementation Prompt: Phase 4 — OpenCode Zen AI Parser & W3C Credential Schema

## 1. Goal & Background
Ingest unstructured university grade cards and transcripts into standardized W3C Verifiable Credentials (JSON-LD format) with an AutoCert-ZKP Zero-Knowledge cryptographic extension.

The ingestion layer serves as the University Authority's registrar bridge:
1. It parses unstructured, messy marksheet text into strictly typed academic attributes (student name, degree, institution, CGPA, graduation year, classification) using the Vercel AI SDK (`generateObject`) wired to OpenCode Zen (`opencode/big-pickle`).
2. It scales float CGPA into integer field elements ($CGPA \times 100$, e.g. $8.45 \rightarrow 845$) compatible with the Circom BN128 arithmetic circuit.
3. It generates a cryptographically secure 256-bit blinding factor (`studentSecret`) and evaluates the client-compatible Poseidon commitment $Poseidon(\text{actualCgpaScaled}, \text{studentSecret})$.
4. It structures the output into a W3C Verifiable Credential JSON-LD payload ready for client-side vault storage (Phase 5) and ledger anchoring (Phase 3).
5. It provides an intuitive, high-aesthetic Institutional Ingestion Portal for university registrars to audit transcripts and issue credentials.

## 2. Skills Consulted
- `.agents/skills/ai-sdk/SKILL.md`: Vercel AI SDK architecture, `generateObject`, OpenAI-compatible provider configuration via `createOpenAI`, structured schema extraction with Zod.
- `.agents/skills/ai-elements/SKILL.md`: Structured display patterns for AI extraction results, message components, and transcript audit views.
- `.agents/skills/streamdown/SKILL.md`: Streaming and markdown rendering styling patterns for AI analysis output.
- `.agents/skills/design-taste-frontend/SKILL.md`: Modern typography, glassmorphism, cryptographic badges (hashes in JetBrains Mono), responsive layouts, and zero-slop design aesthetics.
- `.agents/skills/check/SKILL.md` & `.agents/skills/test/SKILL.md`: Unit test suite and verification criteria.

## 3. Decisions & Assumptions
1. **Model Provider Configuration:**
   - Wire `createOpenAI` from `@ai-sdk/openai` with custom `baseURL: process.env.OPENCODE_ZEN_BASE_URL || 'https://api.opencodezen.com/v1'` and `apiKey: process.env.OPENCODE_ZEN_API_KEY`.
   - Primary model identifier: `opencode/big-pickle`.
2. **Dual-Mode AI Parser with Deterministic Fallback:**
   - In environments where `api.opencodezen.com` is unreachable (e.g., DNS unresolvable, offline Avishkar venue, or rate limits), the parser automatically falls back to an intelligent heuristic regex parser for Indian university marksheets (specifically tuned for RTMNU grade cards).
   - This prevents any live demo breakdown while retaining 100% adherence to the Vercel AI SDK `generateObject` contract.
3. **Data Minimization & Blinding Secret:**
   - The student blinding secret is generated using cryptographically secure random values ($r < \text{BN128 scalar field order}$).
   - The private fields (`actualCgpaScaled`, `studentSecret`) are encapsulated in the student's private verifiable credential and NEVER broadcast to any public ledger.
   - Only the Poseidon commitment is anchored into the institutional Merkle root on Supabase.
4. **W3C Verifiable Credentials Data Model v2.0 / v1.1:**
   - Follows standard JSON-LD structure: `@context`, `id`, `type`, `issuer`, `issuanceDate`, `credentialSubject`.
   - Extended with `zkSubject`: `{ actualCgpaScaled, studentSecret, commitment, hashAlgorithm: "Poseidon(2)" }`.
5. **UI & Registrar Workflow:**
   - Provide an interactive University Registrar Portal at `/issue` allowing registrars/judges to load preset RTMNU transcripts or paste custom text, extract credentials with live telemetry, inspect the cryptographic Poseidon hash, and download the resulting W3C JSON-LD file.

## 4. Files to Create/Touch
- `src/lib/types/credential.ts`: Zod schemas and TypeScript interfaces for raw transcript extraction, W3C Verifiable Credentials, and ZK credential subjects.
- `src/lib/crypto/poseidon.ts`: Cryptographic helper for generating 256-bit blinding secrets, CGPA scaling, and computing Poseidon sponge commitments using `circomlibjs`.
- `src/lib/ai/provider.ts`: OpenCode Zen AI provider configuration with Vercel AI SDK and fallback handling.
- `src/app/actions/parse-credential.ts`: Next.js Server Action extracting structured credentials via `generateObject` and assembling the signed W3C JSON-LD.
- `src/app/issue/page.tsx`: Premium University Authority / Credential Issuance & Audit UI with sample transcript selectors and live telemetry.
- `src/app/globals.css`: Enhanced styling for cryptographic badges and mono hash elements.
- `scripts/test-credential-ingestion.ts`: Comprehensive automated test script validating extraction, CGPA scaling, and Poseidon commitment generation.
- `package.json`: Add `credential:test` script.
- `docs/scope/scope.md`: Update Phase 4 status to done once verified.

## 5. Security & Privacy Considerations
- **Zero PII Leakage:** Public ledger anchors only the commitment. The private transcript and secret salt remain with the user.
- **BN128 Scalar Field Safety:** Ensure `studentSecret` and `actualCgpaScaled` strictly lie within the BN128 scalar field $p = 21888242871839275222246405745257275088548364400416034343698204186575808495617$.
- **Validation Bounds:** Scaled CGPA must strictly be an integer between 0 and 1000 ($0.00 \le \text{CGPA} \le 10.00$).

## 6. Acceptance Criteria
- [ ] `src/lib/types/credential.ts` defines complete Zod schemas (`RawTranscriptExtractionSchema`, `W3CCredentialSchema`) and TypeScript types.
- [ ] `src/lib/crypto/poseidon.ts` provides robust scaling, 256-bit blinding secret generation, and Poseidon hashing via `circomlibjs`.
- [ ] `src/lib/ai/provider.ts` configures OpenCode Zen provider with graceful fallback.
- [ ] Server Action `parseTranscriptAction` processes transcripts into validated W3C credentials.
- [ ] University Authority page `/issue` renders an award-winning interface with preset RTMNU transcripts, live extraction telemetry, and exportable JSON-LD.
- [ ] `npm run credential:test` runs and passes 100% of cryptographic and schema tests.
- [ ] `npm run build` passes with zero type or lint errors.

## 7. Verification Steps
1. Run `npm run credential:test` to verify Poseidon hashing, CGPA scaling, secret generation, and transcript parsing.
2. Run `npm run build` to verify Next.js 16 build and TypeScript types.
3. Test `/issue` page locally to verify user experience, preset transcript loading, and JSON-LD credential download.
