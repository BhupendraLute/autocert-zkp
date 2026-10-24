'use client';

import React from 'react';
import { PRESET_PROOFS, PresetProofItem } from '@/lib/data/mock-proofs';
import { CheckCircle2, ShieldAlert, XCircle, AlertTriangle, Sparkles } from 'lucide-react';
import clsx from 'clsx';

interface PresetProofSelectorProps {
  selectedPresetId: string | null;
  onSelectPreset: (preset: PresetProofItem) => void;
  isVerifying: boolean;
}

export function PresetProofSelector({
  selectedPresetId,
  onSelectPreset,
  isVerifying,
}: PresetProofSelectorProps) {
  const getBadge = (category: PresetProofItem['category']) => {
    switch (category) {
      case 'valid':
        return {
          icon: CheckCircle2,
          text: 'PASS (Valid Proof)',
          classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        };
      case 'tampered':
        return {
          icon: ShieldAlert,
          text: 'REJECT (Signal Tampered)',
          classes: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        };
      case 'corrupted':
        return {
          icon: XCircle,
          text: 'REJECT (Corrupted πA)',
          classes: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        };
      case 'revoked':
        return {
          icon: AlertTriangle,
          text: 'REVOKED (Ledger Flag)',
          classes: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        };
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Avishkar Live Demonstration Presets</span>
        </label>
        <span className="text-[11px] text-slate-500 font-mono">1-Click Evaluation</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {PRESET_PROOFS.map((preset) => {
          const isSelected = selectedPresetId === preset.id;
          const badge = getBadge(preset.category);
          const Icon = badge.icon;

          return (
            <button
              key={preset.id}
              type="button"
              disabled={isVerifying}
              onClick={() => onSelectPreset(preset)}
              className={clsx(
                'text-left p-3 rounded-xl border transition flex flex-col justify-between gap-2.5',
                isSelected
                  ? 'bg-slate-800/90 border-cyan-500/50 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/30'
                  : 'bg-slate-900/60 hover:bg-slate-800/60 border-slate-800 text-slate-300 hover:border-slate-700'
              )}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-white truncate">{preset.name}</span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] font-mono">
                <span className="text-slate-400">
                  Threshold: <strong className="text-slate-200">{preset.threshold.toFixed(2)}</strong>
                </span>
                <span
                  className={clsx(
                    'inline-flex items-center gap-1 px-1.5 py-0.5 rounded border font-semibold',
                    badge.classes
                  )}
                >
                  <Icon className="w-3 h-3" />
                  <span>{badge.text.split(' ')[0]}</span>
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
