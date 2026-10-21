import Link from 'next/link';
import {
  ShieldCheck,
  Cpu,
  Lock,
  ArrowRight,
  Database,
  Sparkles,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-white text-sm sm:text-base truncate">AutoCert-ZKP</span>
                <span className="hidden sm:inline-flex text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  Avishkar 2026-27
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block truncate">
                Verifiable Academic Credential Ledger with Client-Side Zero-Knowledge Redaction
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/issue"
              className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 shrink-0"
            >
              <span>Authority Ingestion</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full flex flex-col justify-center">
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
            Eliminates transcript tampering and protects student privacy during verification. In planned milestone
            capabilities, students will prove academic eligibility (e.g. CGPA &ge; 7.50) directly in the browser without
            revealing unredacted marks, via client-side Groth16 zk-SNARKs and an immutable Poseidon Merkle root ledger.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/issue"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-sm shadow-xl shadow-indigo-600/25 transition-all"
            >
              <Cpu className="w-4 h-4" />
              <span>Launch Authority Ingestion (Phase 4)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1.5">1. OpenCode Zen AI Parser</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ingests unstructured marksheet text into standardized W3C JSON-LD credentials using Vercel AI SDK and
              evaluates discrete Poseidon sponge commitments with 256-bit scalar blinding factors.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-indigo-400 font-medium">
              <Link href="/issue" className="flex items-center gap-1 hover:text-indigo-300">
                <span>Try Authority Portal</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
              <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                Phase 4 Ready
              </span>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1.5">2. Client-Side Groth16 Prover</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Executes Circom WebAssembly in an isolated background Web Worker. Computes a 384-byte BN128 proof
              in &lt;1.2 seconds without transmitting any private grades or PII over the wire.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Student Vault</span>
              <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                Phase 5 Target
              </span>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1.5">3. Immutable Ledger &amp; Verify</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Recruiters verify the 384-byte proof payload in &lt;10 milliseconds at edge via 3 bilinear pairings on BN128,
              anchored to Supabase PostgreSQL Merkle roots at ₹0 cloud cost.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Public Edge Route</span>
              <span className="text-[10px] uppercase font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                Phase 6 Target
              </span>
            </div>
          </div>
        </div>

        {/* Avishkar Empirical Metrics Bar */}
        <div className="mt-16 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
          <div className="text-center sm:text-left mb-4">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-400">
              Avishkar 2026-27 Quantitative Research Target Benchmarks
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
              <span className="text-xl font-extrabold text-white font-mono">&lt; 1.2 s</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Target Proving Time (Tproof)</span>
            </div>
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
              <span className="text-xl font-extrabold text-white font-mono">&lt; 10 ms</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Target Edge Verification (Tverify)</span>
            </div>
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
              <span className="text-xl font-extrabold text-emerald-400 font-mono">384 B</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Target Proof Payload</span>
            </div>
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
              <span className="text-xl font-extrabold text-indigo-400 font-mono">0% PII</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Target Data Minimization</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 AutoCert-ZKP • Avishkar Research Convention (RTMNU, Engineering &amp; Technology UG)</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Groth16 BN128</span>
            <span>•</span>
            <span className="text-slate-400">Poseidon Hash</span>
            <span>•</span>
            <span className="text-slate-400">W3C VC Data Model</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
