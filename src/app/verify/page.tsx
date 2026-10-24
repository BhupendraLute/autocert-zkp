'use client';

import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { useVerifier } from './hooks/useVerifier';
import { VerifierHeader } from './components/VerifierHeader';
import { VerifierIntake } from './components/VerifierIntake';
import { VerificationCertificate } from './components/VerificationCertificate';
import { CryptographicInspector } from './components/CryptographicInspector';

function VerifierContent() {
  const {
    activeTab,
    setActiveTab,
    selectedPresetId,
    activeToken,
    currentPayloadSource,
    verificationResult,
    isVerifying,
    isInspectorOpen,
    setIsInspectorOpen,
    handleVerifyToken,
    handleVerifyJson,
    handleSelectPreset,
  } = useVerifier();

  return (
    <div className="space-y-8">
      <VerifierHeader />

      <VerifierIntake
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedPresetId={selectedPresetId}
        onSelectPreset={handleSelectPreset}
        onVerifyToken={handleVerifyToken}
        onVerifyJson={handleVerifyJson}
        isVerifying={isVerifying}
        currentPayloadSource={currentPayloadSource}
      />

      <VerificationCertificate
        result={verificationResult}
        isVerifying={isVerifying}
        onOpenInspector={() => setIsInspectorOpen(true)}
        activeToken={activeToken}
      />

      <CryptographicInspector
        result={verificationResult}
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
      />
    </div>
  );
}

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
          <VerifierContent />
        </Suspense>
      </div>
    </main>
  );
}
