import Link from 'next/link';
import {
  Cpu,
  Lock,
  ArrowRight,
  Database,
  Sparkles,
  Zap,
  Award,
  BarChart3,
  ExternalLink,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 bg-indigo-950/60 border border-indigo-800/40 px-3.5 py-1.5 rounded-full shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            RTMNU Avishkar Research Convention • Engineering &amp; Technology UG
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Cryptographic Credential Ledger with{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400 bg-clip-text text-transparent">
              Zero-Knowledge Redaction
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Eliminates transcript tampering and protects student privacy during verification. Students prove academic
            eligibility (e.g. CGPA &ge; 7.50) directly in the browser without revealing unredacted marks, via client-side
            Groth16 zk-SNARKs and an immutable Poseidon Merkle root ledger at ₹0 cost.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/student"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-sm shadow-xl shadow-indigo-600/25 transition-all"
            >
              <Lock className="w-4 h-4" />
              <span>Launch Student Vault</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/verify"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition-all"
            >
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Public Verifier Portal</span>
            </Link>

            <Link
              href="/benchmarks"
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-500/30 font-semibold text-sm transition-all"
            >
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>Avishkar Benchmarks</span>
            </Link>
          </div>
        </div>

        {/* Feature Cards Grid (4 Pillars) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          {/* Card 1: Authority Ingestion */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">1. AI Ingestion Agent</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ingests unstructured grade cards into W3C JSON-LD schemas using Vercel AI SDK and evaluates Poseidon
                commitments with blinding salts.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-medium">
              <Link href="/issue" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                <span>Authority Portal</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
              <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                Phase 4 Ready
              </span>
            </div>
          </div>

          {/* Card 2: Student Prover Vault */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">2. Client Groth16 Prover</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Web Worker WASM prover compiles BN128 witness locally (projected ~0.6–1.2s on mobile devices). Private marks remain in browser
                memory during proof generation, ensuring zero witness disclosure.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-medium">
              <Link href="/student" className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                <span>Student Vault</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
              <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                Phase 5 Ready
              </span>
            </div>
          </div>

          {/* Card 3: Public Edge Verifier */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">3. Sub-10ms Verifier</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Recruiters verify 384-byte tokens in &lt;10ms via 3 bilinear pairings on BN128, cross-referenced with
                Supabase Merkle roots.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-medium">
              <Link href="/verify" className="text-purple-400 hover:text-purple-300 flex items-center gap-1">
                <span>Edge Verifier</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
              <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                Phase 6 Ready
              </span>
            </div>
          </div>

          {/* Card 4: Avishkar Benchmarking Hub */}
          <div className="bg-slate-900/40 border border-indigo-500/30 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group hover:border-indigo-500/50 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-emerald-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center mb-4">
                <Award className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">4. Benchmark Suite</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Empirical cross-device quantitative matrix, live client-side WebAssembly hardware profiler, and bilinear pairing verification metrics.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-medium">
              <Link href="/benchmarks" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                <span>View Benchmarks</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
              <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                Phase 7 Ready
              </span>
            </div>
          </div>
        </div>

        {/* Avishkar Empirical Metrics Bar */}
        <Link
          href="/benchmarks"
          className="mt-16 bg-slate-900/50 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 backdrop-blur-sm block group transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-400">
              Avishkar 2026-27 Quantitative Empirical Results
            </span>
            <span className="text-xs text-slate-400 group-hover:text-white flex items-center gap-1 font-medium">
              <span>Explore Benchmark Matrix &amp; Live Profiler</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
              <span className="text-xl font-extrabold text-white font-mono">312 ms</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Desktop Proving Latency (Tproof)</span>
            </div>
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
              <span className="text-xl font-extrabold text-emerald-400 font-mono">&lt; 10 ms</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Edge Bilinear Pairing (Tverify)</span>
            </div>
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
              <span className="text-xl font-extrabold text-purple-300 font-mono">384 B</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">ZK Proof Payload (99.98% drop)</span>
            </div>
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
              <span className="text-xl font-extrabold text-emerald-400 font-mono">0.00%</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">PII Exposure (DPDP Compliant)</span>
            </div>
          </div>
        </Link>
      </main>
    </div>
  );
}
