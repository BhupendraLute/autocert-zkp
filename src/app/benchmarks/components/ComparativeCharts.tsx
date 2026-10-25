'use client';

import React from 'react';
import { BarChart3, ShieldCheck, Zap, HardDrive, Lock } from 'lucide-react';
import benchmarkData from '../../../../docs/benchmarks/benchmark-results.json';

export function ComparativeCharts() {
  const desktopProfile = benchmarkData.deviceProfiles.find((p) => p.category === 'desktop');
  const lowMobileProfile = benchmarkData.deviceProfiles.find((p) => p.category === 'low-end-mobile');
  const midMobileProfile = benchmarkData.deviceProfiles.find((p) => p.category === 'mid-tier-mobile');
  const legacyProfile = benchmarkData.deviceProfiles.find((p) => p.category === 'traditional-centralized');

  const desktopVerify = desktopProfile?.verificationTimeMs ?? benchmarkData.verificationMetrics.mean;
  const lowMobileVerify = lowMobileProfile?.verificationTimeMs ?? 14.2;
  const legacyVerify = legacyProfile?.verificationTimeMs ?? 2450.0;

  const desktopProving = desktopProfile?.provingTimeMs ?? benchmarkData.provingMetrics.mean;
  const midProving = midMobileProfile?.provingTimeMs ?? 580;
  const lowProving = lowMobileProfile?.provingTimeMs ?? 1240;

  const tokenBytes = benchmarkData.payloadMetrics.base64TokenBytes;
  const pdfBytes = benchmarkData.payloadMetrics.traditionalPdfBytes;
  const pdfMb = (pdfBytes / 1000000).toFixed(1);

  const verificationSpeedup = Math.round(legacyVerify / Math.max(0.1, desktopVerify));
  const footprintRatio = Math.round(pdfBytes / Math.max(1, tokenBytes));
  const reductionPercent = benchmarkData.payloadMetrics.bandwidthReductionPercent;
  const getVerifyWidthPercent = (val: number) =>
    Math.max(0.5, Math.min(100, (val / legacyVerify) * 100));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Verification Latency Bar Chart */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <Zap className="w-4 h-4" />
              <span>Verification Latency (Lower is Better)</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Linear Scale Comparison</span>
          </div>
          <h3 className="text-base font-bold text-white mb-1">
            Edge Bilinear Pairing vs. Traditional Cloud Lookup
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            AutoCert-ZKP evaluates 3 bilinear pairings on BN128 in sub-10ms target, while centralized systems
            require database roundtrips, PDF parsing, or OCR.
          </p>

          <div className="space-y-4">
            {/* Desktop Host */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-200 font-medium">AutoCert-ZKP (Desktop Host Measured)</span>
                <span className="font-mono text-emerald-400 font-bold">{desktopVerify.toFixed(1)} ms</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-3.5 p-0.5 border border-slate-800">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${getVerifyWidthPercent(desktopVerify)}%`, minWidth: '4px' }}
                />
              </div>
            </div>

            {/* Low-End Mobile */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-200 font-medium">AutoCert-ZKP (Budget Smartphone Projected)</span>
                <span className="font-mono text-emerald-400 font-bold">{lowMobileVerify.toFixed(1)} ms</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-3.5 p-0.5 border border-slate-800">
                <div
                  className="bg-gradient-to-r from-emerald-600 to-indigo-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${getVerifyWidthPercent(lowMobileVerify)}%`, minWidth: '4px' }}
                />
              </div>
            </div>

            {/* Traditional Portal */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Traditional Centralized Portal</span>
                <span className="font-mono text-rose-400 font-bold">{legacyVerify.toLocaleString()} ms</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-3.5 p-0.5 border border-slate-800">
                <div
                  className="bg-gradient-to-r from-rose-600 to-rose-400 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="text-emerald-400 font-semibold">{verificationSpeedup}× Speedup</span>
          <span>Constant-time 3 Bilinear Pairings</span>
        </div>
      </div>

      {/* 2. Payload Bandwidth Reduction Chart */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-400">
              <HardDrive className="w-4 h-4" />
              <span>Transferred Data Payload (Lower is Better)</span>
            </div>
            <span className="text-[11px] font-mono text-purple-400 font-bold">{reductionPercent}% Reduction</span>
          </div>
          <h3 className="text-base font-bold text-white mb-1">
            Compact {tokenBytes.toLocaleString()}-Byte zk-SNARK vs. {pdfMb} MB PDF Marksheet
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Eliminates multi-megabyte marksheet downloads, enabling instant verification over 2G/3G mobile
            networks in rural India without bandwidth lag.
          </p>

          <div className="space-y-5">
            {/* AutoCert ZK Token */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-200 font-medium">AutoCert-ZKP Groth16 Token</span>
                <span className="font-mono text-indigo-400 font-bold">{tokenBytes.toLocaleString()} Bytes</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-5 p-0.5 border border-slate-800 flex items-center">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-400 h-4 rounded-full flex items-center justify-center text-[9px] text-white font-bold"
                  style={{ width: `${Math.max(2, Math.min(100, (tokenBytes / pdfBytes) * 100))}%` }}
                >
                  &lt;2KB
                </div>
              </div>
            </div>

            {/* Standard Scanned PDF */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-400 font-medium">Conventional Scanned Transcript PDF</span>
                <span className="font-mono text-slate-400 font-bold">{pdfBytes.toLocaleString()} Bytes ({pdfMb} MB)</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-5 p-0.5 border border-slate-800">
                <div
                  className="bg-gradient-to-r from-slate-700 to-slate-600 h-4 rounded-full flex items-center justify-end pr-2 text-[9px] text-slate-300 font-bold"
                  style={{ width: '100%' }}
                >
                  {pdfMb} MB
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="text-purple-400 font-semibold">{footprintRatio.toLocaleString()}× Smaller Footprint</span>
          <span>Fits inside standard QR Code</span>
        </div>
      </div>

      {/* 3. Proving Latency Across Hardware Tiers */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400">
              <BarChart3 className="w-4 h-4" />
              <span>Prover Latency by Hardware Profile</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 font-semibold">Target: &lt; 1,200 ms</span>
          </div>
          <h3 className="text-base font-bold text-white mb-1">
            Client WebAssembly Proof Generation Time
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            142-constraint Poseidon circuit enables even budget MediaTek processors to synthesize
            proofs locally in ~1.2s.
          </p>

          <div className="space-y-4">
            {/* Desktop */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Desktop Host (Measured x86)</span>
                <span className="font-mono text-emerald-400 font-bold">{desktopProving.toFixed(0)} ms</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-3 p-0.5 border border-slate-800">
                <div
                  className="bg-indigo-500 h-2 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(5, (desktopProving / 1500) * 100))}%` }}
                />
              </div>
            </div>

            {/* Mid-Tier */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Mid-Tier Smartphone (Snapdragon 778G - Projected)</span>
                <span className="font-mono text-indigo-400 font-bold">{midProving.toFixed(0)} ms</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-3 p-0.5 border border-slate-800">
                <div
                  className="bg-indigo-400 h-2 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(5, (midProving / 1500) * 100))}%` }}
                />
              </div>
            </div>

            {/* Low-End */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Budget Smartphone (Helio G85 - Projected)</span>
                <span className="font-mono text-emerald-400 font-bold">{lowProving.toFixed(0)} ms</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-3 p-0.5 border border-slate-800">
                <div
                  className="bg-emerald-500 h-2 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(5, (lowProving / 1500) * 100))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="text-emerald-400 font-semibold">Zero UI Thread Freezing</span>
          <span>Web Worker Offloading</span>
        </div>
      </div>

      {/* 4. Privacy & PII Exposure Gauge */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <Lock className="w-4 h-4" />
              <span>Statutory Alignment: DPDP Act 2023</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 font-bold">Data Minimization</span>
          </div>
          <h3 className="text-base font-bold text-white mb-1">
            Personal Identifiable Information (PII) Disclosure
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Proving academic eligibility without exposing birth dates, residential addresses, parent names,
            or historical backlogs to employers.
          </p>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-slate-950/70 border border-emerald-500/30 rounded-xl p-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono">0.00%</div>
              <div className="text-[11px] text-slate-300 font-semibold mt-1">AutoCert-ZKP</div>
              <p className="text-[10px] text-slate-400 mt-1">
                Private marks remain in browser memory during proof generation.
              </p>
            </div>

            <div className="bg-slate-950/70 border border-rose-500/30 rounded-xl p-4">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-2">
                <Lock className="w-5 h-5" />
              </div>
              <div className="text-2xl font-extrabold text-rose-400 font-mono">100.0%</div>
              <div className="text-[11px] text-slate-300 font-semibold mt-1">Traditional Marksheet</div>
              <p className="text-[10px] text-slate-400 mt-1">
                Full unredacted transcript exposed to all recruiters.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="text-emerald-400 font-semibold">100% Privacy Preserving</span>
          <span>Zero Server Storage</span>
        </div>
      </div>
    </div>
  );
}
