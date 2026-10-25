import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  ArrowRight,
  Award,
  ArrowLeft,
} from 'lucide-react';
import { LiveBenchmarkCard } from './components/LiveBenchmarkCard';
import { BenchmarkMatrixTable } from './components/BenchmarkMatrixTable';
import { ComparativeCharts } from './components/ComparativeCharts';
import { AvishkarDeliverablesHub } from './components/AvishkarDeliverablesHub';
import benchmarkResults from '../../../docs/benchmarks/benchmark-results.json';
import { HardwareProfile } from '@/lib/types/benchmark';

export const metadata = {
  title: 'Avishkar Benchmarks & Research Deliverables | AutoCert-ZKP',
  description:
    'Empirical performance profiling, live client-side WebAssembly proving benchmarks, and Avishkar 2026-27 research deliverables for AutoCert-ZKP.',
};

export default function BenchmarksPage() {
  const desktopMean = benchmarkResults.provingMetrics.mean.toFixed(1);
  const verifyMean = benchmarkResults.verificationMetrics.mean.toFixed(1);
  const tokenBytes = benchmarkResults.payloadMetrics.base64TokenBytes.toLocaleString();
  const reductionPercent = benchmarkResults.payloadMetrics.bandwidthReductionPercent;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Navigation Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20 shrink-0 flex items-center justify-center hover:opacity-90 transition-opacity"
            >
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
              </div>
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-white text-sm sm:text-base truncate">
                  AutoCert-ZKP
                </span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  Avishkar 2026-27
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block truncate">
                Empirical Research Benchmarks &amp; Presentation Suite
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/"
              className="text-xs font-medium text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors hidden md:flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back Home</span>
            </Link>
            <Link
              href="/verify"
              className="text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <span>Public Verifier</span>
            </Link>
            <Link
              href="/student"
              className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
            >
              <span>Student Vault</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-3.5 py-1.5 rounded-full shadow-inner">
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            Avishkar Research Convention (RTMNU) • Engineering &amp; Technology UG
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Empirical Cryptographic Benchmarks &amp;{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400 bg-clip-text text-transparent">
              Research Deliverables
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Empirical quantitative profiling of client-side Groth16 zk-SNARK proof generation ({desktopMean}ms desktop baseline),
            edge verification ({verifyMean}ms Node benchmark), {reductionPercent}% payload compression ({tokenBytes} bytes), and 0.00% PII disclosure on ₹0 cloud compute.
          </p>
        </div>

        {/* Section 1: Live In-Browser Client Profiler */}
        <section aria-label="Live In-Browser Benchmark Profiler">
          <LiveBenchmarkCard />
        </section>

        {/* Section 2: Visual Comparative Analytics */}
        <section aria-labelledby="charts-heading">
          <div className="mb-4">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-400">
              Comparative Performance Metrics
            </span>
            <h2 id="charts-heading" className="text-xl font-bold text-white tracking-tight mt-0.5">
              Zero-Knowledge Efficiency vs. Traditional Centralized Portals
            </h2>
          </div>
          <ComparativeCharts />
        </section>

        {/* Section 3: Cross-Device Empirical Matrix */}
        <section aria-label="Cross-Device Quantitative Performance Matrix">
          <BenchmarkMatrixTable profiles={benchmarkResults.deviceProfiles as HardwareProfile[]} />
        </section>

        {/* Section 4: Avishkar Deliverables Hub */}
        <section aria-label="Avishkar Research and Presentation Deliverables Hub">
          <AvishkarDeliverablesHub />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 AutoCert-ZKP • RTMNU Avishkar Research Convention (Engineering &amp; Technology UG)</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">BN128 Bilinear Pairings</span>
            <span>•</span>
            <span className="text-slate-400">Poseidon Sponge (142 Gates)</span>
            <span>•</span>
            <span className="text-slate-400">₹0 Cloud Compute</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
