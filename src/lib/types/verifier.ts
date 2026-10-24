/**
 * AutoCert-ZKP: Verification Engine & Public Portal Types
 * Avishkar 2026-27 (RTMNU) Engineering & Technology Category
 */

import { Groth16Proof, ProofPayload } from './proof';
import { Institution, MerkleRoot, Revocation } from './database';

export type VerificationStatus =
  | 'idle'
  | 'verifying'
  | 'valid'
  | 'invalid'
  | 'tampered'
  | 'revoked'
  | 'error';

export interface CryptographicVerificationResult {
  isCryptographicallyValid: boolean;
  latencyMs: number;
  pairingChecked: boolean;
  threshold: number;
  thresholdScaled: number;
  expectedCommitment: string;
  publicSignals: string[];
  proof: Groth16Proof;
  error?: string;
}

export interface LedgerCheckResult {
  isValidRoot: boolean;
  isRevoked: boolean;
  institution?: Institution | null;
  rootRecord?: MerkleRoot | null;
  revocationRecord?: Revocation | null;
  message?: string;
}

export interface VerificationDiagnostics {
  curve: 'BN128';
  protocol: 'Groth16';
  pairingsEvaluated: 3;
  thresholdScaled: number;
  thresholdFloat: number;
  commitmentHash: string;
  piA: string[];
  piB: string[][];
  piC: string[];
  piiExposedPercent: 0;
  gasCost: '₹0.00';
  verificationLatencyMs: number;
  ledgerLatencyMs: number;
  totalLatencyMs: number;
}

export interface VerificationResult {
  status: VerificationStatus;
  isFullyVerified: boolean;
  summaryTitle: string;
  summaryDescription: string;
  payload: ProofPayload | null;
  crypto: CryptographicVerificationResult;
  ledger: LedgerCheckResult;
  diagnostics: VerificationDiagnostics;
  verifiedAt: number;
}

export interface PresetProofItem {
  id: string;
  name: string;
  category: 'valid' | 'tampered' | 'corrupted' | 'revoked';
  description: string;
  expectedOutcome: 'pass' | 'fail_crypto' | 'fail_tampered' | 'fail_revoked';
  candidateName: string;
  actualCgpa: number;
  threshold: number;
  payload: ProofPayload;
}
