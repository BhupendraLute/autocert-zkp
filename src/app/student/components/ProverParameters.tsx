'use client';

import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Cpu,
  Clock,
} from 'lucide-react';
import { TelemetryEvent } from '@/lib/types/proof';
import { W3CCredential } from '@/lib/types/credential';

interface ProverParametersProps {
  thresholdInput: string;
  setThresholdInput: (val: string) => void;
  thresholdScaled: number;
  parsedThreshold: number;
  actualCgpa: number;
  isSatisfied: boolean;
  isProving: boolean;
  telemetry: TelemetryEvent | null;
  proofError: string | null;
  activeCredential: W3CCredential | null;
  handleGenerateProof: () => void;
  onThresholdReset: () => void;
}

export function ProverParameters({
  thresholdInput,
  setThresholdInput,
  thresholdScaled,
  parsedThreshold,
  actualCgpa,
  isSatisfied,
  isProving,
  telemetry,
  proofError,
  activeCredential,
  handleGenerateProof,
  onThresholdReset,
}: ProverParametersProps) {
  const handleThresholdChange = (val: string) => {
    setThresholdInput(val);
    onThresholdReset();
  };

  return (
    <div className="border border-slate-800 rounded-2xl bg-slate-900/60 p-6 space-y-6">
      <div>
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          Eligibility Proof Parameters
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Specify the threshold required by the recruiter or admission authority.
        </p>
      </div>

      {/* Threshold Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Minimum CGPA Threshold to Prove
          </label>
          <span className="text-xs font-mono text-cyan-400">
            Scaled: {thresholdScaled}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="number"
              step="0.05"
              min="0.00"
              max="10.00"
              value={thresholdInput}
              disabled={isProving}
              onChange={(e) => handleThresholdChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-lg font-bold font-mono text-white focus:outline-none focus:border-cyan-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <span className="absolute right-3.5 top-3.5 text-xs text-slate-500 font-mono">
              / 10.00
            </span>
          </div>

          {/* Preset threshold pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {['6.00', '7.00', '7.50', '8.00', '8.50'].map((val) => (
              <button
                key={val}
                type="button"
                disabled={isProving}
                onClick={() => handleThresholdChange(val)}
                className={`px-3 py-3 rounded-xl text-xs font-mono font-medium transition border disabled:opacity-50 disabled:cursor-not-allowed ${
                  thresholdInput === val
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        {/* Pre-flight eligibility indicator */}
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 transition ${
            isSatisfied
              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
              : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
          }`}
        >
          {isSatisfied ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div>
            <strong className="block font-medium">
              {isSatisfied
                ? `Private Qualification Satisfied: ${actualCgpa} ≥ ${parsedThreshold}`
                : `Constraint Failure Warning: ${actualCgpa} < ${parsedThreshold}`}
            </strong>
            <span className="text-[11px] opacity-80 mt-0.5 block">
              {isSatisfied
                ? 'Your blinded CGPA satisfies this threshold. The Circom 16-bit comparator constraint (comp.out === 1) will be satisfied.'
                : 'Your CGPA is strictly below the required threshold. The circuit will mathematically reject the witness (comp.out === 1 fails), proving sound verification.'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={handleGenerateProof}
        disabled={isProving || !activeCredential}
        className={`w-full py-4 px-6 rounded-xl font-semibold text-sm transition shadow-lg flex items-center justify-center gap-2.5 ${
          isProving
            ? 'bg-cyan-600/50 text-cyan-200 cursor-wait'
            : isSatisfied
            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/25 active:scale-[0.99]'
            : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-amber-500/25 active:scale-[0.99]'
        }`}
      >
        {isProving ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Computing zk-SNARK Groth16 Proof (WebAssembly)...</span>
          </>
        ) : (
          <>
            <ShieldCheck className="w-5 h-5" />
            <span>
              {isSatisfied
                ? `Generate Zero-Knowledge Proof (CGPA ≥ ${parsedThreshold})`
                : `Test Constraint Rejection (CGPA < ${parsedThreshold})`}
            </span>
          </>
        )}
      </button>

      {/* Prover Telemetry Visualizer */}
      {(isProving || telemetry) && (
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Web Worker Telemetry</span>
            </span>
            <span className="text-cyan-400 font-bold">
              {telemetry?.percent ?? 0}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300 ease-out"
              style={{ width: `${telemetry?.percent ?? 0}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="truncate pr-2">{telemetry?.message}</span>
            {telemetry?.elapsedMs !== undefined && (
              <span className="text-slate-500 shrink-0 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {telemetry.elapsedMs.toFixed(1)} ms
              </span>
            )}
          </div>
        </div>
      )}

      {/* Error banner */}
      {proofError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs space-y-1.5">
          <div className="flex items-center gap-2 font-semibold text-red-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Soundness Enforced: Proof Rejected</span>
          </div>
          <p className="text-[11px] leading-relaxed text-red-200/90">{proofError}</p>
        </div>
      )}
    </div>
  );
}
