/**
 * AutoCert-ZKP: Phase 4 Automated Test Suite
 * OpenCode Zen AI Parser & W3C Verifiable Credential Ingestion
 */

import { scaleCgpa, generateStudentSecret, computePoseidonCommitment, createZkSubject, BN128_SCALAR_FIELD_ORDER } from '../src/lib/crypto/poseidon';
import { extractTranscriptHeuristically } from '../src/lib/ai/provider';
import { parseTranscriptAction } from '../src/app/actions/parse-credential';
import { W3CCredentialSchema } from '../src/lib/types/credential';
import * as path from 'path';
import * as fs from 'fs';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const snarkjs = require('snarkjs');

const PUBLIC_ZK_DIR = path.resolve(__dirname, '..', 'public', 'zk');
const WASM_PATH = path.join(PUBLIC_ZK_DIR, 'academic_verifier.wasm');
const ZKEY_PATH = path.join(PUBLIC_ZK_DIR, 'circuit_final.zkey');
const VKEY_PATH = path.join(PUBLIC_ZK_DIR, 'verification_key.json');

// Sample real-world messy transcript text from RTMNU Nagpur
const SAMPLE_RTMNU_TRANSCRIPT = `
RASHTRASANT TUKADOJI MAHARAJ NAGPUR UNIVERSITY
PROVISIONAL GRADE CARD / TRANSCRIPT CUM DEGREE STATEMENT
================================================================================
Candidate Name     : RAJESH S. RAUT
Father's Name      : SURESH RAUT
Enrollment Number  : RTMNU/2022/EN/78291
Roll Number        : 849201
Institute          : DEPARTMENT OF COMPUTER TECHNOLOGY, RTMNU MAIN CAMPUS
Branch / Program   : COMPUTER SCIENCE & ENGINEERING
Degree             : BACHELOR OF TECHNOLOGY (B.TECH)
Examination        : EIGHTH SEMESTER (FINAL) - SUMMER 2026

--------------------------------------------------------------------------------
Course Code | Course Title                            | Credits | Grade | Points
--------------------------------------------------------------------------------
CS-801      | Distributed Systems & Cryptography       | 4       | A+    | 36
CS-802      | High Performance Cloud Computing         | 4       | A     | 32
CS-803      | Zero-Knowledge Proofs & Privacy          | 4       | O     | 40
CS-804      | Capstone Major Project (Stage II)        | 8       | O     | 80
--------------------------------------------------------------------------------

Semester 8 SGPA : 9.25
Cumulative Grade Point Average (C.G.P.A.) : 8.45 / 10.00
Result Classification                     : FIRST CLASS WITH DISTINCTION
Date of Issue                             : 15-JUNE-2026
`;

async function runPhase4Tests() {
  console.log('================================================================');
  console.log('  AutoCert-ZKP: Phase 4 AI Ingestion & W3C Credential Test Suite');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, message: string) {
    total++;
    if (!condition) {
      console.error(`  FAIL: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
    console.log(`  PASS: ${message}`);
    passed++;
  }

  // --------------------------------------------------------------------------
  // TEST 1: CGPA Scaling & Range Validation
  // --------------------------------------------------------------------------
  console.log('[Test 1/6] CGPA Integer Scaling to BN128 Field Element...');
  assert(scaleCgpa(8.45) === 845, 'scaleCgpa(8.45) === 845');
  assert(scaleCgpa(7.50) === 750, 'scaleCgpa(7.50) === 750');
  assert(scaleCgpa(10.00) === 1000, 'scaleCgpa(10.00) === 1000');
  assert(scaleCgpa(0.00) === 0, 'scaleCgpa(0.00) === 0');
  
  let outOfBoundsCaught = false;
  try {
    scaleCgpa(10.5);
  } catch {
    outOfBoundsCaught = true;
  }
  assert(outOfBoundsCaught, 'scaleCgpa(10.5) correctly throws out-of-bounds error');

  // --------------------------------------------------------------------------
  // TEST 2: Cryptographic Blinding Factor (studentSecret) Generation
  // --------------------------------------------------------------------------
  console.log('\n[Test 2/6] BN128 Scalar Blinding Secret Generation...');
  const secret1 = generateStudentSecret();
  const secret2 = generateStudentSecret();
  assert(secret1 !== secret2, 'Consecutive studentSecret values are distinct and non-deterministic');
  assert(BigInt(secret1) > BigInt(0), 'studentSecret is greater than zero');
  assert(BigInt(secret1) < BN128_SCALAR_FIELD_ORDER, 'studentSecret strictly resides within BN128 scalar field Fr');

  // --------------------------------------------------------------------------
  // TEST 3: Poseidon(2) Commitment Evaluation
  // --------------------------------------------------------------------------
  console.log('\n[Test 3/6] Poseidon Sponge Commitment Evaluation...');
  const testCgpaScaled = 845;
  const testSecret = '928374928374928374928374928374928374928374';
  const commitment1 = await computePoseidonCommitment(testCgpaScaled, testSecret);
  assert(typeof commitment1 === 'string' && /^[0-9]+$/.test(commitment1), 'Poseidon commitment returns decimal string');
  
  const commitment2 = await computePoseidonCommitment(testCgpaScaled, testSecret);
  assert(commitment1 === commitment2, 'Poseidon commitment is purely deterministic for identical inputs');

  const differentCommitment = await computePoseidonCommitment(846, testSecret);
  assert(commitment1 !== differentCommitment, 'Poseidon commitment changes on 1-point CGPA variation (collision resistance)');

  // --------------------------------------------------------------------------
  // TEST 4: Heuristic Academic Transcript Parser
  // --------------------------------------------------------------------------
  console.log('\n[Test 4/6] Heuristic Academic Parser on Messy RTMNU Transcript...');
  const extracted = extractTranscriptHeuristically(SAMPLE_RTMNU_TRANSCRIPT);
  assert(extracted.studentName === 'RAJESH S. RAUT', `Extracted student name: "${extracted.studentName}"`);
  assert(extracted.cgpa === 8.45, `Extracted CGPA: ${extracted.cgpa}`);
  assert(extracted.enrollmentNumber === 'RTMNU/2022/EN/78291', `Extracted enrollment: ${extracted.enrollmentNumber}`);
  assert(extracted.graduationYear === 2026, `Extracted graduation year: ${extracted.graduationYear}`);
  assert(extracted.classification === 'First Class with Distinction', `Extracted classification: ${extracted.classification}`);

  // Test missing CGPA error
  let missingCgpaCaught = false;
  try {
    extractTranscriptHeuristically('Candidate Name: RAJESH S. RAUT\nDegree: B.Tech\nNo grades here');
  } catch {
    missingCgpaCaught = true;
  }
  assert(missingCgpaCaught, 'Parser throws descriptive error when CGPA is missing from transcript');

  // Test missing student name error
  let missingNameCaught = false;
  try {
    extractTranscriptHeuristically('CGPA: 8.50\nDegree: B.Tech Computer Engineering\nInstitute: RTMNU\nYear: 2026');
  } catch {
    missingNameCaught = true;
  }
  assert(missingNameCaught, 'Parser throws descriptive error when student candidate name is missing');

  // Test missing graduation year error
  let missingYearCaught = false;
  try {
    extractTranscriptHeuristically('Candidate Name: RAJESH S. RAUT\nDegree: B.Tech\nCGPA: 8.50\nInstitute: RTMNU');
  } catch {
    missingYearCaught = true;
  }
  assert(missingYearCaught, 'Parser throws descriptive error when graduation year is missing');

  // Test M.Tech degree referencing prior B.Tech degree
  const mtechTranscript = `
Candidate Name: ANANYA DESHMUKH
Prior Degree Completed: Bachelor of Technology (B.Tech)
Awarded Degree: Master of Technology (M.Tech)
Branch: Computer Science
Institute: RTMNU Main Campus
CGPA: 9.10
Year: 2026
`;
  const mtechExtracted = extractTranscriptHeuristically(mtechTranscript);
  assert(mtechExtracted.degree === 'Master of Technology (M.Tech)', 'M.Tech credential referencing prior B.Tech is classified as M.Tech');

  // Test casual M.Tech mention not overriding B.Tech
  const casualMtechTranscript = `
Candidate Name: ROHIT VERMA
Branch: Computer Engineering
CGPA: 8.20
Institute: RTMNU Main Campus
Year: 2026
Project Guide: Dr. K. Patil (M.Tech Coordinator)
Candidate completed B.Tech requirements successfully.
`;
  const casualMtechExtracted = extractTranscriptHeuristically(casualMtechTranscript);
  assert(casualMtechExtracted.degree === 'Bachelor of Technology (B.Tech)', 'B.Tech in body is not overridden by casual M.Tech mentions in notes/faculty');

  // Test unrecognized labeled degree throws error without falling back to whole-text scan
  let unrecognizedDegreeCaught = false;
  try {
    extractTranscriptHeuristically(`
Candidate Name: ROHIT VERMA
Degree: Bachelor of Commerce
CGPA: 8.20
Institute: RTMNU Main Campus
Year: 2026
Candidate attended B.Tech workshops.
`);
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('Unrecognized degree: "Bachelor of Commerce"')) {
      unrecognizedDegreeCaught = true;
    }
  }
  assert(unrecognizedDegreeCaught, 'Unrecognized labeled degree (B.Com) throws error without falling back to whole-text B.Tech scan');

  // Test transcript without any classifiable degree throws error instead of defaulting
  let unclassifiableDegreeCaught = false;
  try {
    extractTranscriptHeuristically(`
Candidate Name: ROHIT VERMA
CGPA: 8.20
Institute: RTMNU Main Campus
Year: 2026
`);
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('Unable to extract or classify an eligible academic degree')) {
      unclassifiableDegreeCaught = true;
    }
  }
  assert(unclassifiableDegreeCaught, 'Transcript without any classifiable degree throws descriptive error rather than defaulting');

  // Test standalone English word "be" is not matched as B.E.
  let standaloneBeCaught = false;
  try {
    extractTranscriptHeuristically(`
Candidate Name: ROHIT VERMA
CGPA: 8.20
Institute: RTMNU Main Campus
Year: 2026
Candidate shall be eligible for convocation after clearance.
`);
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('Unable to extract or classify an eligible academic degree')) {
      standaloneBeCaught = true;
    }
  }
  assert(standaloneBeCaught, 'Standalone English word "be" is not matched as Bachelor of Engineering');

  // Test valid B.E. variations (dotted and uppercase BE)
  const beDottedTranscript = `
Candidate Name: NEHA SHARMA
Degree: B.E. Computer Engineering
CGPA: 8.75
Institute: RTMNU Main Campus
Year: 2026
`;
  const beExtracted = extractTranscriptHeuristically(beDottedTranscript);
  assert(beExtracted.degree === 'Bachelor of Engineering (B.E.)', 'Dotted B.E. correctly classifies as Bachelor of Engineering (B.E.)');

  const beUppercaseTranscript = `
Candidate Name: NEHA SHARMA
Degree: BE Mechanical Engineering
CGPA: 8.75
Institute: RTMNU Main Campus
Year: 2026
`;
  const beUppercaseExtracted = extractTranscriptHeuristically(beUppercaseTranscript);
  assert(beUppercaseExtracted.degree === 'Bachelor of Engineering (B.E.)', 'Uppercase BE correctly classifies as Bachelor of Engineering (B.E.)');

  // --------------------------------------------------------------------------
  // TEST 5: End-to-End Server Action & W3C Credential Construction
  // --------------------------------------------------------------------------
  console.log('\n[Test 5/6] Server Action Ingestion & W3C JSON-LD Assembly...');
  
  // Test max length rejection (> 20,000 characters)
  const oversizedText = 'A'.repeat(20005);
  const oversizedResult = await parseTranscriptAction(oversizedText);
  assert(oversizedResult.success === false, 'Server action rejects transcript exceeding 20,000 characters');

  // Test unauthorized institution rejection
  const unauthorizedTranscript = `
Candidate Name: JOHN DOE
Awarded Degree: Bachelor of Technology (B.Tech)
Institute: Fake University Nowhere
CGPA: 8.50
Year: 2026
`;
  const unauthResult = await parseTranscriptAction(unauthorizedTranscript);
  assert(unauthResult.success === false, 'Server action rejects transcripts outside authorized jurisdiction');
  assert(!unauthResult.error?.startsWith('Cryptographic credential assembly failed:'), 'Unauthorized issuer error is returned directly without crypto assembly prefix');

  // Test generic city name alone rejection
  const genericCityTranscript = `
Candidate Name: JOHN DOE
Awarded Degree: Bachelor of Technology (B.Tech)
Institute: Nagpur City Polytechnic
CGPA: 8.50
Year: 2026
`;
  const genericCityResult = await parseTranscriptAction(genericCityTranscript);
  assert(genericCityResult.success === false, 'Generic city name alone (Nagpur City Polytechnic) is rejected without full accredited university name');

  // Test unhandled heuristic exception converted into structured result
  const invalidText = 'Candidate Name: A\nDegree: B.Tech\nNo cgpa and no valid fields';
  const invalidResult = await parseTranscriptAction(invalidText);
  assert(invalidResult.success === false, 'Invalid transcript text returns success: false instead of throwing uncaught exception');
  assert(invalidResult.source === 'opencode-zen', 'Failed extraction leaves initial source as opencode-zen');
  assert(Boolean(invalidResult.auditNotes?.some((n) => n.includes('Heuristic transcript parsing failed'))), 'Audit notes contain heuristic failure message');

  const actionResult = await parseTranscriptAction(SAMPLE_RTMNU_TRANSCRIPT);
  if (!actionResult.success) {
    console.error('actionResult error:', actionResult.error, 'auditNotes:', actionResult.auditNotes);
  }
  assert(actionResult.success === true, 'parseTranscriptAction returns success: true');
  assert(!!actionResult.credential, 'Credential object is defined');

  if (actionResult.credential) {
    const vc = actionResult.credential;
    assert(W3CCredentialSchema.safeParse(vc).success, 'Assembled credential strictly validates against W3CCredentialSchema');
    assert(vc.issuer.name === 'Rashtrasant Tukadoji Maharaj Nagpur University (RTMNU)', 'Credential issuer.name is assigned from accredited resolved authority');
    assert(vc.zkSubject.actualCgpaScaled === 845, 'ZK subject actualCgpaScaled === 845');
    assert(vc.zkSubject.hashAlgorithm === 'Poseidon(2)', 'ZK subject hashAlgorithm === Poseidon(2)');
    assert(!!vc.zkSubject.studentSecret, 'Student blinding secret generated in ZK subject');
    assert(!!vc.zkSubject.commitment, 'Poseidon commitment generated in ZK subject');
    assert(vc.proof?.merkleRoot === 'PENDING_LEDGER_ANCHOR', 'Proof merkleRoot is properly labeled as pending ledger anchor');
    console.log(`  ZK Subject Commitment: ${vc.zkSubject.commitment}`);
  }

  // --------------------------------------------------------------------------
  // TEST 6: Cryptographic Circuit Compatibility Check
  // --------------------------------------------------------------------------
  console.log('\n[Test 6/6] Proving W3C Ingested Credential via Circom Groth16 Circuit...');
  if (actionResult.credential && fs.existsSync(WASM_PATH) && fs.existsSync(ZKEY_PATH) && fs.existsSync(VKEY_PATH)) {
    const vc = actionResult.credential;
    const vKey = JSON.parse(fs.readFileSync(VKEY_PATH, 'utf8'));

    // Threshold: prove CGPA >= 7.50 (750)
    const thresholdScaled = 750;
    const circuitInputs = {
      actualCgpaScaled: vc.zkSubject.actualCgpaScaled,
      studentSecret: vc.zkSubject.studentSecret,
      thresholdScaled: thresholdScaled,
      expectedCommitment: vc.zkSubject.commitment,
    };

    const tStartProve = performance.now();
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      circuitInputs,
      WASM_PATH,
      ZKEY_PATH
    );
    const tProve = performance.now() - tStartProve;

    console.log(`  Client-side Groth16 proof computed in ${tProve.toFixed(1)} ms`);
    assert(publicSignals[0] === thresholdScaled.toString(), 'Public signal 0 matches thresholdScaled (750)');
    assert(publicSignals[1] === vc.zkSubject.commitment, 'Public signal 1 matches Poseidon commitment');

    const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);
    assert(isValid === true, 'Groth16 zk-SNARK proof of ingested credential verified successfully!');
  } else {
    console.log('  Skipping live SnarkJS check (WASM or ZKEY not present on disk)');
  }

  console.log('\n================================================================');
  console.log(`  Phase 4 Test Suite Completed: ${passed}/${total} assertions PASSED`);
  console.log('================================================================\n');

  process.exit(0);
}

runPhase4Tests().catch((err) => {
  console.error('\nTest Suite Fatal Error:', err);
  process.exit(1);
});
