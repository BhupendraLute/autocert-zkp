'use client';

import React from 'react';
import {
  FileText,
  Sparkles,
  Upload,
  AlertTriangle,
  Lock,
  Unlock,
} from 'lucide-react';
import { PRESET_CREDENTIALS } from '@/lib/data/mock-credentials';
import { W3CCredential } from '@/lib/types/credential';

interface CredentialSelectorProps {
  sourceMode: 'preset' | 'local' | 'custom';
  setSourceMode: (mode: 'preset' | 'local' | 'custom') => void;
  selectedPresetId: string;
  handlePresetSelect: (id: string) => void;
  localCredential: W3CCredential | null;
  activeCredential: W3CCredential | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileDrop: (e: React.ChangeEvent<HTMLInputElement>) => void;
  jsonImportText: string;
  setJsonImportText: (text: string) => void;
  handleManualJsonImport: () => void;
  importError: string | null;
  actualCgpa: number;
  actualCgpaScaled: number;
  studentSecret: string;
  expectedCommitment: string;
}

export function CredentialSelector({
  sourceMode,
  setSourceMode,
  selectedPresetId,
  handlePresetSelect,
  localCredential,
  activeCredential,
  fileInputRef,
  handleFileDrop,
  jsonImportText,
  setJsonImportText,
  handleManualJsonImport,
  importError,
  actualCgpa,
  actualCgpaScaled,
  studentSecret,
  expectedCommitment,
}: CredentialSelectorProps) {
  return (
    <div className="space-y-6">
      {/* Source Selection Card */}
      <div className="border border-slate-800 rounded-2xl bg-slate-900/60 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            Credential Selection
          </h2>
          <span className="text-[11px] text-slate-400">W3C JSON-LD</span>
        </div>

        {/* Source Switcher */}
        <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setSourceMode('preset')}
            className={`py-1.5 rounded-lg font-medium transition ${
              sourceMode === 'preset'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Presets
          </button>
          <button
            type="button"
            onClick={() => setSourceMode('local')}
            disabled={!localCredential}
            className={`py-1.5 rounded-lg font-medium transition ${
              sourceMode === 'local'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : localCredential
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-600 cursor-not-allowed opacity-50'
            }`}
          >
            {localCredential ? 'From /issue' : 'Local (0)'}
          </button>
          <button
            type="button"
            onClick={() => setSourceMode('custom')}
            className={`py-1.5 rounded-lg font-medium transition ${
              sourceMode === 'custom'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Import
          </button>
        </div>

        {/* Preset List */}
        {sourceMode === 'preset' && (
          <div className="space-y-2">
            {PRESET_CREDENTIALS.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              const isRejectDemo = preset.id === 'under-threshold-test';
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetSelect(preset.id)}
                  className={`w-full text-left p-3 rounded-xl border transition flex flex-col gap-1 ${
                    isSelected
                      ? isRejectDemo
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                        : 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs">{preset.label}</span>
                    {isRejectDemo && (
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                        Reject Demo
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 line-clamp-1">
                    {preset.subtitle}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Local Storage Credential */}
        {sourceMode === 'local' && localCredential && (
          <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-cyan-400 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Loaded from Institutional Authority (/issue)</span>
            </div>
            <p className="text-slate-300 font-semibold">
              {localCredential.credentialSubject.studentName}
            </p>
            <p className="text-slate-400">{localCredential.credentialSubject.degree}</p>
          </div>
        )}

        {/* Custom Import Box */}
        {sourceMode === 'custom' && (
          <div className="space-y-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileDrop}
              accept=".json,.jsonld"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 px-3 border border-dashed border-slate-700 hover:border-cyan-500/50 rounded-xl bg-slate-950/60 text-center transition flex flex-col items-center justify-center gap-1.5"
            >
              <Upload className="w-5 h-5 text-slate-400" />
              <span className="text-xs font-medium text-slate-300">
                Upload W3C Credential File
              </span>
              <span className="text-[10px] text-slate-500">.json or .jsonld</span>
            </button>

            <textarea
              rows={3}
              placeholder="Or paste W3C JSON-LD here..."
              value={jsonImportText}
              onChange={(e) => setJsonImportText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-[11px] font-mono text-slate-300 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="button"
              onClick={handleManualJsonImport}
              className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded-lg text-slate-200 transition"
            >
              Load Pasted Credential
            </button>

            {importError && (
              <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{importError}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Credential Attributes & Privacy Separation Card */}
      {activeCredential && (
        <div className="border border-slate-800 rounded-2xl bg-slate-900/60 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Privacy Separation
            </h3>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              Dual Boundary
            </span>
          </div>

          {/* Subject Details */}
          <div className="space-y-1.5 text-xs border-b border-slate-800 pb-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Student:</span>
              <span className="font-semibold text-slate-200">
                {activeCredential.credentialSubject.studentName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Degree:</span>
              <span className="text-slate-300">
                {activeCredential.credentialSubject.degree}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Class:</span>
              <span className="text-slate-300">
                {activeCredential.credentialSubject.classification}
              </span>
            </div>
          </div>

          {/* Blinded Private Attributes */}
          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2 text-xs">
            <div className="flex items-center justify-between text-emerald-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                Private Witness (Blinded)
              </span>
              <span className="text-[10px] font-mono bg-emerald-500/20 px-1.5 py-0.5 rounded">
                Never Shared
              </span>
            </div>
            <div className="flex justify-between text-slate-300 font-mono text-[11px]">
              <span className="text-slate-400">Actual CGPA:</span>
              <span className="font-bold text-emerald-300">
                {actualCgpa} (Scaled: {actualCgpaScaled})
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 block">Student Secret Salt:</span>
              <p className="font-mono text-[10px] text-slate-400 truncate bg-slate-950 p-1 rounded border border-slate-800">
                {studentSecret}
              </p>
            </div>
          </div>

          {/* Public Ledger Commitment */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between text-cyan-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <Unlock className="w-3.5 h-3.5" />
                Public Commitment
              </span>
              <span className="text-[10px] font-mono bg-cyan-500/20 px-1.5 py-0.5 rounded">
                Poseidon(2)
              </span>
            </div>
            <p className="font-mono text-[10px] text-cyan-300/80 break-all bg-slate-900/80 p-2 rounded border border-slate-800">
              {expectedCommitment}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
