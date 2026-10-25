'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Cpu,
  FileText,
  KeyRound,
  Download,
  Copy,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { parseTranscriptAction } from '../actions/parse-credential';
import { W3CCredential, ParseCredentialResult } from '@/lib/types/credential';

// Preset real-world sample transcripts for Avishkar 2026-27 live demonstration
const PRESET_TRANSCRIPTS = [
  {
    label: 'RTMNU B.Tech CSE (8.45 CGPA - Distinction)',
    text: `RASHTRASANT TUKADOJI MAHARAJ NAGPUR UNIVERSITY
PROVISIONAL GRADE CARD / TRANSCRIPT CUM DEGREE STATEMENT
================================================================================
Candidate Name     : RAJESH S. RAUT
Father's Name      : SURESH RAUT
Enrollment Number  : RTMNU/2022/EN/78291
Roll Number        : 849201
Institute          : DEPARTMENT OF COMPUTER TECHNOLOGY, RTMNU MAIN CAMPUS
Branch / Program   : COMPUTER SCIENCE & ENGINEERING
Degree             : BACHELOR OF TECHNOLOGY (B.TECH)
Examination        : EIGHTH SEMESTER (FINAL) - SUMMER 2026

--------------------------------------------------------------------------------
Course Code | Course Title                            | Credits | Grade | Points
--------------------------------------------------------------------------------
CS-801      | Distributed Systems & Cryptography       | 4       | A+    | 36
CS-802      | High Performance Cloud Computing         | 4       | A     | 32
CS-803      | Zero-Knowledge Proofs & Privacy          | 4       | O     | 40
CS-804      | Capstone Major Project (Stage II)        | 8       | O     | 80
--------------------------------------------------------------------------------

Semester 8 SGPA : 9.25
Cumulative Grade Point Average (C.G.P.A.) : 8.45 / 10.00
Result Classification                     : FIRST CLASS WITH DISTINCTION
Date of Issue                             : 15-JUNE-2026`,
  },
  {
    label: 'RTMNU B.E. Electronics (7.60 CGPA - First Class)',
    text: `RASHTRASANT TUKADOJI MAHARAJ NAGPUR UNIVERSITY
ACADEMIC TRANSCRIPT RECORD
================================================================================
Candidate Name     : SNEHAL M. DESHMUKH
Enrollment Number  : RTMNU/2022/EN/65104
Institute          : SHRI RAMDEOBABA COLLEGE OF ENGINEERING & MANAGEMENT
Branch / Program   : ELECTRONICS & TELECOMMUNICATION ENGINEERING
Degree             : BACHELOR OF ENGINEERING (B.E.)
Passing Session    : SUMMER 2026

Cumulative Grade Point Average (CGPA) : 7.60 / 10.00
Classification : FIRST CLASS
Issued by Registrar Office, RTMNU Nagpur`,
  },
  {
    label: 'RTMNU M.Tech Data Science (9.15 CGPA - Honours)',
    text: `RASHTRASANT TUKADOJI MAHARAJ NAGPUR UNIVERSITY
POST-GRADUATE DEGREE TRANSCRIPT
================================================================================
Student Name       : TANMAY K. AGRAWAL
Enrollment No      : RTMNU/2024/PG/3109
Awarded Degree     : MASTER OF TECHNOLOGY (M.TECH)
Specialization     : ARTIFICIAL INTELLIGENCE & DATA SCIENCE
Institute          : GOVT COLLEGE OF ENGINEERING, NAGPUR
Graduation Year    : 2026

Final Grade (CGPA) : 9.15 / 10.00
Division           : FIRST CLASS WITH DISTINCTION`,
  },
];

export default function IssueCredentialPage() {
  const [transcriptText, setTranscriptText] = useState(PRESET_TRANSCRIPTS[0].text);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ParseCredentialResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'audit' | 'json'>('audit');

  const handleParse = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await parseTranscriptAction(transcriptText);
      if (response.success && response.credential) {
        setResult(response);
        // Save to localStorage for instant loading in student vault (Phase 5)
        if (typeof window !== 'undefined') {
          localStorage.setItem('autocert_issued_credential', JSON.stringify(response.credential));
        }
      } else {
        setError(response.error || 'Failed to parse academic transcript');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred during parsing');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadJson = (credential: W3CCredential) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(credential, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `autocert_credential_${credential.credentialSubject.studentName.replace(/\s+/g, '_')}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header Title */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-indigo-400 bg-indigo-950/60 border border-indigo-800/40 px-3 py-1 rounded-full mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Driven Academic Ingestion &amp; Cryptographic Commitment Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Institutional Credential Issuance
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Ingest unstructured transcript records into standardized W3C JSON-LD Verifiable Credentials.
            Evaluates client-side zero-knowledge Poseidon sponge commitments with discrete scalar integer scaling.
          </p>
        </div>

        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Input & Presets (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Presets card */}
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-3">
                Quick-Load Preset RTMNU Records:
              </label>
              <div className="space-y-2">
                {PRESET_TRANSCRIPTS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTranscriptText(preset.text);
                      setResult(null);
                      setError(null);
                    }}
                    className={`w-full text-left text-xs font-medium px-3.5 py-2.5 rounded-xl border transition-all ${
                      transcriptText === preset.text
                        ? 'bg-indigo-600/15 border-indigo-500/40 text-indigo-200'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Transcript Input Card */}
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  Raw Academic Marksheet Text:
                </label>
                <button
                  type="button"
                  onClick={() => setTranscriptText('')}
                  className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear
                </button>
              </div>

              <textarea
                value={transcriptText}
                onChange={(e) => setTranscriptText(e.target.value)}
                rows={12}
                placeholder="Paste raw university marksheet text or provisional grade card here..."
                className="w-full bg-slate-950/90 border border-slate-800/90 rounded-xl p-3.5 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 transition-all resize-y leading-relaxed"
              />

              <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                <span>{transcriptText.length} characters</span>
                <span className="text-indigo-400 font-medium">Model: OpenCode Zen / big-pickle</span>
              </div>

              <button
                type="button"
                onClick={handleParse}
                disabled={isLoading || transcriptText.trim().length < 15}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm py-3 px-4 rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
              >
                {isLoading ? (
                  <>
                    <Cpu className="w-4 h-4 animate-spin text-indigo-200" />
                    <span>Auditing &amp; Compiling Commitments...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Audit &amp; Issue W3C Credential</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Output & Cryptographic Telemetry (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {error && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-rose-300">Issuance Error</h4>
                  <p className="text-xs text-rose-200/80 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {!result && !isLoading && !error && (
              <div className="border border-dashed border-slate-800 rounded-2xl p-12 text-center bg-slate-900/20">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-slate-300">Awaiting Ingestion Input</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                  Select a preset RTMNU transcript or paste custom grade text on the left, then click{' '}
                  <span className="text-slate-300">&ldquo;Audit &amp; Issue W3C Credential&rdquo;</span> to generate the cryptographic Poseidon commitment.
                </p>
              </div>
            )}

            {isLoading && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-full border-2 border-indigo-500/30 border-t-indigo-400 animate-spin mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-white">Cryptographic Ingestion in Progress</h3>
                  <p className="text-xs text-slate-400">
                    Executing structured Zod validation, scalar secret generation, and Poseidon sponge hashing...
                  </p>
                </div>
              </div>
            )}

            {result && result.credential && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
                {/* Header status bar */}
                <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h3 className="text-sm font-bold text-white">Credential Validated &amp; Issued</h3>
                      <p className="text-[11px] text-slate-400">
                        Source Engine:{' '}
                        <span className="font-semibold text-indigo-300">
                          {result.source === 'opencode-zen' ? 'OpenCode Zen (opencode/big-pickle)' : 'Resilient Heuristic Parser'}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('audit')}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                        activeTab === 'audit'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      Audit View
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('json')}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                        activeTab === 'json'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      W3C JSON-LD
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadJson(result.credential!)}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-colors flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export .json
                    </button>
                  </div>
                </div>

                {/* Audit Tab */}
                {activeTab === 'audit' && (
                  <div className="p-6 space-y-6">
                    {/* Academic Attributes Grid */}
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                        Extracted Academic Identity
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
                          <span className="text-[10px] uppercase font-semibold text-slate-500 block">Student Name</span>
                          <span className="text-xs font-bold text-slate-200 truncate block mt-0.5">
                            {result.credential.credentialSubject.studentName}
                          </span>
                        </div>
                        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
                          <span className="text-[10px] uppercase font-semibold text-slate-500 block">Degree &amp; Branch</span>
                          <span className="text-xs font-bold text-slate-200 truncate block mt-0.5">
                            {result.credential.credentialSubject.degree}
                          </span>
                        </div>
                        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
                          <span className="text-[10px] uppercase font-semibold text-slate-500 block">Enrollment No</span>
                          <span className="text-xs font-mono font-medium text-slate-300 truncate block mt-0.5">
                            {result.credential.credentialSubject.enrollmentNumber || 'N/A'}
                          </span>
                        </div>
                        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
                          <span className="text-[10px] uppercase font-semibold text-slate-500 block">Awarding University</span>
                          <span className="text-xs font-medium text-slate-300 truncate block mt-0.5">
                            {result.credential.credentialSubject.institution}
                          </span>
                        </div>
                        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
                          <span className="text-[10px] uppercase font-semibold text-slate-500 block">Graduation Year</span>
                          <span className="text-xs font-bold text-slate-200 block mt-0.5">
                            {result.credential.credentialSubject.graduationYear}
                          </span>
                        </div>
                        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
                          <span className="text-[10px] uppercase font-semibold text-slate-500 block">Classification</span>
                          <span className="text-xs font-semibold text-indigo-300 truncate block mt-0.5">
                            {result.credential.credentialSubject.classification}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Cryptographic Witness Panel */}
                    <div className="bg-gradient-to-br from-indigo-950/30 via-slate-950 to-slate-900 border border-indigo-500/20 rounded-xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <KeyRound className="w-4 h-4 text-indigo-400" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                            Zero-Knowledge Cryptographic Subject (Fr BN128)
                          </h4>
                        </div>
                        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          Circuit Compatible
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3">
                          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                            <span>Scaled Integer CGPA (actualCgpaScaled)</span>
                            <span className="text-[10px] text-indigo-400 font-mono">100x Field Int</span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-extrabold text-white font-mono">
                              {result.credential.zkSubject.actualCgpaScaled}
                            </span>
                            <span className="text-xs text-slate-500">
                              (Original: {result.credential.credentialSubject.cgpa.toFixed(2)})
                            </span>
                          </div>
                        </div>

                        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3">
                          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                            <span>Hash Scheme &amp; Constraints</span>
                            <span className="text-[10px] text-emerald-400 font-mono">Poseidon(2)</span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-extrabold text-white font-mono">142</span>
                            <span className="text-xs text-slate-500">R1CS Constraints</span>
                          </div>
                        </div>
                      </div>

                      {/* Blinding Secret */}
                      <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span className="flex items-center gap-1.5">
                            <span>Private Blinding Secret (studentSecret)</span>
                            <span className="text-[9px] uppercase font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded">
                              Private Witness
                            </span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(result.credential!.zkSubject.studentSecret, 'secret')}
                            className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                          >
                            {copiedKey === 'secret' ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            {copiedKey === 'secret' ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <p className="font-mono text-xs text-slate-300 truncate selection:bg-indigo-500/30">
                          {result.credential.zkSubject.studentSecret}
                        </p>
                      </div>

                      {/* Poseidon Commitment */}
                      <div className="bg-slate-950/80 border border-indigo-500/30 rounded-lg p-3">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span className="flex items-center gap-1.5">
                            <span className="text-indigo-200 font-semibold">Poseidon Commitment (expectedCommitment)</span>
                            <span className="text-[9px] uppercase font-bold text-indigo-400 bg-indigo-400/10 px-1.5 py-0.2 rounded">
                              Public Signal
                            </span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(result.credential!.zkSubject.commitment, 'commitment')}
                            className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                          >
                            {copiedKey === 'commitment' ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            {copiedKey === 'commitment' ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <p className="font-mono text-xs text-emerald-300 font-semibold break-all leading-relaxed">
                          {result.credential.zkSubject.commitment}
                        </p>
                      </div>
                    </div>

                    {/* Next Step Bridge to Phase 5 */}
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h5 className="text-xs font-semibold text-white">Next Step: Student Client Prover (Phase 5)</h5>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Credential saved to local browser cache. Student can generate a 384B Groth16 proof in under 1.2s.
                        </p>
                      </div>
                      <Link
                        href="/student"
                        className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-3.5 py-2 rounded-lg transition-colors shrink-0"
                      >
                        <span>Open Student Vault</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                )}

                {/* JSON-LD Tab */}
                {activeTab === 'json' && (
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-slate-400">W3C Verifiable Credential v2.0 (JSON-LD)</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(JSON.stringify(result.credential, null, 2), 'json')}
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                      >
                        {copiedKey === 'json' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedKey === 'json' ? 'Copied JSON' : 'Copy JSON'}
                      </button>
                    </div>
                    <pre className="bg-slate-950 p-4 rounded-xl text-[11px] font-mono text-slate-300 overflow-x-auto max-h-96 border border-slate-800 leading-relaxed">
                      {JSON.stringify(result.credential, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
