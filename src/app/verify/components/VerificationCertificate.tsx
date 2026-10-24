'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Copy,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Eye,
} from 'lucide-react';
import { VerificationResult } from '@/lib/types/verifier';

interface VerificationCertificateProps {
  result: VerificationResult | null;
  isVerifying: boolean;
  onOpenInspector: () => void;
  activeToken?: string | null;
}

export function VerificationCertificate({
  result,
  isVerifying,
  onOpenInspector,
  activeToken,
}: VerificationCertificateProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (!activeToken || typeof window === 'undefined') return;
    const shareUrl = `${window.location.origin}/verify?data=${encodeURIComponent(activeToken)}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. Verifying State
  if (isVerifying) {
    return (
      <div className="border border-cyan-500/30 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-900 p-8 text-center space-y-4 shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto animate-pulse">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white">
            Evaluating Bilinear Pairings on Curve BN128...
          </h3>
          <p className="text-xs text-slate-400">
            Computing $e(A, B) = e(\alpha, \beta) + e(x \cdot \gamma, \delta) + e(C, \delta)$ against static verification key
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-[11px] font-mono text-cyan-400 border border-slate-800">
          <Clock className="w-3.5 h-3.5 animate-spin" />
          <span>Benchmarking high-precision edge execution...</span>
        </div>
      </div>
    );
  }

  // 2. Idle State (No result yet)
  if (!result || result.status === 'idle') {
    return (
      <div className="border border-slate-800 rounded-2xl bg-slate-900/40 p-8 text-center space-y-4 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div className="space-y-1.5 max-w-md mx-auto">
          <h3 className="text-base font-bold text-white">No Proof Loaded</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Select one of the Avishkar presets above, paste a Base64 verification token, or scan a candidate&apos;s dynamic QR code to perform instant sub-10ms verification.
          </p>
        </div>
      </div>
    );
  }

  const { status, crypto, ledger, diagnostics, payload } = result;
  const isTargetAchieved = diagnostics.verificationLatencyMs <= 10.0;
  const thresholdFormatted = (crypto.thresholdScaled / 100).toFixed(2);
  const institutionName = ledger.institution?.name || payload?.issuer?.name || 'RTMNU';

  // 3. Valid Authenticated State
  if (status === 'valid') {
    return (
      <div className="border border-emerald-500/40 rounded-2xl bg-gradient-to-br from-emerald-950/25 via-slate-900/80 to-slate-950 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20 shrink-0">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  Credential Cryptographically Authenticated
                </h2>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  VERIFIED
                </span>
              </div>
              <p className="text-xs text-emerald-400/90 font-medium">
                zk-SNARK Groth16 mathematical proof confirmed in{' '}
                <strong>{diagnostics.verificationLatencyMs.toFixed(2)} ms</strong>{' '}
                {isTargetAchieved ? '(< 10ms target achieved)' : ''}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={onOpenInspector}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition"
            >
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>Inspect Coordinates</span>
            </button>
            {activeToken && (
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium flex items-center gap-1.5 transition"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Mathematical Guarantee Box */}
        <div className="p-4 sm:p-5 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Mathematical Guarantee</span>
          </div>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans">
            Candidate is proven to hold an authentic academic qualification issued by{' '}
            <strong className="text-white underline decoration-emerald-500/50">
              {institutionName}
            </strong>{' '}
            with an overall standing satisfying{' '}
            <span className="inline-block px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono font-bold text-base border border-emerald-500/30">
              CGPA ≥ {thresholdFormatted}
            </span>
            .
          </p>
        </div>

        {/* Zero-Knowledge Redaction Matrix */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Zero-Knowledge Redaction Audit (DPDP Act Compliance)</span>
            </span>
            <span className="text-[11px] font-mono text-emerald-400">0.00% PII Disclosed</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase">Candidate Exact CGPA</span>
              <span className="text-emerald-400 font-bold text-xs truncate block mt-0.5">
                [REDACTED IN WASM]
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase">Backlog History</span>
              <span className="text-emerald-400 font-bold text-xs truncate block mt-0.5">
                [ZERO PII EXPOSED]
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase">Subject Mark Distribution</span>
              <span className="text-emerald-400 font-bold text-xs truncate block mt-0.5">
                [ZERO PII EXPOSED]
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase">Blinding Salt (Secret)</span>
              <span className="text-cyan-400 font-bold text-xs truncate block mt-0.5">
                [LOCALLY BLINDED]
              </span>
            </div>
          </div>
        </div>

        {/* Cryptographic Telemetry Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
          <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Groth16 Pairing Latency</span>
            <span className="text-sm sm:text-base font-bold text-emerald-400">
              {diagnostics.verificationLatencyMs.toFixed(2)} ms
            </span>
            <span className="text-[9px] text-slate-500 block mt-0.5">3 Bilinear Pairings</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Ledger Query Latency</span>
            <span className="text-sm sm:text-base font-bold text-cyan-400">
              {diagnostics.ledgerLatencyMs.toFixed(2)} ms
            </span>
            <span className="text-[9px] text-slate-500 block mt-0.5">PostgreSQL Root Check</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Elliptic Curve & Protocol</span>
            <span className="text-sm sm:text-base font-bold text-slate-200">BN128 • Groth16</span>
            <span className="text-[9px] text-slate-500 block mt-0.5">Constant ~384B Proof</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Revocation State</span>
            <span className="text-sm sm:text-base font-bold text-emerald-400">Active</span>
            <span className="text-[9px] text-slate-500 block mt-0.5">Unrevoked Leaf</span>
          </div>
        </div>
      </div>
    );
  }

  // 4. Tampered / Crypto Failure State
  if (status === 'tampered' || status === 'invalid') {
    return (
      <div className="border border-rose-500/40 rounded-2xl bg-gradient-to-br from-rose-950/30 via-slate-900/90 to-slate-950 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-500/20 shrink-0">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  {crypto.isCryptographicallyValid
                    ? result.summaryTitle
                    : 'Cryptographic Verification Failed'}
                </h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                  REJECTED
                </span>
              </div>
              <p className="text-xs text-rose-400/90 font-medium">
                {crypto.isCryptographicallyValid ? (
                  result.summaryDescription
                ) : crypto.pairingChecked ? (
                  <>
                    Bilinear pairing check on curve BN128 rejected this proof in{' '}
                    <strong>{diagnostics.verificationLatencyMs.toFixed(2)} ms</strong>.
                  </>
                ) : (
                  crypto.error || result.summaryDescription || 'Proof could not be cryptographically evaluated.'
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenInspector}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition self-start sm:self-auto"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>{crypto.isCryptographicallyValid ? 'Inspect Proof Coordinates' : 'Inspect Failure Coordinates'}</span>
          </button>
        </div>

        {/* Diagnostic Explanation */}
        <div className="p-4 sm:p-5 rounded-xl bg-slate-950/80 border border-rose-500/30 space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <div className="flex items-center gap-2 font-semibold text-rose-400 uppercase tracking-wider text-xs">
            <XCircle className="w-4 h-4" />
            <span>
              {crypto.isCryptographicallyValid
                ? 'Institutional Ledger Diagnostic'
                : 'Cryptographic Diagnostic Report'}
            </span>
          </div>
          {crypto.isCryptographicallyValid ? (
            <div className="space-y-2">
              <p>{ledger.message || result.summaryDescription}</p>
              <p className="text-xs text-slate-400">
                While the mathematical zk-SNARK Groth16 proof is valid, the credential could not be verified against the accredited institutional Merkle root ledger.
              </p>
            </div>
          ) : (
            <>
              {crypto.pairingChecked ? (
                <p>
                  The mathematical pairing equation{' '}
                  <code className="text-rose-300 font-mono text-xs">
                    e(A, B) ≠ e(α, β) + e(x · γ, δ) + e(C, δ)
                  </code>{' '}
                  evaluated to false.
                </p>
              ) : (
                <p className="text-rose-300 font-sans">
                  {crypto.error || result.summaryDescription || 'Cryptographic verification could not be evaluated.'}
                </p>
              )}
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-400 font-sans">
                <li>
                  <strong>Signal Tampering Attack:</strong> The public threshold signal or Poseidon commitment was modified after the proof was generated (e.g. attempting to inflate a 7.50 qualifying cut-off to 9.00).
                </li>
                <li>
                  <strong>Coordinate Corruption:</strong> Elliptic curve coordinates $\pi_A \in G_1$ or $\pi_B \in G_2$ contain corrupted scalar bytes.
                </li>
                <li>
                  <strong>Zero False Positives:</strong> Under the discrete logarithm hardness assumption on BN128, fraudulent credentials cannot pass verification.
                </li>
              </ul>
            </>
          )}
        </div>

        {/* Telemetry */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Rejection Latency</span>
            <span className="text-sm font-bold text-rose-400">
              {diagnostics.verificationLatencyMs.toFixed(2)} ms
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Public Signals Checked</span>
            <span className="text-sm font-bold text-slate-300">
              {crypto.publicSignals?.length || 2} Signals
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Security Guarantee</span>
            <span className="text-sm font-bold text-cyan-400">128-bit Soundness</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Verifier Cost</span>
            <span className="text-sm font-bold text-slate-300">₹0.00</span>
          </div>
        </div>
      </div>
    );
  }

  // 5. Revoked Credential State
  if (status === 'revoked') {
    return (
      <div className="border border-amber-500/40 rounded-2xl bg-gradient-to-br from-amber-950/30 via-slate-900/90 to-slate-950 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/20 shrink-0">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  Credential Formally Revoked on Ledger
                </h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  REVOKED
                </span>
              </div>
              <p className="text-xs text-amber-400/90 font-medium">
                The Groth16 mathematical proof is valid, but the institutional authority has revoked this degree.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenInspector}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition self-start sm:self-auto"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>Inspect Revocation Proof</span>
          </button>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-slate-950/80 border border-amber-500/30 space-y-2 text-xs sm:text-sm text-slate-300">
          <div className="flex items-center gap-2 font-semibold text-amber-400 uppercase tracking-wider text-xs">
            <AlertTriangle className="w-4 h-4" />
            <span>PostgreSQL Ledger Revocation Record</span>
          </div>
          <p className="text-slate-200">
            {ledger.message || 'Credential was formally revoked by RTMNU registrar office.'}
          </p>
          <p className="text-xs text-slate-500 font-mono">
            Commitment Leaf: {crypto.expectedCommitment || '999999999999999999999999999999'}
          </p>
        </div>
      </div>
    );
  }

  // 6. Error state fallback
  return (
    <div className="border border-rose-500/30 rounded-2xl bg-slate-950 p-6 text-center space-y-3">
      <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
      <h3 className="text-base font-bold text-white">{result.summaryTitle}</h3>
      <p className="text-xs text-slate-400 max-w-md mx-auto">{result.summaryDescription}</p>
    </div>
  );
}
