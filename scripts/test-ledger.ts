/**
 * AutoCert-ZKP Ledger & Merkle Root Registry Smoke Test
 * Avishkar 2026-27 (RTMNU) Engineering & Technology Category
 */

import {
  getInstitutionByCode,
  verifyMerkleRoot,
  checkRevocation,
  verifyCredentialLedgerState,
  publishMerkleRoot,
  revokeCredential,
  deleteMerkleRoot,
  deleteRevocation,
} from '../src/lib/supabase/ledger';
import { isSupabaseConfigured } from '../src/lib/supabase/client';
import { isSupabaseAdminConfigured } from '../src/lib/supabase/admin';

async function runLedgerSmokeTest() {
  console.log('================================================================');
  console.log(' AutoCert-ZKP: Supabase Ledger & Merkle Root Registry Test');
  console.log('================================================================');
  console.log(`Live Supabase (Public)   : ${isSupabaseConfigured() ? 'YES (Live Database)' : 'NO (Mock Fallback Active)'}`);
  console.log(`Live Supabase (Admin)    : ${isSupabaseAdminConfigured() ? 'YES (Service Role Active)' : 'NO (Mock Fallback Active)'}`);

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string) {
    totalTests++;
    if (condition) {
      console.log(`  [PASS] Test ${totalTests}: ${testName}`);
      passedTests++;
    } else {
      console.error(`  [FAIL] Test ${totalTests}: ${testName}`);
      process.exitCode = 1;
    }
  }

  // 1. Institution lookup
  console.log('\n--- 1. Testing Institution Registry ---');
  const rtmnu = await getInstitutionByCode('RTMNU');
  assert(rtmnu !== null, 'Fetch institution by code (RTMNU)');
  assert(rtmnu?.name.includes('Nagpur University') === true, 'Institution name matches accredited university');
  assert(Boolean(rtmnu?.public_key), 'Institution has registered public key');

  // 2. Merkle root validation
  console.log('\n--- 2. Testing Merkle Root Anchoring & Verification ---');
  const registeredRoot = '192847192837192837192837192837';
  const validRootResult = await verifyMerkleRoot(registeredRoot);
  assert(validRootResult.isValid === true, 'Verify authentic registered Merkle root');
  assert(validRootResult.institution?.code === 'RTMNU', 'Valid root links to accredited institution');

  const rootWithInst = await verifyMerkleRoot(registeredRoot, 'RTMNU');
  assert(rootWithInst.isValid === true, 'Verify root with matching institution code (RTMNU)');

  const rootMismatchInst = await verifyMerkleRoot(registeredRoot, 'OTHER_UNIV');
  assert(rootMismatchInst.isValid === false, 'Reject root when expected institution code mismatches');

  const invalidRootResult = await verifyMerkleRoot('404040404040404040404040404040');
  assert(invalidRootResult.isValid === false, 'Reject unregistered / fraudulent Merkle root');

  // 3. Revocation status detection
  console.log('\n--- 3. Testing Revocation Registry ---');
  const nonRevokedCommitment = '102938475610293847561029384756';
  const nonRevokedResult = await checkRevocation(nonRevokedCommitment);
  assert(nonRevokedResult.isRevoked === false, 'Valid credential commitment is NOT revoked');

  const revokedCommitment = '999999999999999999999999999999';
  const revokedResult = await checkRevocation(revokedCommitment);
  assert(revokedResult.isRevoked === true, 'Revoked commitment accurately flagged as revoked');
  assert(Boolean(revokedResult.record?.reason), 'Revocation record provides reason');

  const presetRevokedCommitment = '11792700784369162271458023948725715768482259903023295550466684013241410379466';
  const presetRevokedResult = await checkRevocation(presetRevokedCommitment);
  assert(presetRevokedResult.isRevoked === true, 'Preset revoked credential accurately flagged as revoked');
  assert(Boolean(presetRevokedResult.record?.reason), 'Preset revocation record provides reason');

  // 4. Full verifier pipeline (with distinct commitmentHash and rootHash)
  console.log('\n--- 4. Testing End-to-End Verifier Pipeline ---');
  const pipelineValid = await verifyCredentialLedgerState(nonRevokedCommitment, registeredRoot);
  assert(pipelineValid.isValidRoot === true && pipelineValid.isRevoked === false, 'Pipeline accepts valid, non-revoked root with distinct commitment');

  const pipelineRevoked = await verifyCredentialLedgerState(revokedCommitment, registeredRoot);
  assert(pipelineRevoked.isRevoked === true && pipelineRevoked.isValidRoot === false, 'Pipeline rejects revoked credential');

  const pipelineUnknown = await verifyCredentialLedgerState(nonRevokedCommitment, '555555555555555555555555555555');
  assert(pipelineUnknown.isValidRoot === false && pipelineUnknown.isRevoked === false, 'Pipeline rejects unregistered hash');

  // 5. Admin mutations (Publish root & Revoke) with guaranteed teardown
  console.log('\n--- 5. Testing Admin Operations (Anchor & Revoke) ---');
  const publicConfigured = isSupabaseConfigured();
  const adminConfigured = isSupabaseAdminConfigured();

  if (publicConfigured !== adminConfigured) {
    console.log('  [SKIP] Skipping Admin Operations test: public and admin Supabase configurations differ.');
    console.log(`         (Public Configured: ${publicConfigured}, Admin Configured: ${adminConfigured})`);
  } else {
    console.log(`  Admin Mode: ${adminConfigured ? 'Live Service Role' : 'Mock Fallback'}`);
    const uniqueBatchSuffix = Date.now().toString();
    const testBatchHash = `88888888${uniqueBatchSuffix}`;
    const revokeTestHash = `77777777${uniqueBatchSuffix}`;

    let createdRootId: string | null = null;
    let createdRevocationId: string | null = null;

    try {
      const newRoot = await publishMerkleRoot({
        institutionCode: 'RTMNU',
        rootHash: testBatchHash,
        batchId: `BATCH-TEST-${uniqueBatchSuffix}`,
        signedBy: 'Dean of Academic Records RTMNU',
      });
      createdRootId = newRoot.id;
      assert(newRoot.root_hash === testBatchHash, 'Admin anchors new unique Merkle root batch');

      const verifyNewRoot = await verifyMerkleRoot(testBatchHash);
      assert(verifyNewRoot.isValid === true, 'Newly anchored root is immediately verifiable by verifiers');

      const newRevocation = await revokeCredential({
        commitmentHash: revokeTestHash,
        reason: 'Avishkar automated test revocation check',
      });
      createdRevocationId = newRevocation.id;
      assert(newRevocation.commitment_hash === revokeTestHash, 'Admin records new credential revocation');

      const verifyRevoked = await checkRevocation(revokeTestHash);
      assert(verifyRevoked.isRevoked === true, 'Newly revoked credential is immediately blocked in registry');
    } finally {
      // Teardown: Clean up test mutations so synthetic data never persists
      if (createdRootId) {
        try {
          await deleteMerkleRoot(createdRootId);
        } catch (cleanupErr) {
          console.error('  [ERROR] Teardown failed to delete synthetic Merkle root:', cleanupErr);
          process.exitCode = 1;
        }
      }

      if (createdRevocationId) {
        try {
          await deleteRevocation(createdRevocationId);
        } catch (cleanupErr) {
          console.error('  [ERROR] Teardown failed to delete synthetic revocation record:', cleanupErr);
          process.exitCode = 1;
        }
      }

      // Verify clean teardown
      try {
        const cleanedRootCheck = await verifyMerkleRoot(testBatchHash);
        assert(cleanedRootCheck.isValid === false, 'Teardown successfully cleaned up synthetic Merkle root');
      } catch (verifyErr) {
        console.error('  [ERROR] Teardown verification failed for Merkle root:', verifyErr);
        process.exitCode = 1;
      }

      try {
        const cleanedRevocationCheck = await checkRevocation(revokeTestHash);
        assert(cleanedRevocationCheck.isRevoked === false, 'Teardown successfully cleaned up synthetic revocation record');
      } catch (verifyErr) {
        console.error('  [ERROR] Teardown verification failed for revocation record:', verifyErr);
        process.exitCode = 1;
      }
    }
  }

  console.log('================================================================');
  console.log(` RESULTS: ${passedTests}/${totalTests} tests passed successfully.`);
  console.log('================================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runLedgerSmokeTest().catch((err) => {
  console.error('Smoke test failed with uncaught exception:', err);
  process.exit(1);
});
