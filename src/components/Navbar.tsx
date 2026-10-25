'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  FileCheck,
  KeyRound,
  Sparkles,
  Award,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import clsx from 'clsx';

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Close mobile drawer whenever the route changes
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

  const links = [
    { href: '/', label: 'Overview', shortLabel: 'Overview', icon: Sparkles },
    { href: '/issue', label: 'University Issuer', shortLabel: 'Issuer', icon: FileCheck },
    { href: '/student', label: 'Student Vault', shortLabel: 'Vault', icon: KeyRound },
    { href: '/verify', label: 'Public Verifier', shortLabel: 'Verifier', icon: ShieldCheck },
    { href: '/benchmarks', label: 'Research Benchmarks', shortLabel: 'Benchmarks', icon: Award },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center space-x-2.5 sm:space-x-3 group shrink-0 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base sm:text-lg tracking-tight text-white whitespace-nowrap group-hover:text-indigo-300 transition">
                AutoCert<span className="text-emerald-400">-ZKP</span>
              </span>
              <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                Avishkar
              </span>
            </div>
            <p className="hidden sm:block text-[10px] sm:text-[11px] text-slate-400 font-mono tracking-tight truncate">
              Client-Side zk-SNARK Ledger • BN128
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center space-x-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  'flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition',
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm shadow-indigo-500/10 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                )}
              >
                <Icon className={clsx('w-3.5 h-3.5', isActive ? 'text-indigo-400' : 'text-slate-500')} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Tablet Navigation (compact label) */}
        <nav className="hidden md:flex xl:hidden items-center space-x-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  'flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition',
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                )}
              >
                <Icon className={clsx('w-3.5 h-3.5', isActive ? 'text-indigo-400' : 'text-slate-500')} />
                <span>{link.shortLabel}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action / Status Pill */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="hidden lg:flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
              ₹0 Gas • Groth16
            </span>
          </div>

          {/* Mobile Menu Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle Navigation Menu"
            className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-indigo-400" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800/90 bg-slate-950/95 backdrop-blur-xl px-4 py-4 space-y-2 shadow-2xl animate-in slide-in-from-top-2 duration-200 max-h-[calc(100dvh-4rem)] overflow-y-auto">
          <div className="flex items-center justify-between px-2 py-1 mb-2 text-[11px] font-mono text-slate-400 border-b border-slate-900 pb-2">
            <span>Avishkar 2026-27 Navigation</span>
            <span className="text-emerald-400 font-semibold">₹0 Gas BN128</span>
          </div>

          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={clsx(
                  'flex items-center justify-between p-3 rounded-xl text-sm font-medium transition',
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 font-semibold shadow-inner'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/80 border border-slate-900'
                )}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={clsx(
                      'p-2 rounded-lg',
                      isActive ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-900 text-slate-400'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{link.label}</span>
                </div>
                <ChevronRight className={clsx('w-4 h-4', isActive ? 'text-indigo-400' : 'text-slate-600')} />
              </Link>
            );
          })}

          <div className="pt-3 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-500 px-2">
            <span>RTMNU Engineering &amp; Tech UG</span>
            <span>Groth16 / WASM</span>
          </div>
        </div>
      )}
    </header>
  );
}
