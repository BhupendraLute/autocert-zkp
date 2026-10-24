'use client';

import React, { useState } from 'react';
import {
  X,
  Code,
  Copy,
  CheckCircle2,
  Cpu,
  Layers,
  Database,
  Calculator,
} from 'lucide-react';
import { VerificationResult } from '@/lib/types/verifier';

interface CryptographicInspectorProps {
  result: VerificationResult | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CryptographicInspector({
  result,
  isOpen,
  onClose,
}: CryptographicInspectorProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen || !result) return null;

  const { crypto, diagnostics, ledger, payload } = result;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Cryptographic Proof Inspector</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-800">
                  BN128 • Groth16
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Mathematical R1CS witness coordinates and bilinear pairing validation
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          {/* Mathematical Pairing Formula Box */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold uppercase tracking-wider text-[11px]">
              <Calculator className="w-4 h-4" />
              <span>Bilinear Pairing Verification Equation on $BN128$</span>
            </div>
            <div className="p-3 bg-slate-900 rounded-lg font-mono text-xs text-slate-200 overflow-x-auto">
              <code>e(A, B) = e(α, β) + e(∑ x_i · γ_i, δ) + e(C, δ)</code>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Where A, C ∈ G₁, B ∈ G₂, and xᵢ are the public inputs: x₀ = thresholdScaled ({crypto.thresholdScaled}) and x₁ = Poseidon(CGPA, Salt) ({crypto.expectedCommitment ? `${crypto.expectedCommitment.slice(0, 16)}...` : 'N/A'}).
            </p>
          </div>

          {/* Public Signals Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Public Signals Revealed in Proof</span>
              </span>
              <span className="font-mono text-[10px] text-slate-500">2 Signals</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[11px]">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase block">Signal[0] — Scaled Threshold</span>
                <span className="font-bold text-slate-100 text-sm">{crypto.thresholdScaled}</span>
                <span className="text-slate-400 text-[10px] block">
                  Float representation: <strong>{crypto.threshold.toFixed(2)} CGPA</strong>
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase block">Signal[1] — Poseidon Commitment</span>
                <span className="font-bold text-cyan-400 text-xs break-all block">
                  {crypto.expectedCommitment}
                </span>
                <span className="text-slate-400 text-[10px] block">
                  Poseidon(actualCgpaScaled, studentSecret)
                </span>
              </div>
            </div>
          </div>

          {/* Groth16 Elliptic Curve Points */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-cyan-400" />
                <span>Groth16 Curve Points (G1 & G2 on Alt_BN128)</span>
              </span>
              <span className="font-mono text-[10px] text-slate-500">~384 Bytes Payload</span>
            </div>

            <div className="space-y-3 font-mono text-[10px]">
              {/* Point A */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-slate-400">
                  <strong className="text-cyan-400">πA ∈ G1 (2 Scalar Coordinates)</strong>
                  <button
                    type="button"
                    onClick={() => handleCopy(JSON.stringify(diagnostics.piA), 'piA')}
                    className="hover:text-white"
                  >
                    {copiedKey === 'piA' ? 'Copied!' : 'Copy πA'}
                  </button>
                </div>
                <div className="text-slate-300 break-all space-y-1">
                  <div>x: {diagnostics.piA[0] || 'N/A'}</div>
                  <div>y: {diagnostics.piA[1] || 'N/A'}</div>
                </div>
              </div>

              {/* Point B */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-slate-400">
                  <strong className="text-cyan-400">πB ∈ G2 (2x2 Field Extension Coordinates)</strong>
                  <button
                    type="button"
                    onClick={() => handleCopy(JSON.stringify(diagnostics.piB), 'piB')}
                    className="hover:text-white"
                  >
                    {copiedKey === 'piB' ? 'Copied!' : 'Copy πB'}
                  </button>
                </div>
                <div className="text-slate-300 break-all space-y-1">
                  <div>x: [{diagnostics.piB[0]?.[0] || 'N/A'}, {diagnostics.piB[0]?.[1] || 'N/A'}]</div>
                  <div>y: [{diagnostics.piB[1]?.[0] || 'N/A'}, {diagnostics.piB[1]?.[1] || 'N/A'}]</div>
                </div>
              </div>

              {/* Point C */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-slate-400">
                  <strong className="text-cyan-400">πC ∈ G1 (2 Scalar Coordinates)</strong>
                  <button
                    type="button"
                    onClick={() => handleCopy(JSON.stringify(diagnostics.piC), 'piC')}
                    className="hover:text-white"
                  >
                    {copiedKey === 'piC' ? 'Copied!' : 'Copy πC'}
                  </button>
                </div>
                <div className="text-slate-300 break-all space-y-1">
                  <div>x: {diagnostics.piC[0] || 'N/A'}</div>
                  <div>y: {diagnostics.piC[1] || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Institutional Supabase Ledger Registry Info */}
          <div className="space-y-2.5">
            <span className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>PostgreSQL Merkle Ledger Anchoring (Supabase)</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-[11px]">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5">
                <span className="text-[10px] text-slate-500 uppercase block">Institution Name</span>
                <span className="font-bold text-slate-200">
                  {ledger.institution?.name || payload?.issuer?.name || 'RTMNU Nagpur'}
                </span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5">
                <span className="text-[10px] text-slate-500 uppercase block">Batch Root Hash</span>
                <span className="font-bold text-cyan-300 truncate block">
                  {ledger.rootRecord?.root_hash || payload?.merkleRoot || '192847192837192837192837192837'}
                </span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5">
                <span className="text-[10px] text-slate-500 uppercase block">Revocation Check</span>
                <span
                  className={
                    ledger.isRevoked
                      ? 'font-bold text-rose-400'
                      : ledger.isValidRoot
                      ? 'font-bold text-emerald-400'
                      : 'font-bold text-amber-400'
                  }
                >
                  {ledger.isRevoked
                    ? 'Revoked Leaf'
                    : ledger.isValidRoot
                    ? 'Unrevoked Leaf'
                    : 'Unconfirmed Status'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            Total latency: {diagnostics.totalLatencyMs.toFixed(2)} ms
          </span>
          <button
            type="button"
            onClick={() => handleCopy(JSON.stringify(payload, null, 2), 'rawPayload')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition"
          >
            {copiedKey === 'rawPayload' ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied Raw JSON!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Raw Proof JSON</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
