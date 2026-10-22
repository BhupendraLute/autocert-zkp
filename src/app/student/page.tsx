'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { useStudentVault } from './hooks/useStudentVault';
import { VaultHeader } from './components/VaultHeader';
import { CredentialSelector } from './components/CredentialSelector';
import { ProverParameters } from './components/ProverParameters';
import { ProofResultCard } from './components/ProofResultCard';

export default function StudentVaultPage() {
  const {
    isMounted,
    activeCredential,
    sourceMode,
    setSourceMode,
    selectedPresetId,
    localCredential,
    actualCgpa,
    actualCgpaScaled,
    studentSecret,
    expectedCommitment,
    thresholdInput,
    setThresholdInput,
    parsedThreshold,
    thresholdScaled,
    isSatisfied,
    isProving,
    telemetry,
    generatedPayload,
    generatedToken,
    proverLatency,
    proofError,
    jsonImportText,
    setJsonImportText,
    importError,
    fileInputRef,
    handlePresetSelect,
    handleFileDrop,
    handleManualJsonImport,
    handleGenerateProof,
    downloadProofJson,
    setGeneratedPayload,
    setGeneratedToken,
    setProofError,
  } = useStudentVault();

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        <VaultHeader actualCgpa={actualCgpa} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <CredentialSelector
              sourceMode={sourceMode}
              setSourceMode={setSourceMode}
              selectedPresetId={selectedPresetId}
              handlePresetSelect={handlePresetSelect}
              localCredential={localCredential}
              activeCredential={activeCredential}
              fileInputRef={fileInputRef}
              handleFileDrop={handleFileDrop}
              jsonImportText={jsonImportText}
              setJsonImportText={setJsonImportText}
              handleManualJsonImport={handleManualJsonImport}
              importError={importError}
              actualCgpa={actualCgpa}
              actualCgpaScaled={actualCgpaScaled}
              studentSecret={studentSecret}
              expectedCommitment={expectedCommitment}
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <ProverParameters
              thresholdInput={thresholdInput}
              setThresholdInput={setThresholdInput}
              thresholdScaled={thresholdScaled}
              parsedThreshold={parsedThreshold}
              actualCgpa={actualCgpa}
              isSatisfied={isSatisfied}
              isProving={isProving}
              telemetry={telemetry}
              proofError={proofError}
              activeCredential={activeCredential}
              handleGenerateProof={handleGenerateProof}
              onThresholdReset={() => {
                setGeneratedPayload(null);
                setGeneratedToken(null);
                setProofError(null);
              }}
            />

            {generatedPayload && generatedToken && (
              <ProofResultCard
                generatedPayload={generatedPayload}
                generatedToken={generatedToken}
                proverLatency={proverLatency}
                downloadProofJson={downloadProofJson}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
