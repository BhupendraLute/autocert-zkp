'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, FileCheck, KeyRound, Sparkles } from 'lucide-react';
import clsx from 'clsx';

export function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Overview', icon: Sparkles },
    { href: '/issue', label: '1. University Issuer', icon: FileCheck },
    { href: '/student', label: '2. Student Vault', icon: KeyRound },
    { href: '/verify', label: '3. Public Verifier', icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-white group-hover:text-cyan-400 transition">
                AutoCert<span className="text-cyan-400">-ZKP</span>
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Avishkar 2026-27
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono tracking-tight">
              Client-Side zk-SNARK Ledger • BN128
            </p>
          </div>
        </Link>

        <nav className="flex items-center space-x-1 sm:space-x-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  'flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition',
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                )}
              >
                <Icon className={clsx('w-4 h-4', isActive ? 'text-cyan-400' : 'text-slate-500')} />
                <span className="hidden sm:inline">{link.label}</span>
                <span className="sm:hidden">{link.label.split(' ')[1] || link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
            ₹0 Gas • Groth16
          </span>
        </div>
      </div>
    </header>
  );
}
