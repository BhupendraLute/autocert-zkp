'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import {
  FileText,
  Upload,
  QrCode,
  Sparkles,
  Camera,
  CameraOff,
  Clipboard,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import clsx from 'clsx';
import { PresetProofSelector } from './PresetProofSelector';
import { PresetProofItem } from '@/lib/data/mock-proofs';

export type IntakeTab = 'presets' | 'paste' | 'upload' | 'camera';

interface VerifierIntakeProps {
  activeTab: IntakeTab;
  setActiveTab: (tab: IntakeTab) => void;
  selectedPresetId: string | null;
  onSelectPreset: (preset: PresetProofItem) => void;
  onVerifyToken: (token: string) => void;
  onVerifyJson: (jsonStr: string) => void;
  isVerifying: boolean;
  currentPayloadSource?: string | null;
}

export function VerifierIntake({
  activeTab,
  setActiveTab,
  selectedPresetId,
  onSelectPreset,
  onVerifyToken,
  onVerifyJson,
  isVerifying,
  currentPayloadSource,
}: VerifierIntakeProps) {
  // Paste tab state
  const [pasteInput, setPasteInput] = useState('');
  const [pasteError, setPasteError] = useState<string | null>(null);

  // Upload tab state
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Camera QR state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const qrImageInputRef = useRef<HTMLInputElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const scanLoopRef = useRef<() => void>(() => {});

  // Stop camera stream safely
  const stopCamera = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  // Process decoded QR data (can be full URL or raw Base64 token)
  const handleDetectedQrData = useCallback(
    (data: string) => {
      try {
        const trimmed = data.trim();
        if (trimmed.includes('/verify?data=')) {
          const url = new URL(trimmed);
          const token = url.searchParams.get('data');
          if (token) {
            onVerifyToken(token);
            return;
          }
        } else if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
          onVerifyJson(trimmed);
          return;
        } else {
          onVerifyToken(trimmed);
        }
      } catch {
        onVerifyToken(data.trim());
      }
    },
    [onVerifyToken, onVerifyJson]
  );

  // Scan frame loop using jsqr
  const scanQrFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !cameraActive) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data) {
        stopCamera();
        handleDetectedQrData(code.data);
        return;
      }
    }

    animationFrameId.current = requestAnimationFrame(() => scanLoopRef.current());
  }, [cameraActive, stopCamera, handleDetectedQrData]);

  useEffect(() => {
    scanLoopRef.current = scanQrFrame;
  }, [scanQrFrame]);

  useEffect(() => {
    if (cameraActive) {
      animationFrameId.current = requestAnimationFrame(() => scanLoopRef.current());
    }
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [cameraActive]);

  // Clean up media tracks on component unmount
  useEffect(() => {
    const videoNode = videoRef.current;
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      if (videoNode) {
        videoNode.srcObject = null;
      }
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  const handleTabChange = (tabId: IntakeTab) => {
    if (tabId !== 'camera' && cameraActive) {
      stopCamera();
    }
    setActiveTab(tabId);
  };

  // Start webcam
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      mediaStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: unknown) {
      console.warn('Camera stream error:', err);
      const isNotAllowed = err instanceof Error && err.name === 'NotAllowedError';
      const msg = err instanceof Error ? err.message : 'Unable to open camera.';
      setCameraError(
        isNotAllowed
          ? 'Camera permission denied. Allow access or upload a QR screenshot below.'
          : msg
      );
      setCameraActive(false);
    }
  };

  // Decode QR from static image upload
  const handleQrImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            handleDetectedQrData(code.data);
          } else {
            setCameraError('No valid QR code was detected in this image. Try another screenshot.');
          }
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Handle manual paste submit
  const handlePasteSubmit = () => {
    setPasteError(null);
    const trimmed = pasteInput.trim();
    if (!trimmed) {
      setPasteError('Please paste a token or proof JSON.');
      return;
    }

    if (trimmed.startsWith('{')) {
      try {
        JSON.parse(trimmed);
        onVerifyJson(trimmed);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Syntax error';
        setPasteError(`Invalid JSON format: ${msg}`);
      }
    } else {
      // Check if it's a URL
      if (trimmed.includes('?data=')) {
        try {
          const url = new URL(trimmed);
          const token = url.searchParams.get('data');
          if (token) {
            onVerifyToken(token);
            return;
          }
        } catch {
          // ignore
        }
      }
      onVerifyToken(trimmed);
    }
  };

  // File drag & drop handlers
  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        const trimmed = text.trim();
        if (trimmed.startsWith('{')) {
          onVerifyJson(trimmed);
        } else {
          onVerifyToken(trimmed);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const tabs: { id: IntakeTab; label: string; icon: React.ElementType }[] = [
    { id: 'presets', label: 'Avishkar Presets', icon: Sparkles },
    { id: 'paste', label: 'Paste Token / JSON', icon: FileText },
    { id: 'upload', label: 'Upload Proof File', icon: Upload },
    { id: 'camera', label: 'Scan Camera QR', icon: QrCode },
  ];

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-xl">
      {/* Intake Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap gap-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition',
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
                )}
              >
                <Icon className={clsx('w-3.5 h-3.5', isActive ? 'text-cyan-400' : 'text-slate-500')} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {currentPayloadSource && (
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/50 px-2 py-0.5 rounded truncate max-w-xs">
            Active: {currentPayloadSource}
          </span>
        )}
      </div>

      {/* Tab 1: Presets */}
      {activeTab === 'presets' && (
        <PresetProofSelector
          selectedPresetId={selectedPresetId}
          onSelectPreset={onSelectPreset}
          isVerifying={isVerifying}
        />
      )}

      {/* Tab 2: Paste Token or JSON */}
      {activeTab === 'paste' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clipboard className="w-3.5 h-3.5 text-cyan-400" />
              <span>Paste Base64 URL Token or Proof JSON</span>
            </label>
            <button
              type="button"
              onClick={() => {
                setPasteInput('');
                setPasteError(null);
              }}
              className="text-[10px] text-slate-500 hover:text-slate-300"
            >
              Clear
            </button>
          </div>

          <textarea
            rows={4}
            value={pasteInput}
            onChange={(e) => {
              setPasteInput(e.target.value);
              setPasteError(null);
            }}
            placeholder="Paste /verify?data=... token string or JSON-serialized Groth16 proof object..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition resize-none placeholder:text-slate-600"
          />

          {pasteError && (
            <div className="flex items-center gap-1.5 text-xs text-rose-400">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{pasteError}</span>
            </div>
          )}

          <button
            type="button"
            disabled={isVerifying || !pasteInput.trim()}
            onClick={handlePasteSubmit}
            className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-medium text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Evaluating Cryptographic Pairings...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verify Payload Instantly (&lt; 10ms)</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Tab 3: Upload File */}
      {activeTab === 'upload' && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={clsx(
            'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-3',
            dragActive
              ? 'border-cyan-500 bg-cyan-950/20 text-cyan-300'
              : 'border-slate-800 hover:border-slate-700 bg-slate-950/50 text-slate-400'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,text/plain"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-200">
              Drop proof JSON file here, or <span className="text-cyan-400">browse</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports `autocert-proof-*.json` files exported directly from the Student Vault
            </p>
          </div>
        </div>
      )}

      {/* Tab 4: Camera QR Scanner */}
      {activeTab === 'camera' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                <span>Live Smartphone QR Code Ingestion</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Point your webcam or phone camera at the candidate&apos;s dynamic QR code.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {!cameraActive ? (
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium flex items-center gap-1.5 transition shadow-sm"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Start Camera</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-3 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-medium flex items-center gap-1.5 transition shadow-sm"
                >
                  <CameraOff className="w-3.5 h-3.5" />
                  <span>Stop Camera</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => qrImageInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition"
              >
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>Upload QR Image</span>
              </button>
              <input
                ref={qrImageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleQrImageUpload(e.target.files[0]);
                  }
                }}
              />
            </div>
          </div>

          {/* Camera Viewfinder (Kept mounted, hidden when idle) */}
          <div
            className={clsx(
              'relative rounded-xl overflow-hidden border border-cyan-500/40 bg-black aspect-video max-w-md mx-auto shadow-2xl',
              cameraActive ? 'block' : 'hidden'
            )}
          >
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              muted
              playsInline
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Viewfinder Target Reticle */}
            <div className="absolute inset-0 border-2 border-cyan-400/40 m-8 rounded-lg pointer-events-none flex items-center justify-center">
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
            </div>
            <span className="absolute bottom-2 left-2 text-[10px] font-mono bg-black/60 text-cyan-300 px-2 py-0.5 rounded">
              Scanning frames via jsQR...
            </span>
          </div>

          {!cameraActive && (
            <div className="p-6 bg-slate-950/60 rounded-xl border border-slate-800 text-center space-y-2">
              <Camera className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">
                Camera is currently idle. Click &quot;Start Camera&quot; to scan from webcam or &quot;Upload QR Image&quot; to test a screenshot.
              </p>
            </div>
          )}

          {cameraError && (
            <div className="p-3 bg-rose-950/20 border border-rose-500/30 rounded-xl flex items-center gap-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{cameraError}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
