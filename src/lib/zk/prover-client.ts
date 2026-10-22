/**
 * AutoCert-ZKP: Client-Side Web Worker Prover Orchestrator
 * Spawns worker, coordinates witness computation, and serializes proof payloads without BigInt errors.
 */

import {
  Groth16Proof,
  ProverInputs,
  ProofPayload,
  TelemetryEvent,
  WorkerRequest,
  WorkerResponse,
} from '@/lib/types/proof';

/**
 * Custom JSON replacer that converts BigInts to string representation.
 */
export function safeJsonStringify(value: unknown): string {
  return JSON.stringify(value, (_, v) => (typeof v === 'bigint' ? v.toString() : v));
}

/**
 * Custom JSON reviver for safe parsing.
 */
export function safeJsonParse<T>(jsonString: string): T {
  return JSON.parse(jsonString) as T;
}

/**
 * Encodes a ProofPayload into a URL-safe Base64 token for URL parameters and QR codes.
 */
export function encodeProofPayload(payload: ProofPayload): string {
  const jsonStr = safeJsonStringify(payload);
  if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
    // UTF-8 safe browser Base64 encoding
    const encoded = window.btoa(
      encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (_, p1) =>
        String.fromCharCode(parseInt(p1, 16))
      )
    );
    return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  // Node.js fallback for tests and SSR
  return Buffer.from(jsonStr, 'utf-8').toString('base64url');
}

/**
 * Decodes a URL-safe Base64 token back into a ProofPayload.
 */
export function decodeProofPayload(token: string): ProofPayload {
  let base64 = token.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }

  let jsonStr = '';
  if (typeof window !== 'undefined' && typeof window.atob === 'function') {
    const raw = window.atob(base64);
    jsonStr = decodeURIComponent(
      Array.prototype.map
        .call(raw, (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } else {
    jsonStr = Buffer.from(base64, 'base64').toString('utf-8');
  }

  return safeJsonParse<ProofPayload>(jsonStr);
}

export interface ProverResult {
  proof: Groth16Proof;
  publicSignals: string[];
  latencyMs: number;
}

/**
 * Executes Groth16 proof generation inside a dedicated Web Worker off the main UI thread.
 * Streams real-time telemetry updates to onProgress callback.
 */
export async function generateZkProofWithWorker(
  inputs: ProverInputs,
  onProgress?: (event: TelemetryEvent) => void,
  options: {
    wasmUrl?: string;
    zkeyUrl?: string;
    timeoutMs?: number;
  } = {}
): Promise<ProverResult> {
  const {
    wasmUrl = '/zk/academic_verifier.wasm',
    zkeyUrl = '/zk/circuit_final.zkey',
    timeoutMs = 25000,
  } = options;

  // Check if Web Worker is supported in the browser environment
  if (typeof window === 'undefined' || typeof Worker === 'undefined') {
    return runMainThreadFallback(inputs, wasmUrl, zkeyUrl, onProgress);
  }

  return new Promise((resolve, reject) => {
    let worker: Worker | null = null;
    let timeoutId: NodeJS.Timeout | null = null;
    const reqId = `proof-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    try {
      worker = new Worker('/workers/zk-prover.worker.js');
    } catch (e) {
      console.warn('Worker instantiation failed, using main-thread fallback:', e);
      runMainThreadFallback(inputs, wasmUrl, zkeyUrl, onProgress)
        .then(resolve)
        .catch(reject);
      return;
    }

    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (worker) {
        worker.terminate();
        worker = null;
      }
    };

    timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error(`Prover timed out after ${timeoutMs}ms.`));
    }, timeoutMs);

    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const data = e.data;
      if (!data || data.id !== reqId) return;

      if (data.type === 'PROGRESS') {
        onProgress?.({
          step: data.step,
          message: data.message,
          percent: data.percent,
          elapsedMs: data.elapsedMs,
        });
      } else if (data.type === 'RESULT') {
        cleanup();
        onProgress?.({
          step: 'SUCCESS',
          message: `Proof successfully generated in ${data.latencyMs.toFixed(1)} ms!`,
          percent: 100,
          elapsedMs: data.latencyMs,
        });
        resolve({
          proof: data.proof,
          publicSignals: data.publicSignals,
          latencyMs: data.latencyMs,
        });
      } else if (data.type === 'ERROR') {
        cleanup();
        onProgress?.({
          step: 'ERROR',
          message: data.error,
          percent: 100,
        });
        reject(new Error(data.error));
      }
    };

    worker.onerror = (err) => {
      cleanup();
      const message = err.message || 'Worker thread encountered an unexpected error.';
      onProgress?.({
        step: 'ERROR',
        message,
        percent: 100,
      });
      reject(new Error(message));
    };

    const request: WorkerRequest = {
      id: reqId,
      type: 'START_PROVE',
      inputs,
      wasmUrl,
      zkeyUrl,
    };

    onProgress?.({
      step: 'INITIALIZING',
      message: 'Dispatching witness constraints to background Web Worker...',
      percent: 10,
    });

    worker.postMessage(request);
  });
}

/**
 * Main-thread fallback for environments where Web Workers are unavailable.
 */
async function runMainThreadFallback(
  inputs: ProverInputs,
  wasmUrl: string,
  zkeyUrl: string,
  onProgress?: (event: TelemetryEvent) => void
): Promise<ProverResult> {
  const tStart = performance.now();

  onProgress?.({
    step: 'COMPILING_WITNESS',
    message: 'Compiling R1CS arithmetic witness...',
    percent: 30,
    elapsedMs: 0,
  });

  // Dynamically load snarkjs in browser / node
  const snarkjs = await import('snarkjs');

  onProgress?.({
    step: 'EVALUATING_COMMITMENT',
    message: 'Evaluating Poseidon commitment & range check...',
    percent: 60,
    elapsedMs: performance.now() - tStart,
  });

  onProgress?.({
    step: 'GENERATING_PROOF',
    message: 'Computing Groth16 pairings on BN128...',
    percent: 85,
    elapsedMs: performance.now() - tStart,
  });

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(inputs, wasmUrl, zkeyUrl);
  const latencyMs = performance.now() - tStart;

  onProgress?.({
    step: 'SUCCESS',
    message: `Proof completed in ${latencyMs.toFixed(1)} ms`,
    percent: 100,
    elapsedMs: latencyMs,
  });

  return {
    proof,
    publicSignals,
    latencyMs,
  };
}
