/**
 * AutoCert-ZKP: TypeScript Worker Definition
 * Type declarations and worker entry point for bundlers supporting Module Workers.
 */

import {
  WorkerRequest,
  WorkerProgress,
  WorkerResult,
  WorkerError,
  Groth16Proof,
} from '@/lib/types/proof';

export {};

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  const { id, type, inputs, wasmUrl, zkeyUrl } = e.data || {};
  if (type !== 'START_PROVE') return;

  const tStart = performance.now();

  try {
    const postProgress = (step: WorkerProgress['step'], message: string, percent: number) => {
      const msg: WorkerProgress = {
        id,
        type: 'PROGRESS',
        step,
        message,
        percent,
        elapsedMs: performance.now() - tStart,
      };
      self.postMessage(msg);
    };

    // Check if snarkjs is globally available or needs importScripts
    const globalAny = self as unknown as {
      snarkjs?: {
        groth16: {
          fullProve: (
            inputs: unknown,
            wasm: string,
            zkey: string
          ) => Promise<{ proof: Groth16Proof; publicSignals: string[] }>;
        };
      };
    };
    if (!globalAny.snarkjs) {
      postProgress('INITIALIZING', 'Loading SnarkJS WebAssembly runtime in worker thread...', 15);
      (self as unknown as { importScripts: (url: string) => void }).importScripts('/zk/snarkjs.min.js');
    }

    if (!globalAny.snarkjs?.groth16) {
      throw new Error('SnarkJS failed to initialize inside Web Worker context.');
    }

    postProgress('COMPILING_WITNESS', 'Compiling R1CS arithmetic witness via WebAssembly...', 35);
    postProgress('EVALUATING_COMMITMENT', 'Evaluating Poseidon sponge hash pre-image & threshold...', 60);
    postProgress('GENERATING_PROOF', 'Computing Groth16 BN128 bilinear pairings...', 85);

    const finalWasm = wasmUrl || '/zk/academic_verifier.wasm';
    const finalZkey = zkeyUrl || '/zk/circuit_final.zkey';

    const { proof, publicSignals } = await globalAny.snarkjs.groth16.fullProve(
      inputs,
      finalWasm,
      finalZkey
    );

    const latencyMs = performance.now() - tStart;

    const resultMsg: WorkerResult = {
      id,
      type: 'RESULT',
      success: true,
      proof,
      publicSignals,
      latencyMs,
    };

    self.postMessage(resultMsg);
  } catch (err: unknown) {
    const errorMsg: WorkerError = {
      id,
      type: 'ERROR',
      success: false,
      error:
        err instanceof Error
          ? err.message
          : typeof err === 'string'
          ? err
          : 'Circuit constraint verification failed. Ensure criteria are met.',
    };
    self.postMessage(errorMsg);
  }
};
