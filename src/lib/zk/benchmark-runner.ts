/**
 * AutoCert-ZKP: Live In-Browser Client Benchmark Runner
 * Avishkar 2026-27 Research Convention (RTMNU, Engineering & Technology UG)
 *
 * Runs real-time Groth16 zk-SNARK witness compilation, proof generation,
 * and pairing verification directly on the user's current hardware.
 */

import { generateZkProofWithWorker, encodeProofPayload } from '@/lib/zk/prover-client';
import { verifyGroth16Proof, loadVerificationKey } from '@/lib/zk/verifier-engine';
import {
  LiveBenchmarkProgress,
  LiveBenchmarkResult,
} from '@/lib/types/benchmark';
import { PRESET_CREDENTIALS } from '@/lib/data/mock-credentials';

export interface RunLiveBenchmarkOptions {
  thresholdScaled?: number;
  onProgress?: (progress: LiveBenchmarkProgress) => void;
}

export async function executeLiveBrowserBenchmark(
  options: RunLiveBenchmarkOptions = {}
): Promise<LiveBenchmarkResult> {
  const { thresholdScaled = 750, onProgress } = options;

  const update = (stage: LiveBenchmarkProgress['stage'], message: string, percent: number) => {
    if (onProgress) {
      onProgress({ stage, message, progressPercent: percent });
    }
  };

  update('initializing', 'Initializing cryptographic parameters & Curve BN128...', 10);

  // Use Rajesh Raut preset (8.45 CGPA >= 7.50 Threshold)
  const credential = PRESET_CREDENTIALS[0].credential;
  const actualCgpaScaled = credential.zkSubject.actualCgpaScaled;
  const studentSecret = credential.zkSubject.studentSecret;
  const expectedCommitment = credential.zkSubject.commitment;

  const proverInputs = {
    actualCgpaScaled,
    studentSecret,
    thresholdScaled,
    expectedCommitment,
  };

  update('computing-witness', 'Compiling R1CS witness in WebAssembly worker...', 30);

  const tStartProve = performance.now();
  const proverResult = await generateZkProofWithWorker(
    proverInputs,
    (telemetry) => {
      if (telemetry.step === 'GENERATING_PROOF') {
        update('generating-proof', 'Synthesizing Groth16 elliptic curve proof points...', 60);
      }
    }
  );
  const tEndProve = performance.now();
  const proofGenerationMs = Number((tEndProve - tStartProve).toFixed(2));

  update('verifying-pairings', 'Evaluating 3 bilinear pairings on Curve BN128...', 80);

  // Load static verification key
  const vKey = await loadVerificationKey();

  const tStartVerify = performance.now();
  const cryptoVerifyResult = await verifyGroth16Proof(
    proverResult.proof,
    proverResult.publicSignals,
    vKey
  );
  const tEndVerify = performance.now();
  const verificationMs = Number((tEndVerify - tStartVerify).toFixed(2));

  if (!cryptoVerifyResult.isCryptographicallyValid) {
    update('failed', 'Cryptographic pairing check failed on Curve BN128', 100);
    throw new Error('Groth16 cryptographic pairing verification failed.');
  }

  // Construct payload adhering to ProofPayload
  const payload = {
    version: '1.0' as const,
    proof: proverResult.proof,
    publicSignals: proverResult.publicSignals,
    threshold: Number((thresholdScaled / 100).toFixed(2)),
    thresholdScaled,
    expectedCommitment,
    timestamp: Date.now(),
    issuer: {
      name: credential.issuer.name,
      code: credential.issuer.code,
    },
  };

  const base64Payload = encodeProofPayload(payload);
  const payloadSizeBytes = new Blob([base64Payload]).size;

  update('completed', 'Live benchmark execution complete!', 100);

  // Device Info extraction
  const nav = typeof navigator !== 'undefined' ? (navigator as unknown as { deviceMemory?: number }) : {};
  const deviceInfo = {
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Node.js',
    platform: typeof navigator !== 'undefined' ? navigator.platform || 'Unknown' : 'Server',
    logicalCores: typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4,
    deviceMemoryGb: nav.deviceMemory ? Number(nav.deviceMemory) : undefined,
  };

  return {
    deviceInfo,
    proofGenerationMs,
    verificationMs,
    totalCycleMs: Number((proofGenerationMs + verificationMs).toFixed(2)),
    payloadSizeBytes,
    base64Payload,
    isPairingValid: cryptoVerifyResult.isCryptographicallyValid,
    thresholdProven: Number((thresholdScaled / 100).toFixed(2)),
    commitmentHash: proverResult.publicSignals[1] || expectedCommitment,
    timestamp: Date.now(),
  };
}
