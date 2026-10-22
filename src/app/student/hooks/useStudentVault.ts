'use client';

import { useState, useMemo, useRef, useSyncExternalStore } from 'react';
import { PRESET_CREDENTIALS } from '@/lib/data/mock-credentials';
import { W3CCredential } from '@/lib/types/credential';
import { ProofPayload, TelemetryEvent } from '@/lib/types/proof';
import {
  generateZkProofWithWorker,
  encodeProofPayload,
  safeJsonStringify,
} from '@/lib/zk/prover-client';

function subscribeToLocalStorage(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getStoredCredentialRaw(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('autocert_issued_credential');
}

/**
 * Validates the required credentialSubject, issuer, and zkSubject fields against W3CCredential.
 * Checks actualCgpaScaled by type so 0.00 remains a valid scaled score.
 */
export function validateCredentialShape(data: unknown): W3CCredential | null {
  if (!data || typeof data !== 'object') return null;
  const c = data as Partial<W3CCredential>;

  // Validate credentialSubject
  if (
    !c.credentialSubject ||
    typeof c.credentialSubject !== 'object' ||
    typeof c.credentialSubject.studentName !== 'string' ||
    !c.credentialSubject.studentName.trim() ||
    typeof c.credentialSubject.degree !== 'string' ||
    !c.credentialSubject.degree.trim() ||
    typeof c.credentialSubject.cgpa !== 'number' ||
    isNaN(c.credentialSubject.cgpa)
  ) {
    return null;
  }

  // Validate issuer
  if (
    !c.issuer ||
    typeof c.issuer !== 'object' ||
    typeof c.issuer.name !== 'string' ||
    !c.issuer.name.trim() ||
    typeof c.issuer.code !== 'string' ||
    !c.issuer.code.trim()
  ) {
    return null;
  }

  // Validate zkSubject: require actualCgpaScaled to be a safe integer and check bounds
  if (
    !c.zkSubject ||
    typeof c.zkSubject !== 'object' ||
    typeof c.zkSubject.actualCgpaScaled !== 'number' ||
    !Number.isSafeInteger(c.zkSubject.actualCgpaScaled) ||
    c.zkSubject.actualCgpaScaled < 0 ||
    c.zkSubject.actualCgpaScaled > 1000 ||
    typeof c.zkSubject.studentSecret !== 'string' ||
    !c.zkSubject.studentSecret.trim() ||
    typeof c.zkSubject.commitment !== 'string' ||
    !c.zkSubject.commitment.trim()
  ) {
    return null;
  }

  // Verify that zkSubject.actualCgpaScaled strictly corresponds to credentialSubject.cgpa
  // Reject credentials where displayed and proof-generation CGPA values conflict
  if (c.credentialSubject.cgpa !== c.zkSubject.actualCgpaScaled / 100) {
    return null;
  }

  return c as W3CCredential;
}

export function useStudentVault() {
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const storedCredentialRaw = useSyncExternalStore(
    subscribeToLocalStorage,
    getStoredCredentialRaw,
    () => null
  );

  const localCredential = useMemo<W3CCredential | null>(() => {
    if (!storedCredentialRaw) return null;
    try {
      const parsed = JSON.parse(storedCredentialRaw);
      return validateCredentialShape(parsed);
    } catch {
      return null;
    }
  }, [storedCredentialRaw]);

  const [selectedPresetId, setSelectedPresetId] = useState<string>('rajesh-raut');
  const [customCredential, setCustomCredential] = useState<W3CCredential | null>(null);
  const [sourceMode, setSourceMode] = useState<'preset' | 'local' | 'custom'>('preset');

  // Threshold controls
  const [thresholdInput, setThresholdInput] = useState<string>('7.50');

  // Proof generation state
  const [isProving, setIsProving] = useState<boolean>(false);
  const [telemetry, setTelemetry] = useState<TelemetryEvent | null>(null);
  const [generatedPayload, setGeneratedPayload] = useState<ProofPayload | null>(null);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [proverLatency, setProverLatency] = useState<number | null>(null);
  const [proofError, setProofError] = useState<string | null>(null);
  const [jsonImportText, setJsonImportText] = useState<string>('');
  const [importError, setImportError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine active credential
  const activeCredential: W3CCredential | null = useMemo(() => {
    if (sourceMode === 'local' && localCredential) return localCredential;
    if (sourceMode === 'custom' && customCredential) return customCredential;
    const found = PRESET_CREDENTIALS.find((p) => p.id === selectedPresetId);
    return found ? found.credential : PRESET_CREDENTIALS[0].credential;
  }, [sourceMode, localCredential, customCredential, selectedPresetId]);

  const actualCgpa = activeCredential?.credentialSubject.cgpa ?? 0;
  const actualCgpaScaled = activeCredential?.zkSubject.actualCgpaScaled ?? 0;
  const studentSecret = activeCredential?.zkSubject.studentSecret ?? '';
  const expectedCommitment = activeCredential?.zkSubject.commitment ?? '';

  const parsedThreshold = parseFloat(thresholdInput) || 0;
  const thresholdScaled = Math.round(parsedThreshold * 100);
  const isSatisfied = actualCgpaScaled >= thresholdScaled;

  const handlePresetSelect = (id: string) => {
    setSelectedPresetId(id);
    setSourceMode('preset');
    setGeneratedPayload(null);
    setGeneratedToken(null);
    setProofError(null);
    setTelemetry(null);
  };

  const handleFileDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const valid = validateCredentialShape(parsed);
        if (!valid) {
          throw new Error(
            'Missing or invalid credential attributes. Requires credentialSubject, issuer, and zkSubject (actualCgpaScaled, studentSecret, commitment).'
          );
        }
        setCustomCredential(valid);
        setSourceMode('custom');
        setImportError(null);
        setGeneratedPayload(null);
        setGeneratedToken(null);
      } catch (err: unknown) {
        setImportError(err instanceof Error ? err.message : 'Invalid W3C JSON-LD credential file');
      }
    };
    reader.readAsText(file);
  };

  const handleManualJsonImport = () => {
    try {
      const parsed = JSON.parse(jsonImportText);
      const valid = validateCredentialShape(parsed);
      if (!valid) {
        throw new Error(
          'Missing or invalid credential attributes. Requires credentialSubject, issuer, and zkSubject (actualCgpaScaled, studentSecret, commitment).'
        );
      }
      setCustomCredential(valid);
      setSourceMode('custom');
      setImportError(null);
      setGeneratedPayload(null);
      setGeneratedToken(null);
    } catch (err: unknown) {
      setImportError(err instanceof Error ? err.message : 'Invalid JSON format');
    }
  };

  const handleGenerateProof = async () => {
    if (!activeCredential) return;

    setIsProving(true);
    setProofError(null);
    setGeneratedPayload(null);
    setGeneratedToken(null);
    setProverLatency(null);

    try {
      const inputs = {
        actualCgpaScaled,
        studentSecret,
        thresholdScaled,
        expectedCommitment,
      };

      const result = await generateZkProofWithWorker(inputs, (event) => {
        setTelemetry(event);
      });

      const payload: ProofPayload = {
        version: '1.0',
        proof: result.proof,
        publicSignals: result.publicSignals,
        threshold: parsedThreshold,
        thresholdScaled,
        expectedCommitment,
        timestamp: Date.now(),
        issuer: {
          name: activeCredential.issuer.name,
          code: activeCredential.issuer.code,
          publicKey: activeCredential.issuer.publicKey,
        },
        merkleRoot: activeCredential.proof?.merkleRoot,
      };

      const token = encodeProofPayload(payload);

      setGeneratedPayload(payload);
      setGeneratedToken(token);
      setProverLatency(result.latencyMs);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === 'string'
          ? err
          : 'Failed to generate zero-knowledge proof.';

      // Identify specifically the confirmed threshold comparison constraint failure (line 36 in academic_verifier.circom: comp.out === 1)
      const isThresholdRejection =
        msg.includes('comp.out') ||
        (msg.includes('Assert Failed') && msg.includes('line: 36'));

      if (isThresholdRejection) {
        setProofError(
          'Circuit Constraint Rejection: comp.out === 1 failed. The arithmetic circuit strictly rejected the witness because actual CGPA is lower than the required threshold.'
        );
      } else {
        setProofError(msg);
      }
    } finally {
      setIsProving(false);
    }
  };

  const downloadProofJson = () => {
    if (!generatedPayload) return;
    const blob = new Blob([safeJsonStringify(generatedPayload)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `autocert-proof-threshold-${generatedPayload.threshold}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    isMounted,
    activeCredential,
    sourceMode,
    setSourceMode,
    selectedPresetId,
    localCredential,
    customCredential,
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
  };
}
