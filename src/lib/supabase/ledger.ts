/**
 * AutoCert-ZKP Ledger & Merkle Root Registry
 * Avishkar 2026-27 (RTMNU) Engineering & Technology Category
 * 
 * Provides cryptographic validation against the Supabase PostgreSQL ledger:
 * - Institutional public keys
 * - Anchored Merkle roots
 * - Real-time non-revocation checks
 * Includes seamless mock fallback for zero-dependency local testing.
 */

import { getSupabaseClient, isSupabaseConfigured } from './client';
import { getSupabaseAdminClient, isSupabaseAdminConfigured } from './admin';
import {
  Institution,
  MerkleRoot,
  Revocation,
  LedgerVerificationResult,
} from '../types/database';

// ============================================================================
// In-Memory Mock Store (Active only when Supabase is unconfigured in non-prod)
// ============================================================================
const MOCK_INSTITUTIONS: Institution[] = [
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    name: 'Rashtrasant Tukadoji Maharaj Nagpur University',
    code: 'RTMNU',
    public_key: 'ed25519_rtmnu_authority_pk_8f43a9b2c1e7d6',
    created_at: new Date('2026-01-01T00:00:00Z').toISOString(),
  },
];

const MOCK_MERKLE_ROOTS: MerkleRoot[] = [
  {
    id: 'b1ffcd00-1d1c-4fe9-cc7e-7cc0ce491b22',
    institution_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    root_hash: '192847192837192837192837192837',
    batch_id: 'BATCH-2026-BTECH-CSE-FINAL',
    signed_by: 'Registrar RTMNU Cryptographic Office',
    created_at: new Date('2026-01-02T00:00:00Z').toISOString(),
  },
];

const MOCK_REVOCATIONS: Revocation[] = [
  {
    id: 'c2eedd11-2e2d-5ff0-dd8f-8dd1df502c33',
    commitment_hash: '999999999999999999999999999999',
    reason: 'Academic credential revoked due to record revision',
    revoked_at: new Date('2026-02-01T00:00:00Z').toISOString(),
  },
  {
    id: 'd3ffee22-3f3e-6001-ee90-9ee2e0613d44',
    commitment_hash: '11792700784369162271458023948725715768482259903023295550466684013241410379466',
    reason: 'Credential revoked: Disciplinary council resolution #2026/D-41',
    revoked_at: new Date('2026-03-01T00:00:00Z').toISOString(),
  },
];

/**
 * Enforces backend consistency between public reads and admin writes.
 * Rejects operations if public client uses Supabase while admin attempts mock writes, or vice versa.
 */
function checkBackendConsistency(target: 'read' | 'write'): void {
  const publicConfigured = isSupabaseConfigured();
  const adminConfigured = isSupabaseAdminConfigured();

  if (target === 'write' && publicConfigured && !adminConfigured) {
    throw new Error(
      'Admin write operation rejected: public client is configured with Supabase while admin service_role client is unavailable. Backend mismatch (mock write with live read) is forbidden.'
    );
  }

  if (target === 'read' && !publicConfigured && adminConfigured) {
    throw new Error(
      'Public read operation rejected: admin client is configured with Supabase while public client is unavailable. Backend mismatch is forbidden.'
    );
  }
}

/**
 * Guards mock fallback access against production usage and backend inconsistencies.
 */
function ensureMockAllowed(operation: string, target: 'read' | 'write' = 'read'): void {
  checkBackendConsistency(target);

  const isProduction = process.env.NODE_ENV === 'production';
  const allowMockInProd = process.env.ALLOW_MOCK_LEDGER === 'true';

  if (isProduction && !allowMockInProd) {
    throw new Error(
      `Ledger operation '${operation}' failed: Supabase client is unconfigured and mock ledger fallback is disabled in production environments.`
    );
  }
}

// ============================================================================
// Public Ledger Query Functions (Usable on Edge / Client / Server)
// ============================================================================

/**
 * Fetch institution record by unique university code (e.g. 'RTMNU')
 */
export async function getInstitutionByCode(code: string): Promise<Institution | null> {
  checkBackendConsistency('read');
  const client = getSupabaseClient();

  if (client) {
    const { data, error } = await client
      .from('institutions')
      .select('*')
      .eq('code', code.toUpperCase())
      .maybeSingle();

    if (error) {
      throw new Error(`Supabase query error (getInstitutionByCode): ${error.message}`);
    }
    return data;
  }

  // Mock Fallback
  ensureMockAllowed('getInstitutionByCode', 'read');
  return MOCK_INSTITUTIONS.find((inst) => inst.code.toUpperCase() === code.toUpperCase()) || null;
}

/**
 * Validate whether a Merkle root exists in the institutional ledger.
 * Optionally validates that the root belongs to a specific institutionCode.
 */
export async function verifyMerkleRoot(
  rootHash: string,
  institutionCode?: string
): Promise<{ isValid: boolean; institution: Institution | null; root: MerkleRoot | null }> {
  checkBackendConsistency('read');
  const client = getSupabaseClient();

  if (client) {
    const { data: root, error: rootError } = await client
      .from('merkle_roots')
      .select('*')
      .eq('root_hash', rootHash)
      .maybeSingle();

    if (rootError) {
      throw new Error(`Supabase query error (verifyMerkleRoot): ${rootError.message}`);
    }

    if (!root) {
      return { isValid: false, institution: null, root: null };
    }

    const { data: institution, error: instError } = await client
      .from('institutions')
      .select('*')
      .eq('id', root.institution_id)
      .maybeSingle();

    if (instError) {
      throw new Error(`Supabase query error (verifyMerkleRoot institution lookup): ${instError.message}`);
    }

    // If an expected institution code was specified, verify it matches
    if (institutionCode && institution?.code.toUpperCase() !== institutionCode.toUpperCase()) {
      return { isValid: false, institution: null, root: null };
    }

    return {
      isValid: true,
      institution: institution || null,
      root: root,
    };
  }

  // Mock Fallback
  ensureMockAllowed('verifyMerkleRoot', 'read');
  const foundRoot = MOCK_MERKLE_ROOTS.find((r) => r.root_hash === rootHash);
  if (!foundRoot) {
    return { isValid: false, institution: null, root: null };
  }

  const foundInstitution =
    MOCK_INSTITUTIONS.find((i) => i.id === foundRoot.institution_id) || null;

  if (institutionCode && foundInstitution?.code.toUpperCase() !== institutionCode.toUpperCase()) {
    return { isValid: false, institution: null, root: null };
  }

  return {
    isValid: true,
    institution: foundInstitution,
    root: foundRoot,
  };
}

/**
 * Check whether a commitment hash is listed in the revocation registry.
 */
export async function checkRevocation(
  commitmentHash: string
): Promise<{ isRevoked: boolean; record: Revocation | null }> {
  checkBackendConsistency('read');
  const client = getSupabaseClient();

  if (client) {
    const { data, error } = await client
      .from('revocations')
      .select('*')
      .eq('commitment_hash', commitmentHash)
      .maybeSingle();

    if (error) {
      throw new Error(`Supabase query error (checkRevocation): ${error.message}`);
    }

    if (!data) {
      return { isRevoked: false, record: null };
    }

    return { isRevoked: true, record: data };
  }

  // Mock Fallback
  ensureMockAllowed('checkRevocation', 'read');
  const found = MOCK_REVOCATIONS.find((r) => r.commitment_hash === commitmentHash);
  return {
    isRevoked: !!found,
    record: found || null,
  };
}

/**
 * Complete Ledger Verification Pipeline:
 * Validates root existence via rootHash, ensures zero revocation via commitmentHash,
 * and returns institutional metadata.
 */
export async function verifyCredentialLedgerState(
  commitmentHash: string,
  rootHash: string,
  institutionCode?: string
): Promise<LedgerVerificationResult> {
  // 1. Check Revocation First using the student's leaf commitment hash
  const revocationCheck = await checkRevocation(commitmentHash);
  if (revocationCheck.isRevoked) {
    return {
      isValidRoot: false,
      isRevoked: true,
      revocationRecord: revocationCheck.record,
      message: `Credential Revoked: ${revocationCheck.record?.reason || 'Status revoked by institution'}`,
    };
  }

  // 2. Check Merkle Root Registry using the institutional batch root hash
  const rootCheck = await verifyMerkleRoot(rootHash, institutionCode);
  if (!rootCheck.isValid) {
    return {
      isValidRoot: false,
      isRevoked: false,
      message: 'Merkle root hash not registered on accredited institutional ledger.',
    };
  }

  return {
    isValidRoot: true,
    isRevoked: false,
    institution: rootCheck.institution,
    rootRecord: rootCheck.root,
    message: `Cryptographically verified against ${rootCheck.institution?.name || 'Accredited Authority'} registry.`,
  };
}

// ============================================================================
// Privileged Server Operations (Protected Admin Functions)
// ============================================================================

/**
 * Anchors a new Merkle root to the ledger.
 * Requires server-side execution with service_role permissions.
 */
export async function publishMerkleRoot(params: {
  institutionCode: string;
  rootHash: string;
  batchId: string;
  signedBy: string;
}): Promise<MerkleRoot> {
  checkBackendConsistency('write');
  const admin = getSupabaseAdminClient();

  if (admin) {
    const { data: inst, error: instError } = await admin
      .from('institutions')
      .select('id')
      .eq('code', params.institutionCode.toUpperCase())
      .single();

    if (instError || !inst) {
      throw new Error(`Institution code '${params.institutionCode}' not found.`);
    }

    const { data, error } = await admin
      .from('merkle_roots')
      .insert({
        institution_id: inst.id,
        root_hash: params.rootHash,
        batch_id: params.batchId,
        signed_by: params.signedBy,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to publish Merkle root: ${error.message}`);
    }

    return data;
  }

  // Mock Fallback
  ensureMockAllowed('publishMerkleRoot', 'write');
  const inst = MOCK_INSTITUTIONS.find(
    (i) => i.code.toUpperCase() === params.institutionCode.toUpperCase()
  );
  if (!inst) {
    throw new Error(`Mock institution '${params.institutionCode}' not found.`);
  }

  const newRoot: MerkleRoot = {
    id: `mock-root-${Date.now()}`,
    institution_id: inst.id,
    root_hash: params.rootHash,
    batch_id: params.batchId,
    signed_by: params.signedBy,
    created_at: new Date().toISOString(),
  };

  MOCK_MERKLE_ROOTS.push(newRoot);
  return newRoot;
}

/**
 * Enters a revoked commitment hash into the revocation registry.
 * Requires server-side execution with service_role permissions.
 */
export async function revokeCredential(params: {
  commitmentHash: string;
  reason: string;
}): Promise<Revocation> {
  checkBackendConsistency('write');
  const admin = getSupabaseAdminClient();

  if (admin) {
    const { data, error } = await admin
      .from('revocations')
      .insert({
        commitment_hash: params.commitmentHash,
        reason: params.reason,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to record revocation: ${error.message}`);
    }

    return data;
  }

  // Mock Fallback
  ensureMockAllowed('revokeCredential', 'write');
  const newRevocation: Revocation = {
    id: `mock-rev-${Date.now()}`,
    commitment_hash: params.commitmentHash,
    reason: params.reason,
    revoked_at: new Date().toISOString(),
  };

  MOCK_REVOCATIONS.push(newRevocation);
  return newRevocation;
}

/**
 * Deletes a Merkle root by ID (used for test teardown and administrative batch cleanup).
 */
export async function deleteMerkleRoot(id: string): Promise<void> {
  checkBackendConsistency('write');
  const admin = getSupabaseAdminClient();

  if (admin) {
    const { error } = await admin.from('merkle_roots').delete().eq('id', id);
    if (error) {
      throw new Error(`Failed to delete Merkle root: ${error.message}`);
    }
    return;
  }

  ensureMockAllowed('deleteMerkleRoot', 'write');
  const index = MOCK_MERKLE_ROOTS.findIndex((r) => r.id === id);
  if (index !== -1) {
    MOCK_MERKLE_ROOTS.splice(index, 1);
  }
}

/**
 * Deletes a revocation record by ID (used for test teardown and administrative record restoration).
 */
export async function deleteRevocation(id: string): Promise<void> {
  checkBackendConsistency('write');
  const admin = getSupabaseAdminClient();

  if (admin) {
    const { error } = await admin.from('revocations').delete().eq('id', id);
    if (error) {
      throw new Error(`Failed to delete revocation: ${error.message}`);
    }
    return;
  }

  ensureMockAllowed('deleteRevocation', 'write');
  const index = MOCK_REVOCATIONS.findIndex((r) => r.id === id);
  if (index !== -1) {
    MOCK_REVOCATIONS.splice(index, 1);
  }
}

/**
 * Seeds demonstration records (institutions, Merkle roots, and revocations)
 * into a configured live Supabase ledger.
 * Inserts records only when absent without updating existing conflicting records,
 * preserving generated IDs, public keys, and audit details.
 */
export async function seedLiveLedger(): Promise<{ success: boolean; message: string }> {
  checkBackendConsistency('write');
  const admin = getSupabaseAdminClient();
  if (!admin) {
    return { success: false, message: 'Supabase admin client unconfigured (mock active).' };
  }

  // 1. Insert demo institutions only when absent
  for (const inst of MOCK_INSTITUTIONS) {
    const { error } = await admin
      .from('institutions')
      .upsert(inst, { onConflict: 'code', ignoreDuplicates: true });
    if (error) throw new Error(`Failed to seed institution: ${error.message}`);
  }

  // 2. Resolve live institution IDs to preserve existing database UUIDs and audit details
  const mockCodes = MOCK_INSTITUTIONS.map((i) => i.code);
  const { data: liveInstitutions, error: instLookupError } = await admin
    .from('institutions')
    .select('id, code')
    .in('code', mockCodes);

  if (instLookupError) {
    throw new Error(`Failed to resolve live institution IDs: ${instLookupError.message}`);
  }

  if (!liveInstitutions || liveInstitutions.length === 0) {
    throw new Error('Failed to resolve live institution IDs: No matching seeded institutions found.');
  }

  const instIdMap = new Map<string, string>();
  for (const liveInst of liveInstitutions) {
    instIdMap.set(liveInst.code.toUpperCase(), liveInst.id);
  }

  // 3. Insert demo Merkle roots with resolved live institution IDs only when absent
  for (const root of MOCK_MERKLE_ROOTS) {
    const mockInst = MOCK_INSTITUTIONS.find((i) => i.id === root.institution_id);
    if (!mockInst) {
      throw new Error(`Cannot seed Merkle root: Unknown mock institution ID '${root.institution_id}'.`);
    }
    const instCode = mockInst.code.toUpperCase();
    const resolvedInstId = instIdMap.get(instCode);

    if (!resolvedInstId) {
      throw new Error(`Cannot seed Merkle root: Matching live institution not found for code '${instCode}'.`);
    }

    const rootToInsert = {
      ...root,
      institution_id: resolvedInstId,
    };

    const { error } = await admin
      .from('merkle_roots')
      .upsert(rootToInsert, { onConflict: 'institution_id, root_hash', ignoreDuplicates: true });
    if (error) throw new Error(`Failed to seed Merkle root: ${error.message}`);
  }

  // 4. Insert demo revocations only when absent
  for (const rev of MOCK_REVOCATIONS) {
    const { error } = await admin
      .from('revocations')
      .upsert(rev, { onConflict: 'commitment_hash', ignoreDuplicates: true });
    if (error) throw new Error(`Failed to seed revocation: ${error.message}`);
  }

  return { success: true, message: 'Live Supabase ledger seeded successfully.' };
}

