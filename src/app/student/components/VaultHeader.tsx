'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, KeyRound, Lock, FileText, Cpu, Zap } from 'lucide-react';

interface VaultHeaderProps {
  actualCgpa: number;
}

export function VaultHeader({ actualCgpa }: VaultHeaderProps) {
  return (
    <div className="border border-slate-800/80 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/50 to-slate-950 p-6 sm:p-8 backdrop-blur shadow-2xl relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <KeyRound className="w-7 h-7" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                Student Credential Vault
                <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  WASM Groth16 Prover
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Prove academic eligibility without disclosing raw grades, backlogs, or private identity.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs text-slate-300 font-mono">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Client-Side Isolation: Active</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">0 bytes sent to network</p>
          </div>
          <Link
            href="/issue"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            Issue New
          </Link>
        </div>
      </div>

      {/* Privacy Guarantee Banner */}
      <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-200 block">Strict Data Minimization</strong>
            <span className="text-slate-400">
              Actual CGPA ({actualCgpa}) and blinding salt remain exclusively in browser memory.
            </span>
          </div>
        </div>
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <Cpu className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-200 block">Web Worker Offloading</strong>
            <span className="text-slate-400">
              Groth16 SnarkJS runs in background WebAssembly thread; zero main-thread UI freeze.
            </span>
          </div>
        </div>
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-200 block">Sub-1.2s Proving Latency</strong>
            <span className="text-slate-400">
              Algebraic Poseidon sponge scheme requires only 538 gates on curve BN128.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
