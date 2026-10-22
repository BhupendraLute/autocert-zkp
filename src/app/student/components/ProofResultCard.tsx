'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Download,
  QrCode,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { ProofPayload } from '@/lib/types/proof';

interface ProofResultCardProps {
  generatedPayload: ProofPayload;
  generatedToken: string;
  proverLatency: number | null;
  parsedThreshold?: number;
  downloadProofJson: () => void;
}

export function ProofResultCard({
  generatedPayload,
  generatedToken,
  proverLatency,
  downloadProofJson,
}: ProofResultCardProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/verify?data=${encodeURIComponent(generatedToken)}`
      : '';

  const handleCopy = (text: string, key: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const isBelowTarget = proverLatency !== null && proverLatency <= 1200;

  return (
    <div className="border border-emerald-500/30 rounded-2xl bg-gradient-to-br from-emerald-950/20 via-slate-900/60 to-slate-950 p-6 space-y-6 shadow-2xl">
      {/* Success Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              zk-SNARK Groth16 Proof Generated!
            </h3>
            <p className="text-xs text-slate-400">
              Evaluated locally via WebAssembly BN128 in{' '}
              <strong className="text-emerald-400">
                {proverLatency?.toFixed(1)} ms
              </strong>{' '}
              {isBelowTarget ? '(< 1.2s target achieved).' : '(Target: < 1.2s).'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={downloadProofJson}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 flex items-center gap-1.5 transition self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span>Download JSON</span>
        </button>
      </div>

      {/* Proof Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">
            Proof Size
          </span>
          <span className="text-sm font-bold font-mono text-cyan-400">~384 B</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">
            Local Latency
          </span>
          <span className="text-sm font-bold font-mono text-emerald-400">
            {proverLatency?.toFixed(0)} ms
          </span>
        </div>
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">
            PII Exposed
          </span>
          <span className="text-sm font-bold font-mono text-emerald-400">0.00 %</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">
            Gas / Compute Cost
          </span>
          <span className="text-sm font-bold font-mono text-cyan-400">₹0.00</span>
        </div>
      </div>

      {/* Dynamic QR Code & Share Link */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* QR Code Presentation */}
        <div className="md:col-span-1 flex flex-col items-center justify-center p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
          <div className="p-2.5 bg-white rounded-lg shadow-md">
            <QRCodeSVG
              value={shareUrl}
              size={150}
              level="M"
              marginSize={0}
            />
          </div>
          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
            <QrCode className="w-3 h-3 text-cyan-400" />
            Scan on Smartphone
          </span>
        </div>

        {/* Shareable Link & Verification Direct Action */}
        <div className="md:col-span-2 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Shareable Verification URL</span>
              <span className="text-[10px] font-mono text-slate-500">
                Payload Token: {generatedToken.length} chars
              </span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 truncate focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleCopy(shareUrl, 'url')}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition flex items-center gap-1 shrink-0"
              >
                {copiedKey === 'url' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              href={`/verify?data=${encodeURIComponent(generatedToken)}`}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Test Instantly in Public Verifier (/verify)</span>
            </Link>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Anyone receiving this link or scanning the QR code can cryptographically verify that your CGPA ≥ {generatedPayload.threshold} in &lt; 10ms with zero knowledge of your actual grades.
          </p>
        </div>
      </div>

      {/* Cryptographic Public Signals Accordion */}
      <div className="pt-4 border-t border-slate-800/80 space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between text-slate-400">
          <span className="uppercase text-[10px] tracking-wider text-slate-300">
            Public Signals Disclosed in Proof
          </span>
          <span className="text-[10px] text-cyan-400">2 Signals</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">
              Signal[0]: Scaled Threshold
            </span>
            <span className="font-bold text-slate-200">
              {generatedPayload.publicSignals[0]} ({generatedPayload.threshold} CGPA)
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">
              Signal[1]: Poseidon Commitment
            </span>
            <span className="font-bold text-cyan-300 truncate block">
              {generatedPayload.publicSignals[1]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
