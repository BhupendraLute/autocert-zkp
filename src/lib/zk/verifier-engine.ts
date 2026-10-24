/**
 * AutoCert-ZKP: Sub-10ms Cryptographic Verification Engine
 * Avishkar 2026-27 (RTMNU) Engineering & Technology Category
 * 
 * Evaluates Groth16 BN128 pairings via snarkjs in < 10ms and cross-references
 * the Poseidon commitment leaf against the Supabase Merkle ledger.
 */

import * as snarkjs from 'snarkjs';
import { ProofPayload, Groth16Proof } from '@/lib/types/proof';
import {
  VerificationResult,
  VerificationStatus,
  CryptographicVerificationResult,
  LedgerCheckResult,
  VerificationDiagnostics,
} from '@/lib/types/verifier';
import { decodeProofPayload, safeJsonParse } from '@/lib/zk/prover-client';
import { checkRevocation, verifyMerkleRoot } from '@/lib/supabase/ledger';

let cachedVKey: Record<string, unknown> | null = null;

/**
 * Loads authoritative verification key from public static asset or local filesystem (Node fallback).
 */
export async function loadVerificationKey(
  overrideKey?: Record<string, unknown>
): Promise<Record<string, unknown>> {
  if (overrideKey) return overrideKey;
  if (cachedVKey) return cachedVKey;

  // Browser environment
  if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
    try {
      const response = await fetch('/zk/verification_key.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch verification key: HTTP ${response.status}`);
      }
      cachedVKey = (await response.json()) as Record<string, unknown>;
      return cachedVKey;
    } catch (err: unknown) {
      console.error('Failed to fetch verification_key.json in browser:', err);
      throw err;
    }
  }

  // Node.js environment fallback (avoiding direct static fs import to prevent bundler polyfill warnings)
  if (typeof window === 'undefined') {
    try {
      const fs = eval('require')('fs');
      const path = eval('require')('path');
      const vKeyPath = path.resolve(process.cwd(), 'public', 'zk', 'verification_key.json');
      if (fs.existsSync(vKeyPath)) {
        cachedVKey = JSON.parse(fs.readFileSync(vKeyPath, 'utf-8'));
        return cachedVKey as Record<string, unknown>;
      }
    } catch (err: unknown) {
      console.warn('Node.js fs load fallback notice:', err);
    }
  }

  throw new Error('Verification key not found or inaccessible.');
}

/**
 * Layer 1: Groth16 Pairing Verification on Curve BN128.
 * Executes in < 10ms.
 */
export async function verifyGroth16Proof(
  proof: Groth16Proof,
  publicSignals: string[],
  vKeyOverride?: Record<string, unknown>
): Promise<CryptographicVerificationResult> {
  try {
    const vKey = await loadVerificationKey(vKeyOverride);

    if (!Array.isArray(publicSignals) || publicSignals.length < 2) {
      return {
        isCryptographicallyValid: false,
        latencyMs: 0,
        pairingChecked: false,
        threshold: 0,
        thresholdScaled: 0,
        expectedCommitment: '',
        publicSignals: publicSignals || [],
        proof,
        error: 'Invalid public signals format. Minimum 2 signals required (thresholdScaled, expectedCommitment).',
      };
    }

    const thresholdScaled = Number(publicSignals[0]);
    const threshold = Number((thresholdScaled / 100).toFixed(2));
    const expectedCommitment = publicSignals[1];

    // Groth16 cryptographic verification (computes 3 bilinear pairings on BN128)
    const tStart = performance.now();
    const isPairingValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);
    const latencyMs = performance.now() - tStart;

    return {
      isCryptographicallyValid: isPairingValid === true,
      latencyMs,
      pairingChecked: true,
      threshold,
      thresholdScaled,
      expectedCommitment,
      publicSignals,
      proof,
      error: isPairingValid === true ? undefined : 'Bilinear pairing equation e(A, B) = e(alpha, beta) + ... failed.',
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unexpected cryptographic verification error.';
    return {
      isCryptographicallyValid: false,
      latencyMs: 0,
      pairingChecked: false,
      threshold: 0,
      thresholdScaled: 0,
      expectedCommitment: '',
      publicSignals: publicSignals || [],
      proof,
      error: errorMsg,
    };
  }
}

/**
 * Layer 2: Institutional Ledger Cross-Check.
 * Validates root existence and verifies revocation status against Supabase.
 */
export async function verifyLedgerState(payload: ProofPayload): Promise<LedgerCheckResult> {
  const commitment = payload.publicSignals?.[1];
  const root = payload.merkleRoot;
  const institutionCode = payload.issuer?.code || 'RTMNU';

  if (!commitment) {
    return {
      isValidRoot: false,
      isRevoked: false,
      message: 'No Poseidon commitment found in proof public signals.',
    };
  }

  if (payload.expectedCommitment && payload.expectedCommitment !== commitment) {
    return {
      isValidRoot: false,
      isRevoked: false,
      message: 'Payload expectedCommitment does not match publicSignals[1].',
    };
  }

  try {
    // 1. Check revocation registry
    const revCheck = await checkRevocation(commitment);
    if (revCheck.isRevoked) {
      return {
        isValidRoot: false,
        isRevoked: true,
        revocationRecord: revCheck.record,
        message: revCheck.record?.reason || 'Credential has been formally revoked by the institution.',
      };
    }

    // 2. Validate Merkle Root
    if (!root) {
      return {
        isValidRoot: false,
        isRevoked: false,
        message: 'Missing Merkle root in credential proof payload.',
      };
    }

    const rootCheck = await verifyMerkleRoot(root, institutionCode);
    return {
      isValidRoot: rootCheck.isValid,
      isRevoked: false,
      institution: rootCheck.institution,
      rootRecord: rootCheck.root,
      message: rootCheck.isValid
        ? 'Merkle root verified on institutional ledger.'
        : 'Root hash not recognized on accredited registry.',
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn('Ledger cross-check warning (proceeding with crypto status):', err);
    return {
      isValidRoot: false,
      isRevoked: false,
      message: `Ledger unavailable: ${errorMsg}`,
    };
  }
}

/**
 * Executes full end-to-end verification (Layer 1 Crypto + Layer 2 Ledger).
 */
export async function verifyFullProofPayload(
  payload: ProofPayload,
  vKeyOverride?: Record<string, unknown>
): Promise<VerificationResult> {
  const tOverallStart = performance.now();

  // 1. Layer 1: Groth16 Pairing Verification
  const cryptoResult = await verifyGroth16Proof(payload.proof, payload.publicSignals, vKeyOverride);

  // 2. Layer 2: Institutional Ledger Cross-Check
  const tLedgerStart = performance.now();
  const ledgerResult = await verifyLedgerState(payload);
  const ledgerLatencyMs = performance.now() - tLedgerStart;

  const totalLatencyMs = performance.now() - tOverallStart;

  // 3. Synthesize Verification Status & Summary
  let status: VerificationStatus = 'invalid';
  let isFullyVerified = false;
  let summaryTitle = '';
  let summaryDescription = '';

  if (!cryptoResult.pairingChecked) {
    status = 'error';
    summaryTitle = 'Verification Could Not Be Completed';
    summaryDescription =
      cryptoResult.error || 'Verification could not be completed due to an engine or input error.';
  } else if (!cryptoResult.isCryptographicallyValid) {
    status = 'tampered';
    summaryTitle = 'Cryptographic Verification Failed';
    summaryDescription =
      'The mathematical pairing check on BN128 failed. The proof is forged or public signals (threshold or commitment) were tampered with.';
  } else if (ledgerResult.isRevoked) {
    status = 'revoked';
    summaryTitle = 'Credential Revoked on Ledger';
    summaryDescription = `The candidate held a qualifying credential, but it has been formally revoked: ${
      ledgerResult.message || 'Status revoked'
    }.`;
  } else if (!ledgerResult.isValidRoot) {
    status = 'invalid';
    summaryTitle = 'Unverified Institutional Ledger Root';
    summaryDescription =
      ledgerResult.message || 'The Merkle root hash is not registered on the accredited institutional ledger.';
  } else {
    status = 'valid';
    isFullyVerified = true;
    const thresholdProven = (cryptoResult.thresholdScaled / 100).toFixed(2);
    const institution = ledgerResult.institution?.name || payload.issuer?.name || 'RTMNU';
    summaryTitle = 'Credential Cryptographically Authenticated';
    summaryDescription = `Candidate holds an authentic qualification issued by ${institution} with a CGPA ≥ ${thresholdProven}. Zero marks, backlogs, or PII were exposed.`;
  }

  const diagnostics: VerificationDiagnostics = {
    curve: 'BN128',
    protocol: 'Groth16',
    pairingsEvaluated: 3,
    thresholdScaled: cryptoResult.thresholdScaled,
    thresholdFloat: cryptoResult.threshold,
    commitmentHash: cryptoResult.expectedCommitment,
    piA: payload.proof?.pi_a || [],
    piB: payload.proof?.pi_b || [],
    piC: payload.proof?.pi_c || [],
    piiExposedPercent: 0,
    gasCost: '₹0.00',
    verificationLatencyMs: cryptoResult.latencyMs,
    ledgerLatencyMs,
    totalLatencyMs,
  };

  return {
    status,
    isFullyVerified,
    summaryTitle,
    summaryDescription,
    payload,
    crypto: cryptoResult,
    ledger: ledgerResult,
    diagnostics,
    verifiedAt: Date.now(),
  };
}

/**
 * Ingests a URL-safe Base64 token, decodes it, and runs full verification.
 */
export async function verifyFromToken(
  token: string,
  vKeyOverride?: Record<string, unknown>
): Promise<VerificationResult> {
  try {
    const payload = decodeProofPayload(token);
    return await verifyFullProofPayload(payload, vKeyOverride);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Invalid format';
    const emptyProof: Groth16Proof = { pi_a: [], pi_b: [], pi_c: [], protocol: 'groth16', curve: 'bn128' };
    return {
      status: 'error',
      isFullyVerified: false,
      summaryTitle: 'Malformed Token Payload',
      summaryDescription: `Failed to decode verification token: ${errorMsg}.`,
      payload: null,
      crypto: {
        isCryptographicallyValid: false,
        latencyMs: 0,
        pairingChecked: false,
        threshold: 0,
        thresholdScaled: 0,
        expectedCommitment: '',
        publicSignals: [],
        proof: emptyProof,
        error: errorMsg,
      },
      ledger: { isValidRoot: false, isRevoked: false },
      diagnostics: {
        curve: 'BN128',
        protocol: 'Groth16',
        pairingsEvaluated: 3,
        thresholdScaled: 0,
        thresholdFloat: 0,
        commitmentHash: '',
        piA: [],
        piB: [],
        piC: [],
        piiExposedPercent: 0,
        gasCost: '₹0.00',
        verificationLatencyMs: 0,
        ledgerLatencyMs: 0,
        totalLatencyMs: 0,
      },
      verifiedAt: Date.now(),
    };
  }
}

/**
 * Ingests a raw JSON proof payload string and runs full verification.
 */
export async function verifyFromJson(
  jsonStr: string,
  vKeyOverride?: Record<string, unknown>
): Promise<VerificationResult> {
  try {
    const payload = safeJsonParse<ProofPayload>(jsonStr);
    return await verifyFullProofPayload(payload, vKeyOverride);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Invalid JSON syntax';
    const emptyProof: Groth16Proof = { pi_a: [], pi_b: [], pi_c: [], protocol: 'groth16', curve: 'bn128' };
    return {
      status: 'error',
      isFullyVerified: false,
      summaryTitle: 'JSON Parse Error',
      summaryDescription: `Could not parse proof JSON: ${errorMsg}.`,
      payload: null,
      crypto: {
        isCryptographicallyValid: false,
        latencyMs: 0,
        pairingChecked: false,
        threshold: 0,
        thresholdScaled: 0,
        expectedCommitment: '',
        publicSignals: [],
        proof: emptyProof,
        error: errorMsg,
      },
      ledger: { isValidRoot: false, isRevoked: false },
      diagnostics: {
        curve: 'BN128',
        protocol: 'Groth16',
        pairingsEvaluated: 3,
        thresholdScaled: 0,
        thresholdFloat: 0,
        commitmentHash: '',
        piA: [],
        piB: [],
        piC: [],
        piiExposedPercent: 0,
        gasCost: '₹0.00',
        verificationLatencyMs: 0,
        ledgerLatencyMs: 0,
        totalLatencyMs: 0,
      },
      verifiedAt: Date.now(),
    };
  }
}
