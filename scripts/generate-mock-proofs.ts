/**
 * AutoCert-ZKP: Generate Preset Proofs for Demonstration
 * Computes cryptographically genuine Groth16 proofs and encodes them into src/lib/data/mock-proofs.ts
 */

import fs from 'fs';
import path from 'path';
// @ts-ignore
import * as snarkjs from 'snarkjs';
import { buildPoseidon } from 'circomlibjs';
import { ProofPayload } from '../src/lib/types/proof';
import { encodeProofPayload } from '../src/lib/zk/prover-client';

const PUBLIC_ZK_DIR = path.resolve(__dirname, '..', 'public', 'zk');
const WASM_PATH = path.join(PUBLIC_ZK_DIR, 'academic_verifier.wasm');
const ZKEY_PATH = path.join(PUBLIC_ZK_DIR, 'circuit_final.zkey');
const OUT_PATH = path.resolve(__dirname, '..', 'src', 'lib', 'data', 'mock-proofs.ts');

async function main() {
  console.log('Generating preset demonstration proofs...');
  const poseidon = await buildPoseidon();

  // 1. Rajesh S. Raut (8.45 CGPA >= 7.50)
  const rajeshSecret = '928374928374928374928374928374928374928374';
  const rajeshCommitment = poseidon.F.toString(poseidon([845, rajeshSecret]));

  const { proof: proof1, publicSignals: signals1 } = await snarkjs.groth16.fullProve(
    {
      actualCgpaScaled: 845,
      studentSecret: rajeshSecret,
      thresholdScaled: 750,
      expectedCommitment: rajeshCommitment,
    },
    WASM_PATH,
    ZKEY_PATH
  );

  const payload1: ProofPayload = {
    version: '1.0',
    proof: proof1,
    publicSignals: signals1,
    threshold: 7.5,
    thresholdScaled: 750,
    expectedCommitment: rajeshCommitment,
    timestamp: 1729440000000,
    issuer: {
      name: 'Rashtrasant Tukadoji Maharaj Nagpur University',
      code: 'RTMNU',
    },
    merkleRoot: '192847192837192837192837192837',
  };
  const token1 = encodeProofPayload(payload1);

  // 2. Snehal M. Deshmukh (7.60 CGPA >= 7.00)
  const snehalSecret = '837461928472910485729104820194827103948571';
  const snehalCommitment = poseidon.F.toString(poseidon([760, snehalSecret]));

  const { proof: proof2, publicSignals: signals2 } = await snarkjs.groth16.fullProve(
    {
      actualCgpaScaled: 760,
      studentSecret: snehalSecret,
      thresholdScaled: 700,
      expectedCommitment: snehalCommitment,
    },
    WASM_PATH,
    ZKEY_PATH
  );

  const payload2: ProofPayload = {
    version: '1.0',
    proof: proof2,
    publicSignals: signals2,
    threshold: 7.0,
    thresholdScaled: 700,
    expectedCommitment: snehalCommitment,
    timestamp: 1729441000000,
    issuer: {
      name: 'Rashtrasant Tukadoji Maharaj Nagpur University',
      code: 'RTMNU',
    },
    merkleRoot: '192847192837192837192837192837',
  };
  const token2 = encodeProofPayload(payload2);

  // 3. Tampered Signal Proof: Rajesh's proof where threshold is modified to 900
  const tamperedSignals = ['900', signals1[1]];
  const payload3: ProofPayload = {
    version: '1.0',
    proof: proof1,
    publicSignals: tamperedSignals,
    threshold: 9.0,
    thresholdScaled: 900,
    expectedCommitment: signals1[1],
    timestamp: 1729442000000,
    issuer: {
      name: 'Rashtrasant Tukadoji Maharaj Nagpur University',
      code: 'RTMNU',
    },
    merkleRoot: '192847192837192837192837192837',
  };
  const token3 = encodeProofPayload(payload3);

  // 4. Corrupted Proof: Mutating pi_a in proof1
  const corruptedProof = JSON.parse(JSON.stringify(proof1));
  corruptedProof.pi_a[0] = '1234567890123456789012345678901234567890';
  const payload4: ProofPayload = {
    version: '1.0',
    proof: corruptedProof,
    publicSignals: signals1,
    threshold: 7.5,
    thresholdScaled: 750,
    expectedCommitment: signals1[1],
    timestamp: 1729443000000,
    issuer: {
      name: 'Rashtrasant Tukadoji Maharaj Nagpur University',
      code: 'RTMNU',
    },
    merkleRoot: '192847192837192837192837192837',
  };
  const token4 = encodeProofPayload(payload4);

  // 5. Revoked Credential: Valid Groth16 proof with commitment flagged on ledger
  const revokedSecret = '777777777777777777777777777777777777777777';
  const revokedCommitment = poseidon.F.toString(poseidon([800, revokedSecret]));

  const { proof: proof5, publicSignals: signals5 } = await snarkjs.groth16.fullProve(
    {
      actualCgpaScaled: 800,
      studentSecret: revokedSecret,
      thresholdScaled: 750,
      expectedCommitment: revokedCommitment,
    },
    WASM_PATH,
    ZKEY_PATH
  );

  const payload5: ProofPayload = {
    version: '1.0',
    proof: proof5,
    publicSignals: signals5,
    threshold: 7.5,
    thresholdScaled: 750,
    expectedCommitment: revokedCommitment,
    timestamp: 1729444000000,
    issuer: {
      name: 'Rashtrasant Tukadoji Maharaj Nagpur University',
      code: 'RTMNU',
    },
    merkleRoot: '192847192837192837192837192837',
  };
  const token5 = encodeProofPayload(payload5);

  const fileContent = `/**
 * AutoCert-ZKP: Preset Demonstration Proofs
 * Avishkar 2026-27 (RTMNU) Engineering & Technology Category
 * Precomputed proofs for instant judge evaluation without requiring client proving.
 */

import { ProofPayload } from '@/lib/types/proof';

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
  token: string;
}

export const PRESET_PROOFS: PresetProofItem[] = [
  {
    id: 'valid-rajesh-750',
    name: 'Valid Credential (8.45 CGPA ≥ 7.50)',
    category: 'valid',
    description: 'Cryptographically authentic Groth16 proof with unrevoked RTMNU ledger anchor.',
    expectedOutcome: 'pass',
    candidateName: 'Rajesh S. Raut',
    actualCgpa: 8.45,
    threshold: 7.50,
    payload: ${JSON.stringify(payload1, null, 2)},
    token: '${token1}',
  },
  {
    id: 'valid-snehal-700',
    name: 'Valid Credential (7.60 CGPA ≥ 7.00)',
    category: 'valid',
    description: 'B.E. Electronics credential satisfying recruiter cut-off ≥ 7.00 with 0% PII exposed.',
    expectedOutcome: 'pass',
    candidateName: 'Snehal M. Deshmukh',
    actualCgpa: 7.60,
    threshold: 7.00,
    payload: ${JSON.stringify(payload2, null, 2)},
    token: '${token2}',
  },
  {
    id: 'tampered-signal-900',
    name: 'Tampered Public Signal (Inflation Attack)',
    category: 'tampered',
    description: 'Candidate modified the public threshold signal from 7.50 to 9.00 to inflate eligibility.',
    expectedOutcome: 'fail_tampered',
    candidateName: 'Adversary (Forged Signal)',
    actualCgpa: 8.45,
    threshold: 9.00,
    payload: ${JSON.stringify(payload3, null, 2)},
    token: '${token3}',
  },
  {
    id: 'corrupted-proof-bytes',
    name: 'Corrupted Proof Coordinates (πA Mutated)',
    category: 'corrupted',
    description: 'Groth16 elliptic curve coordinates mutated by 1 byte, failing the pairing check.',
    expectedOutcome: 'fail_crypto',
    candidateName: 'Corrupted Transmission',
    actualCgpa: 8.45,
    threshold: 7.50,
    payload: ${JSON.stringify(payload4, null, 2)},
    token: '${token4}',
  },
  {
    id: 'revoked-credential',
    name: 'Revoked Credential (Status Revoked on Ledger)',
    category: 'revoked',
    description: 'Valid proof, but institutional leaf commitment is flagged as revoked on PostgreSQL registry.',
    expectedOutcome: 'fail_revoked',
    candidateName: 'Disciplinary Action Record',
    actualCgpa: 8.45,
    threshold: 7.50,
    payload: ${JSON.stringify(payload5, null, 2)},
    token: '${token5}',
  },
];
`;

  fs.writeFileSync(OUT_PATH, fileContent, 'utf-8');
  console.log('Saved mock proofs to:', OUT_PATH);
}

main().catch(console.error);
