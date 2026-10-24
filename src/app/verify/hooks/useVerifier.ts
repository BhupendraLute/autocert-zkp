'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { VerificationResult } from '@/lib/types/verifier';
import { PresetProofItem } from '@/lib/data/mock-proofs';
import { verifyFromToken, verifyFromJson } from '@/lib/zk/verifier-engine';
import { IntakeTab } from '../components/VerifierIntake';

export function useVerifier() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('data');

  const [activeTab, setActiveTab] = useState<IntakeTab>('presets');
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [activeToken, setActiveToken] = useState<string | null>(null);
  const [currentPayloadSource, setCurrentPayloadSource] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);

  // Prevent multiple executions on re-render
  const processedUrlTokenRef = useRef<string | null>(null);

  const handleVerifyToken = useCallback(
    async (token: string, sourceLabel?: string) => {
      setIsVerifying(true);
      setSelectedPresetId(null);
      setActiveToken(token);
      setCurrentPayloadSource(sourceLabel || 'Base64 Token');

      try {
        const result = await verifyFromToken(token);
        setVerificationResult(result);
      } catch (err: unknown) {
        console.error('Verification error:', err);
      } finally {
        setIsVerifying(false);
      }
    },
    []
  );

  const handleVerifyJson = useCallback(async (jsonStr: string) => {
    setIsVerifying(true);
    setSelectedPresetId(null);
    setActiveToken(null);
    setCurrentPayloadSource('JSON File / Raw Text');

    try {
      const result = await verifyFromJson(jsonStr);
      setVerificationResult(result);
    } catch (err: unknown) {
      console.error('JSON verification error:', err);
    } finally {
      setIsVerifying(false);
    }
  }, []);

  const handleSelectPreset = useCallback(
    (preset: PresetProofItem) => {
      handleVerifyToken(preset.token, preset.name);
      setSelectedPresetId(preset.id);
    },
    [handleVerifyToken]
  );

  // Auto-verify on initial load if ?data=<token> query param is present
  useEffect(() => {
    if (tokenFromUrl && tokenFromUrl !== processedUrlTokenRef.current) {
      processedUrlTokenRef.current = tokenFromUrl;
      handleVerifyToken(tokenFromUrl, 'URL Parameter (?data=...)');
    }
  }, [tokenFromUrl, handleVerifyToken]);

  return {
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
  };
}
