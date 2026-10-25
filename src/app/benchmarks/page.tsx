import React from 'react';
import { Award } from 'lucide-react';
import { LiveBenchmarkCard } from './components/LiveBenchmarkCard';
import { BenchmarkMatrixTable } from './components/BenchmarkMatrixTable';
import { ComparativeCharts } from './components/ComparativeCharts';
import benchmarkResults from '../../../docs/benchmarks/benchmark-results.json';
import { HardwareProfile } from '@/lib/types/benchmark';

export const metadata = {
  title: 'Empirical Benchmarks & Performance Suite | AutoCert-ZKP',
  description:
    'Empirical performance profiling, live client-side WebAssembly proving benchmarks, and comparative metrics for AutoCert-ZKP.',
};

export default function BenchmarksPage() {
  const desktopMean = benchmarkResults.provingMetrics.mean.toFixed(1);
  const verifyMean = benchmarkResults.verificationMetrics.mean.toFixed(1);
  const tokenBytes = benchmarkResults.payloadMetrics.base64TokenBytes.toLocaleString();
  const reductionPercent = benchmarkResults.payloadMetrics.bandwidthReductionPercent;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
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
              Performance Suite
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
      </main>
    </div>
  );
}
