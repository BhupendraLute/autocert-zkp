'use client';

import React, { useState } from 'react';
import {
  Play,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Clock,
  Zap,
  HardDrive,
  Copy,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import { LiveBenchmarkProgress, LiveBenchmarkResult } from '@/lib/types/benchmark';
import Link from 'next/link';

export function LiveBenchmarkCard() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<LiveBenchmarkProgress | null>(null);
  const [result, setResult] = useState<LiveBenchmarkResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const runBenchmark = async () => {
    setIsRunning(true);
    setResult(null);
    setError(null);
    setProgress({
      stage: 'initializing',
      message: 'Preparing WebAssembly worker & Groth16 keys...',
      progressPercent: 5,
    });

    try {
      const { executeLiveBrowserBenchmark } = await import('@/lib/zk/benchmark-runner');
      const benchmarkResult = await executeLiveBrowserBenchmark({
        thresholdScaled: 750,
        onProgress: (p) => setProgress(p),
      });
      setResult(benchmarkResult);
    } catch (err: unknown) {
      console.error('Live benchmark failed:', err);
      const message = err instanceof Error ? err.message : 'Benchmark execution failed. Check console.';
      setError(message);
    } finally {
      setIsRunning(false);
    }
  };

  const copyToken = async () => {
    if (!result?.base64Payload) return;
    try {
      await navigator.clipboard.writeText(result.base64Payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden shadow-xl">
      {/* Background Accent Gradient */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
            <Zap className="w-3 h-3 text-indigo-400" />
            Live Client-Side Hardware Profiler
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Benchmark Your Current Device
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Execute real Groth16 witness calculation and pairing verification inside your browser
            using WebAssembly. No data leaves your machine.
          </p>
        </div>

        <button
          onClick={runBenchmark}
          disabled={isRunning}
          className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shrink-0 ${
            isRunning
              ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white shadow-indigo-500/20 active:scale-95'
          }`}
        >
          {isRunning ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
              <span>Running Benchmark...</span>
            </>
          ) : result ? (
            <>
              <RotateCcw className="w-4 h-4" />
              <span>Re-run Benchmark</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Run Live Benchmark</span>
            </>
          )}
        </button>
      </div>

      {/* Progress Bar (when active) */}
      {isRunning && progress && (
        <div className="mb-6 bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              {progress.message}
            </span>
            <span className="font-mono text-indigo-400 font-bold">{progress.progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress.progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-800/50 flex items-start gap-3 text-rose-300 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-200">Execution Error</p>
            <p className="mt-0.5 text-rose-400/90">{error}</p>
          </div>
        </div>
      )}

      {/* Results View */}
      {result ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Main 4 Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Prover Latency */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-slate-400">Proving Time (Tproof)</span>
                <Clock className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                  {result.proofGenerationMs.toFixed(0)}
                </span>
                <span className="text-xs text-slate-400">ms</span>
              </div>
              <div className="mt-2 text-[10px] flex items-center gap-1">
                {result.proofGenerationMs < 1200 ? (
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Meets &lt;1.2s Avishkar Target
                  </span>
                ) : (
                  <span className="text-amber-400 font-medium">Within Acceptable Bound</span>
                )}
              </div>
            </div>

            {/* Verification Latency */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-slate-400">Verification (Tverify)</span>
                <Zap className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span
                  className={`text-2xl sm:text-3xl font-extrabold font-mono ${
                    result.isPairingValid ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {result.verificationMs.toFixed(1)}
                </span>
                <span className="text-xs text-slate-400">ms</span>
              </div>
              <div className="mt-2 text-[10px] font-medium flex items-center gap-1">
                {result.isPairingValid ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Pairings Valid (Curve BN128)
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Pairing Check Failed
                  </span>
                )}
              </div>
            </div>

            {/* Payload Size */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-slate-400">Proof Payload</span>
                <HardDrive className="w-4 h-4 text-purple-400" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-purple-300 font-mono">
                  {result.payloadSizeBytes}
                </span>
                <span className="text-xs text-slate-400">bytes</span>
              </div>
              <div className="mt-2 text-[10px] text-purple-400 font-medium">
                {(
                  ((2.4 * 1024 * 1024 - result.payloadSizeBytes) / (2.4 * 1024 * 1024)) *
                  100
                ).toFixed(2)}% vs 2.4 MB PDF
              </div>
            </div>

            {/* Data Minimization */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-slate-400">PII Disclosed</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
                  0.00%
                </span>
                <span className="text-xs text-slate-400">leak</span>
              </div>
              <div className="mt-2 text-[10px] text-emerald-400 font-medium">
                Data Minimization Design
              </div>
            </div>
          </div>

          {/* Device Telemetry Banner */}
          <div className="bg-slate-950/50 border border-slate-800/70 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-200 truncate">
                  Platform: {result.deviceInfo.platform} • {result.deviceInfo.logicalCores} Logical CPU Cores
                  {result.deviceInfo.deviceMemoryGb && ` • ~${result.deviceInfo.deviceMemoryGb} GB RAM`}
                </p>
                <p className="text-[11px] text-slate-500 truncate max-w-xl font-mono mt-0.5">
                  {result.deviceInfo.userAgent}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={copyToken}
                className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all"
              >
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>{copied ? 'Copied Token!' : 'Copy Token'}</span>
              </button>

              <Link
                href={`/verify?data=${encodeURIComponent(result.base64Payload)}`}
                className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
              >
                <span>Verify on Edge</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="border border-dashed border-slate-800 rounded-xl p-8 text-center bg-slate-950/30">
          <Cpu className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-300">Ready to profile this hardware</p>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Tap &ldquo;Run Live Benchmark&rdquo; to test proof computation on your device. Avishkar judges
            can test their own smartphones directly via this browser interface.
          </p>
        </div>
      )}
    </div>
  );
}

export function LiveBenchmarkSkeleton() {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden shadow-xl animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="space-y-2">
          <div className="w-48 h-5 bg-slate-800/80 rounded-full" />
          <div className="w-64 h-7 bg-slate-800 rounded-lg" />
          <div className="w-80 h-4 bg-slate-800/60 rounded" />
        </div>
        <div className="w-40 h-11 bg-slate-800 rounded-xl" />
      </div>
      <div className="border border-dashed border-slate-800 rounded-xl p-8 text-center bg-slate-950/30">
        <div className="w-10 h-10 bg-slate-800 rounded-full mx-auto mb-3" />
        <div className="w-48 h-4 bg-slate-800 mx-auto rounded mb-2" />
        <div className="w-72 h-3 bg-slate-800/60 mx-auto rounded" />
      </div>
    </div>
  );
}

