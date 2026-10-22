/**
 * AutoCert-ZKP: Dedicated Client-Side Web Worker Prover
 * Executes Groth16 witness generation and proof computation off the main UI thread.
 */

/* eslint-disable no-restricted-globals */

self.onmessage = async function (e) {
  const { id, type, inputs, wasmUrl, zkeyUrl } = e.data || {};
  if (type !== 'START_PROVE') return;

  const tStart = performance.now();

  try {
    // 1. Ensure snarkjs is loaded into worker context
    if (typeof self.snarkjs === 'undefined') {
      self.postMessage({
        id,
        type: 'PROGRESS',
        step: 'INITIALIZING',
        message: 'Loading SnarkJS WebAssembly runtime in worker thread...',
        percent: 15,
        elapsedMs: performance.now() - tStart,
      });

      self.importScripts('/zk/snarkjs.min.js');
    }

    if (typeof self.snarkjs === 'undefined' || !self.snarkjs.groth16) {
      throw new Error('SnarkJS failed to initialize inside Web Worker.');
    }

    // 2. Telemetry: Step 1 - Compiling WebAssembly Witness
    self.postMessage({
      id,
      type: 'PROGRESS',
      step: 'COMPILING_WITNESS',
      message: 'Compiling R1CS arithmetic witness via academic_verifier.wasm...',
      percent: 35,
      elapsedMs: performance.now() - tStart,
    });

    // 3. Telemetry: Step 2 - Evaluating Algebraic Commitment
    self.postMessage({
      id,
      type: 'PROGRESS',
      step: 'EVALUATING_COMMITMENT',
      message: 'Evaluating Poseidon sponge hash pre-image & threshold comparator...',
      percent: 60,
      elapsedMs: performance.now() - tStart,
    });

    // 4. Telemetry: Step 3 - Generating Groth16 zk-SNARK Proof
    self.postMessage({
      id,
      type: 'PROGRESS',
      step: 'GENERATING_PROOF',
      message: 'Computing Groth16 BN128 elliptic curve bilinear pairings...',
      percent: 85,
      elapsedMs: performance.now() - tStart,
    });

    const finalWasm = wasmUrl || '/zk/academic_verifier.wasm';
    const finalZkey = zkeyUrl || '/zk/circuit_final.zkey';

    const { proof, publicSignals } = await self.snarkjs.groth16.fullProve(
      inputs,
      finalWasm,
      finalZkey
    );

    const latencyMs = performance.now() - tStart;

    // Send successful proof back to main thread
    self.postMessage({
      id,
      type: 'RESULT',
      success: true,
      proof,
      publicSignals,
      latencyMs,
    });
  } catch (err) {
    const errorMsg =
      err instanceof Error
        ? err.message
        : typeof err === 'string'
        ? err
        : 'Proof generation failed. Threshold criteria may not be satisfied.';

    self.postMessage({
      id,
      type: 'ERROR',
      success: false,
      error: errorMsg,
    });
  }
};
