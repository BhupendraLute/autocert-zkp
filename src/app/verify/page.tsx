import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { VerifierClient } from './components/VerifierClient';

export const metadata = {
  title: 'Public Verifier Portal | AutoCert-ZKP',
  description:
    'Sub-10ms Edge & Client-Side Groth16 zk-SNARK Verification over Curve BN128 with Zero-Knowledge Redaction.',
};

// Opt this segment out of instant navigation validation because it consumes dynamic URL search params (?data=...)
export const instant = false;

function VerifierLoadingSkeleton() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
      <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      <p className="text-xs font-mono text-slate-400">
        Initializing Sub-10ms Verifier Engine...
      </p>
    </div>
  );
}

export default function VerifierPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 font-sans selection:bg-cyan-500/30">
      <div className="max-w-5xl mx-auto">
        <Suspense fallback={<VerifierLoadingSkeleton />}>
          <VerifierClient />
        </Suspense>
      </div>
    </main>
  );
}
