# Implementation Prompt: Phase 3 — Supabase Ledger & Merkle Root Registry

## 1. Goal & Background
Design and implement the immutable PostgreSQL credential ledger and Merkle root registry using Supabase. The ledger anchors university cryptographic public keys, issued Merkle roots (representing batches of Poseidon credential commitments), and revocation lists.

This registry allows any verifier (recruiter, university, employer) to query and validate that a Poseidon commitment leaf originates from an accredited institutional root, and verifies that the credential has not been revoked — at ₹0 infrastructure cost with strict zero-knowledge data minimization (only public hashes and signatures touch the database, zero PII).

## 2. Skills Consulted
- `.agents/skills/supabase/SKILL.md`: Supabase client architecture, environment separation, SSR/edge conventions, and Data API security.
- `.agents/skills/supabase-postgres-best-practices/SKILL.md`: Schema modeling, type safety, optimal indexing, and Row Level Security (RLS) best practices.
- `.agents/skills/architect/SKILL.md`: Architectural boundaries between public ledger verification and client vault privacy.
- `.agents/skills/check/SKILL.md` & `.agents/skills/test/SKILL.md`: Unit test suite and query validation criteria.

## 3. Decisions & Assumptions
1. **Public Read, Admin Write (RLS):**
   - The ledger acts as a public verification registry. Public verifiers and recruiters must be able to query roots, verify institutions, and inspect revocations without authentication (`TO anon, authenticated FOR SELECT USING (true)`).
   - Writes (`INSERT`, `UPDATE`, `DELETE`) are strictly forbidden to public roles and are accessible only via `service_role` (or secure server actions) to prevent unauthorized tampering.
2. **Postgres Schema Design & B-tree Indexes:**
   - `institutions`: `id` (UUID PK), `name` (TEXT), `code` (TEXT UNIQUE), `public_key` (TEXT), `created_at` (TIMESTAMPTZ).
   - `merkle_roots`: `id` (UUID PK), `institution_id` (UUID FK -> institutions), `root_hash` (TEXT NOT NULL), `batch_id` (TEXT NOT NULL), `signed_by` (TEXT), `created_at` (TIMESTAMPTZ). Indexed on `root_hash` and `institution_id`.
   - `revocations`: `id` (UUID PK), `commitment_hash` (TEXT NOT NULL UNIQUE), `reason` (TEXT NOT NULL), `revoked_at` (TIMESTAMPTZ). Indexed on `commitment_hash`.
3. **Dual Client Pattern with Graceful Mock Fallback:**
   - `src/lib/supabase/client.ts`: Browser/Edge public client using `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - `src/lib/supabase/admin.ts`: Server-only administrative client using `SUPABASE_SERVICE_ROLE_KEY`.
   - If Supabase environment variables are missing (e.g. before initial credentials configuration), query utilities seamlessly fall back to an in-memory/mock ledger populated with default RTMNU institutional test data, preventing build or demo failures.
4. **Data Minimization Guarantee:**
   - No student name, roll number, CGPA, or secret salt is ever stored in the ledger. Only cryptographic Poseidon hashes, Merkle roots, and batch identifiers are recorded.

## 4. Files to Create/Touch
- `supabase/migrations/20261021000000_create_ledger_tables.sql`: Complete SQL migration with table definitions, foreign keys, indexes, and RLS policies.
- `src/lib/types/database.ts`: TypeScript interfaces for database tables, queries, and ledger verification outputs.
- `src/lib/supabase/client.ts`: Browser and public verifier Supabase client initialization.
- `src/lib/supabase/admin.ts`: Server-side privileged client using `service_role` key.
- `src/lib/supabase/ledger.ts`: Core query and mutation utilities (`verifyMerkleRoot`, `checkRevocation`, `getInstitutionByCode`, `publishMerkleRoot`, `revokeCredential`).
- `scripts/test-ledger.ts`: End-to-end verification script testing root lookups, revocation detection, and fallback mock behavior.
- `package.json`: Add `ledger:test` script.

## 5. Security & Privacy Considerations
- **Zero PII Exposure:** The database schema strictly prohibits storing raw transcript attributes or student secrets.
- **Service Role Key Protection:** `SUPABASE_SERVICE_ROLE_KEY` is restricted to server-side code (`admin.ts`) and never prefixed with `NEXT_PUBLIC_`.
- **BOLA / Tamper Prevention:** RLS ensures public clients cannot forge institutional roots or revoke arbitrary commitments.

## 6. Acceptance Criteria
- [ ] SQL migration file created with tables `institutions`, `merkle_roots`, and `revocations` with RLS enabled and proper indexing.
- [ ] Database TypeScript types defined in `src/lib/types/database.ts`.
- [ ] Supabase clients configured (`client.ts` and `admin.ts`) with robust environment variable detection and mock fallback.
- [ ] Ledger utility functions implemented and typed:
  - `verifyMerkleRoot(rootHash)` returns institution info and validity.
  - `checkRevocation(commitmentHash)` accurately detects revoked status.
  - `getInstitutionByCode(code)` returns institutional public key.
- [ ] Automated ledger test script passes with 100% success rate under both mock and live configurations.

## 7. Verification Steps
1. Run `npm run ledger:test` to test ledger querying, root validation, and revocation detection.
2. Run `npm run build` to verify type safety and build integrity.
