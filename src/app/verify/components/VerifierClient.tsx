'use client';

import React from 'react';
import { useVerifier } from '../hooks/useVerifier';
import { VerifierHeader } from './VerifierHeader';
import { VerifierIntake } from './VerifierIntake';
import { VerificationCertificate } from './VerificationCertificate';
import { CryptographicInspector } from './CryptographicInspector';

export function VerifierClient() {
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
