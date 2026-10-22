/**
 * AutoCert-ZKP: Cryptographic Proof & Prover Telemetry Types
 */

export interface Groth16Proof {
  pi_a: string[];
  pi_b: string[][];
  pi_c: string[];
  protocol: string;
  curve: string;
}

export interface ProverInputs {
  actualCgpaScaled: number;
  studentSecret: string;
  thresholdScaled: number;
  expectedCommitment: string;
  [key: string]: string | number | bigint;
}

export type ProofTelemetryStep =
  | 'IDLE'
  | 'INITIALIZING'
  | 'COMPILING_WITNESS'
  | 'EVALUATING_COMMITMENT'
  | 'GENERATING_PROOF'
  | 'SUCCESS'
  | 'ERROR';

export interface TelemetryEvent {
  step: ProofTelemetryStep;
  message: string;
  percent: number;
  elapsedMs?: number;
}

export interface ProofPayload {
  version: '1.0';
  proof: Groth16Proof;
  publicSignals: string[];
  threshold: number;
  thresholdScaled: number;
  expectedCommitment: string;
  timestamp: number;
  issuer?: {
    name: string;
    code: string;
    publicKey?: string;
  };
  merkleRoot?: string;
}

export type WorkerRequest = {
  id: string;
  type: 'START_PROVE';
  inputs: ProverInputs;
  wasmUrl?: string;
  zkeyUrl?: string;
};

export type WorkerProgress = {
  id: string;
  type: 'PROGRESS';
  step: ProofTelemetryStep;
  message: string;
  percent: number;
  elapsedMs: number;
};

export type WorkerResult = {
  id: string;
  type: 'RESULT';
  success: true;
  proof: Groth16Proof;
  publicSignals: string[];
  latencyMs: number;
};

export type WorkerError = {
  id: string;
  type: 'ERROR';
  success: false;
  error: string;
};

export type WorkerResponse = WorkerProgress | WorkerResult | WorkerError;
