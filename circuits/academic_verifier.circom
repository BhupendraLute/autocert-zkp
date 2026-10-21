pragma circom 2.1.6;

include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/poseidon.circom";

/**
 * AcademicRangeVerifier
 * AutoCert-ZKP Core Arithmetic Circuit
 * 
 * Proves that actualCgpaScaled >= thresholdScaled AND that
 * Poseidon(actualCgpaScaled, studentSecret) == expectedCommitment
 * WITHOUT revealing actualCgpaScaled or studentSecret.
 */
template AcademicRangeVerifier() {
    // ------------------------------------------------------------------------
    // PRIVATE SIGNALS (Client-side witness only, never exposed publicly)
    // ------------------------------------------------------------------------
    signal input actualCgpaScaled; // e.g. 8.45 -> integer 845
    signal input studentSecret;    // Cryptographic blinding factor / salt

    // ------------------------------------------------------------------------
    // PUBLIC SIGNALS (Revealed to Verifier / Ledger)
    // ------------------------------------------------------------------------
    signal input thresholdScaled;    // e.g. 7.50 -> integer 750
    signal input expectedCommitment; // Poseidon hash committed on University Record

    // ------------------------------------------------------------------------
    // 1. RANGE CHECK CONSTRAINT: actualCgpaScaled >= thresholdScaled
    // ------------------------------------------------------------------------
    // 16-bit comparator supports integer range [0, 65535] (CGPA scaled 100x max ~1000)
    component comp = GreaterEqThan(16);
    comp.in[0] <== actualCgpaScaled;
    comp.in[1] <== thresholdScaled;

    // Enforce that comp.out === 1 (actualCgpaScaled >= thresholdScaled)
    comp.out === 1;

    // ------------------------------------------------------------------------
    // 2. CRYPTOGRAPHIC COMMITMENT INTEGRITY: Pre-image Verification
    // ------------------------------------------------------------------------
    component hasher = Poseidon(2);
    hasher.inputs[0] <== actualCgpaScaled;
    hasher.inputs[1] <== studentSecret;

    // Enforce that computed commitment matches the expected public commitment
    expectedCommitment === hasher.out;
}

// Declare main component with explicit public inputs
component main {public [thresholdScaled, expectedCommitment]} = AcademicRangeVerifier();
