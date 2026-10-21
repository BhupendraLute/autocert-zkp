-- AutoCert-ZKP: Verifiable Academic Credential Ledger Schema
-- Avishkar 2026-27 (RTMNU) Engineering & Technology Category
-- Migration: 20261021000000_create_ledger_tables.sql

-- Enable pgcrypto for gen_random_uuid() if not enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. Table: institutions
-- Stores accredited university authorities, public keys, and metadata.
-- ============================================================================
CREATE TABLE IF NOT EXISTS institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    public_key TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 2. Table: merkle_roots
-- Stores cryptographic Merkle roots anchored by university registrars.
-- Each root represents a committed batch of student credentials.
-- ============================================================================
CREATE TABLE IF NOT EXISTS merkle_roots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    root_hash TEXT NOT NULL UNIQUE,
    batch_id TEXT NOT NULL,
    signed_by TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_merkle_roots_institution_root UNIQUE (institution_id, root_hash)
);

-- ============================================================================
-- 3. Table: revocations
-- Stores revoked credential commitment hashes (e.g., student expelled or re-evaluated).
-- Verifier queries this table to verify non-revocation without knowing identity.
-- ============================================================================
CREATE TABLE IF NOT EXISTS revocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commitment_hash TEXT NOT NULL UNIQUE,
    reason TEXT NOT NULL,
    revoked_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 4. High-Performance B-tree Indexes
-- Follows supabase-postgres-best-practices for sub-millisecond verifier queries
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_institutions_code ON institutions(code);
CREATE INDEX IF NOT EXISTS idx_merkle_roots_root_hash ON merkle_roots(root_hash);
CREATE INDEX IF NOT EXISTS idx_merkle_roots_institution_id ON merkle_roots(institution_id);
CREATE INDEX IF NOT EXISTS idx_revocations_commitment_hash ON revocations(commitment_hash);

-- ============================================================================
-- 5. Row Level Security (RLS) Policies
-- The ledger is a public transparency registry:
-- - Anyone (anon, authenticated) can SELECT roots and revocation records.
-- - Public INSERT/UPDATE/DELETE are strictly prohibited (service_role only).
-- ============================================================================
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE merkle_roots ENABLE ROW LEVEL SECURITY;
ALTER TABLE revocations ENABLE ROW LEVEL SECURITY;

-- Institutions Public Read
CREATE POLICY "Allow public read access to institutions"
    ON institutions FOR SELECT
    TO anon, authenticated
    USING (true);

-- Merkle Roots Public Read
CREATE POLICY "Allow public read access to merkle_roots"
    ON merkle_roots FOR SELECT
    TO anon, authenticated
    USING (true);

-- Revocations Public Read
CREATE POLICY "Allow public read access to revocations"
    ON revocations FOR SELECT
    TO anon, authenticated
    USING (true);

-- ============================================================================
-- 6. Initial Seed Data (Avishkar 2026-27 RTMNU Demo)
-- ============================================================================
INSERT INTO institutions (id, name, code, public_key)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Rashtrasant Tukadoji Maharaj Nagpur University',
    'RTMNU',
    'ed25519_rtmnu_authority_pk_8f43a9b2c1e7d6'
) ON CONFLICT (code) DO NOTHING;

-- Initial Merkle root anchor for demo batch
INSERT INTO merkle_roots (institution_id, root_hash, batch_id, signed_by)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    '192847192837192837192837192837',
    'BATCH-2026-BTECH-CSE-FINAL',
    'Registrar RTMNU Cryptographic Office'
) ON CONFLICT (institution_id, root_hash) DO NOTHING;
