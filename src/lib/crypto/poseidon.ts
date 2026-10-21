import { buildPoseidon } from 'circomlibjs';
import { ZkSubject } from '../types/credential';

/**
 * BN128 elliptic curve scalar field order (r).
 * Circom circuits and Groth16 operate over Fr where r is prime:
 * r = 21888242871839275222246405745257275088548364400416034343698204186575808495617
 */
export const BN128_SCALAR_FIELD_ORDER = BigInt(
  '21888242871839275222246405745257275088548364400416034343698204186575808495617'
);

// Cache the initialized Poseidon hasher to avoid redundant WASM re-instantiation
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedPoseidon: any = null;

/**
 * Retrieves or initializes the Poseidon hasher from circomlibjs.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getPoseidon(): Promise<any> {
  if (!cachedPoseidon) {
    cachedPoseidon = await buildPoseidon();
  }
  return cachedPoseidon;
}

/**
 * Scales a floating-point CGPA (e.g. 8.45) by 100 to an integer (e.g. 845).
 * Finite field arithmetic requires discrete integer representation.
 */
export function scaleCgpa(cgpa: number): number {
  if (typeof cgpa !== 'number' || isNaN(cgpa)) {
    throw new Error(`Invalid CGPA: ${cgpa}. Must be a valid numeric value.`);
  }

  const scaled = Math.round(cgpa * 100);

  if (scaled < 0 || scaled > 1000) {
    throw new Error(
      `CGPA out of bounds: ${cgpa} (scaled: ${scaled}). Must be between 0.00 and 10.00.`
    );
  }

  return scaled;
}

/**
 * Generates a cryptographically secure 256-bit blinding factor (studentSecret)
 * guaranteed to reside strictly within the BN128 scalar field Fr.
 */
export function generateStudentSecret(): string {
  if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.getRandomValues) {
    throw new Error(
      'Cryptographically secure Web Crypto API (crypto.getRandomValues) is required but unavailable in this environment.'
    );
  }

  const bytes = new Uint8Array(32);
  globalThis.crypto.getRandomValues(bytes);

  // Convert bytes to BigInt hex
  let hex = '0x';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }

  let secretInt = BigInt(hex);
  // Ensure strict scalar field constraint: 1 <= secretInt < r
  secretInt = (secretInt % (BN128_SCALAR_FIELD_ORDER - BigInt(1))) + BigInt(1);

  return secretInt.toString(10);
}

/**
 * Evaluates the 2-input Poseidon hash commitment:
 * expectedCommitment = Poseidon(actualCgpaScaled, studentSecret)
 * 
 * Returns the decimal string representation of the finite field element.
 */
export async function computePoseidonCommitment(
  actualCgpaScaled: number | bigint,
  studentSecret: string | bigint
): Promise<string> {
  const poseidon = await getPoseidon();
  const hash = poseidon([actualCgpaScaled, studentSecret]);
  return poseidon.F.toString(hash);
}

/**
 * Generates the complete ZkSubject payload for a given CGPA.
 */
export async function createZkSubject(
  cgpa: number,
  providedSecret?: string
): Promise<ZkSubject> {
  const actualCgpaScaled = scaleCgpa(cgpa);
  const studentSecret = providedSecret || generateStudentSecret();
  const commitment = await computePoseidonCommitment(actualCgpaScaled, studentSecret);

  return {
    actualCgpaScaled,
    studentSecret,
    commitment,
    hashAlgorithm: 'Poseidon(2)',
  };
}
