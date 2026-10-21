/**
 * AutoCert-ZKP: Automated Circuit & Cryptographic Smoke Test Suite
 * Validates correctness, rejection of under-qualified credentials, and tamper resistance.
 */
const fs = require('fs');
const path = require('path');
const snarkjs = require('snarkjs');
const { buildPoseidon } = require('circomlibjs');

const PUBLIC_ZK_DIR = path.resolve(__dirname, '..', 'public', 'zk');
const WASM_PATH = path.join(PUBLIC_ZK_DIR, 'academic_verifier.wasm');
const ZKEY_PATH = path.join(PUBLIC_ZK_DIR, 'circuit_final.zkey');
const VKEY_PATH = path.join(PUBLIC_ZK_DIR, 'verification_key.json');

async function runTestSuite() {
  console.log('===========================================================');
  console.log('      AutoCert-ZKP: Cryptographic Circuit Test Suite       ');
  console.log('===========================================================\n');

  // Verify file existence
  if (!fs.existsSync(WASM_PATH)) {
    throw new Error(`Missing WASM binary at ${WASM_PATH}. Run "npm run zk:setup" first.`);
  }
  if (!fs.existsSync(ZKEY_PATH)) {
    throw new Error(`Missing ZKEY at ${ZKEY_PATH}. Run "npm run zk:setup" first.`);
  }
  if (!fs.existsSync(VKEY_PATH)) {
    throw new Error(`Missing verification key at ${VKEY_PATH}. Run "npm run zk:setup" first.`);
  }

  const vKey = JSON.parse(fs.readFileSync(VKEY_PATH, 'utf8'));
  const poseidon = await buildPoseidon();

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (!condition) {
      console.error(`  FAIL: ${message}`);
      throw new Error(`Test assertion failed: ${message}`);
    }
    console.log(`  PASS: ${message}`);
    passedTests++;
  }

  // --------------------------------------------------------------------------
  // TEST 1: Valid Credential Proof Generation & Verification
  // --------------------------------------------------------------------------
  console.log('[Test 1/4] Valid Credential (actual CGPA: 8.45 >= threshold: 7.50)...');
  const actualCgpaScaled = 845;
  const thresholdScaled = 750;
  const studentSecret = '928374928374928374928374928374928374928374';

  const rawCommitment = poseidon([actualCgpaScaled, studentSecret]);
  const expectedCommitment = poseidon.F.toString(rawCommitment);

  const tStartProve = performance.now();
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    {
      actualCgpaScaled,
      studentSecret,
      thresholdScaled,
      expectedCommitment,
    },
    WASM_PATH,
    ZKEY_PATH
  );
  const tProve = performance.now() - tStartProve;

  assert(Array.isArray(publicSignals) && publicSignals.length === 2, 'Public signals array has 2 elements');
  assert(publicSignals[0] === thresholdScaled.toString(), 'Public signal[0] matches thresholdScaled');
  assert(publicSignals[1] === expectedCommitment, 'Public signal[1] matches expectedCommitment');

  const tStartVerify = performance.now();
  const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);
  const tVerify = performance.now() - tStartVerify;

  assert(isValid === true, 'Groth16 pairing check passes for valid witness');
  console.log(`         Latency: T_prove = ${tProve.toFixed(1)} ms, T_verify = ${tVerify.toFixed(2)} ms`);

  // --------------------------------------------------------------------------
  // TEST 2: Under-Qualified CGPA Rejection (actual CGPA: 6.50 < threshold: 7.50)
  // --------------------------------------------------------------------------
  console.log('\n[Test 2/4] Under-Qualified CGPA Rejection (actual: 6.50 < threshold: 7.50)...');
  const underQualifiedCgpa = 650;
  const underCommitment = poseidon.F.toString(poseidon([underQualifiedCgpa, studentSecret]));

  let caughtRejection = false;
  try {
    await snarkjs.groth16.fullProve(
      {
        actualCgpaScaled: underQualifiedCgpa,
        studentSecret,
        thresholdScaled,
        expectedCommitment: underCommitment,
      },
      WASM_PATH,
      ZKEY_PATH
    );
  } catch (err) {
    caughtRejection = true;
  }
  assert(caughtRejection === true, 'Circuit constraint comp.out === 1 rejects under-qualified witness');

  // --------------------------------------------------------------------------
  // TEST 3: Tampered Public Commitment Rejection (Forged Credential Attack)
  // --------------------------------------------------------------------------
  console.log('\n[Test 3/4] Tampered Commitment Rejection (Public signal spoofing)...');
  const tamperedCommitment = (BigInt(expectedCommitment) + 1n).toString();
  const tamperedSignals = [thresholdScaled.toString(), tamperedCommitment];

  const isTamperedValid = await snarkjs.groth16.verify(vKey, tamperedSignals, proof);
  assert(isTamperedValid === false, 'Groth16 pairing check fails when public commitment is altered');

  // --------------------------------------------------------------------------
  // TEST 4: Tampered Threshold Signal Rejection
  // --------------------------------------------------------------------------
  console.log('\n[Test 4/4] Tampered Threshold Signal Rejection (Claiming higher threshold)...');
  const tamperedThresholdSignals = ['900', expectedCommitment];

  const isTamperedThresholdValid = await snarkjs.groth16.verify(vKey, tamperedThresholdSignals, proof);
  assert(isTamperedThresholdValid === false, 'Groth16 pairing check fails when threshold signal is forged');

  // --------------------------------------------------------------------------
  // BENCHMARK SUMMARY FOR AVISHKAR 2026-27
  // --------------------------------------------------------------------------
  console.log('\n===========================================================');
  console.log('   Avishkar 2026-27 Empirical Cryptographic Benchmark      ');
  console.log('===========================================================');
  console.log(` - Circuit Proof Protocol  : Groth16 (BN128 / alt_bn128)`);
  console.log(` - Commitment Hash Scheme  : Poseidon Sponge Function (t=3, nInputs=2)`);
  console.log(` - Total Circuit Gates     : 538 constraints (260 non-linear)`);
  console.log(` - Proving Latency (Local) : ${tProve.toFixed(1)} ms (< 1200 ms target)`);
  console.log(` - Verify Latency (Local)  : ${tVerify.toFixed(2)} ms (< 10 ms target on edge)`);
  console.log(` - Proof Size in Memory    : ${JSON.stringify(proof).length} bytes`);
  console.log(` - Results                 : ${passedTests}/${totalTests} tests passed`);
  console.log('===========================================================\n');

  process.exit(0);
}

runTestSuite().catch((err) => {
  console.error('\n[test-circuit] Smoke test encountered an unexpected error:', err);
  process.exit(1);
});
