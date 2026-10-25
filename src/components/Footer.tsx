import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Award } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-900 bg-slate-950/90 py-8 text-xs text-slate-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-900">
          <div className="flex items-center space-x-3 text-center md:text-left">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 shrink-0 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <span className="font-bold text-white tracking-tight">AutoCert-ZKP</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Avishkar 2026-27
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Rashtrasant Tukadoji Maharaj Nagpur University • Engineering &amp; Technology (UG)
              </p>
            </div>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium">
            <Link href="/" className="hover:text-white transition-colors">
              Overview
            </Link>
            <Link href="/issue" className="hover:text-white transition-colors">
              Authority Issuer
            </Link>
            <Link href="/student" className="hover:text-white transition-colors">
              Student Vault
            </Link>
            <Link href="/verify" className="hover:text-white transition-colors">
              Public Verifier
            </Link>
            <Link href="/benchmarks" className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors">
              <Award className="w-3.5 h-3.5" />
              <span>Research Benchmarks</span>
            </Link>
          </nav>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>© 2026 AutoCert-ZKP • Avishkar Research Convention. Free-tier open-source architecture.</p>
          <div className="flex flex-wrap items-center justify-center gap-3 font-mono">
            <span>Groth16 BN128</span>
            <span className="text-slate-600">•</span>
            <span>Poseidon Hash (142 Gates)</span>
            <span className="text-slate-600">•</span>
            <span>W3C JSON-LD</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400">₹0 Gas / Cloud Compute</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
