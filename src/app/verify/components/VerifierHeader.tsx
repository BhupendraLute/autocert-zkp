'use client';

import React from 'react';
import { ShieldCheck, Zap, Lock, Database } from 'lucide-react';

export function VerifierHeader() {
  return (
    <div className="space-y-4">
      {/* Convention Badge */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-2" />
          Avishkar 2026-27 • Engineering & Technology (UG)
        </span>
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono bg-slate-900 text-slate-400 border border-slate-800">
          RTMNU Autonomous Ledger
        </span>
      </div>

      {/* Main Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </span>
            Public Verifier Portal
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Sub-10ms Edge & Client-Side Groth16 zk-SNARK Verification over Curve BN128
          </p>
        </div>

        {/* Live Metrics Pills */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Target: &lt; 10ms</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            <span>0% PII Exposed</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            <Database className="w-3.5 h-3.5 text-purple-400" />
            <span>₹0 Gas / Compute</span>
          </div>
        </div>
      </div>
    </div>
  );
}
