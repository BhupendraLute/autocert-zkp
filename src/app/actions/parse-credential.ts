'use server';

import { generateText, Output } from 'ai';
import { getOpenCodeZenModel, extractTranscriptHeuristically } from '@/lib/ai/provider';
import {
  RawTranscriptExtractionSchema,
  RawTranscriptExtraction,
  W3CCredential,
  W3CCredentialSchema,
  ParseCredentialResult,
} from '@/lib/types/credential';
import { createZkSubject } from '@/lib/crypto/poseidon';

interface IssuerAuthority {
  code: string;
  name: string;
  id: string;
  publicKey: string;
}

const ACCREDITED_ISSUERS: Record<string, IssuerAuthority> = {
  RTMNU: {
    code: 'RTMNU',
    name: 'Rashtrasant Tukadoji Maharaj Nagpur University (RTMNU)',
    id: 'did:key:rtmnu_authority_8f43a9b2c1e7d6',
    publicKey: 'ed25519_rtmnu_authority_pk_8f43a9b2c1e7d6',
  },
  SPPU: {
    code: 'SPPU',
    name: 'Savitribai Phule Pune University (SPPU)',
    id: 'did:key:sppu_authority_4a71b8c2d9e0f3',
    publicKey: 'ed25519_sppu_authority_pk_4a71b8c2d9e0f3',
  },
  MU: {
    code: 'MU',
    name: 'University of Mumbai',
    id: 'did:key:mu_authority_7c92a1e4f5b8d2',
    publicKey: 'ed25519_mu_authority_pk_7c92a1e4f5b8d2',
  },
};

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Resolves the matching accredited institutional issuer for the parsed transcript.
 * Rejects transcripts whose awarding institution does not correspond to an authorized issuer.
 */
function resolveIssuerAuthority(institutionName: string): IssuerAuthority {
  const norm = institutionName.toLowerCase().trim();

  // Recognize only full university names or word-bounded acronyms for accredited issuers
  if (/\b(?:rtmnu|rashtrasant\s+tukadoji\s+maharaj(?:\s+nagpur)?\s+university|nagpur\s+university)\b/i.test(institutionName)) {
    return ACCREDITED_ISSUERS.RTMNU;
  }
  if (/\b(?:sppu|savitribai\s+phule\s+pune\s+university|university\s+of\s+pune|pune\s+university)\b/i.test(institutionName)) {
    return ACCREDITED_ISSUERS.SPPU;
  }
  if (/\b(?:mu|university\s+of\s+mumbai|mumbai\s+university)\b/i.test(institutionName)) {
    return ACCREDITED_ISSUERS.MU;
  }

  // Check if a custom issuer is configured via environment variables
  // Requires an exact ISSUER_NAME match or a word-boundary match against an escaped ISSUER_CODE
  const envCode = process.env.ISSUER_CODE?.trim();
  const envName = process.env.ISSUER_NAME?.trim();
  const isNameMatch = envName && norm === envName.toLowerCase();
  const isCodeMatch = envCode && new RegExp(`\\b${escapeRegex(envCode)}\\b`, 'i').test(institutionName);

  if (isNameMatch || isCodeMatch) {
    return {
      code: envCode || 'CUSTOM',
      name: envName || institutionName,
      id: process.env.ISSUER_DID || `did:key:${(envCode || 'custom').toLowerCase()}_authority`,
      publicKey: process.env.ISSUER_PUBLIC_KEY || 'ed25519_authority_pk_custom',
    };
  }

  throw new Error(
    `Issuing authority mismatch: "${institutionName}" is outside this registrar's authorized issuing jurisdiction.`
  );
}

/**
 * Server Action: Ingests unstructured marksheet text using Vercel AI SDK (OpenCode Zen / big-pickle)
 * and outputs a standard W3C JSON-LD Verifiable Credential with client-side Zero-Knowledge extensions.
 */
export async function parseTranscriptAction(
  rawTranscriptText: string
): Promise<ParseCredentialResult> {
  if (!rawTranscriptText || rawTranscriptText.trim().length < 15) {
    return {
      success: false,
      error: 'Transcript text too short or empty. Please provide valid grade sheet text.',
      source: 'heuristic-fallback',
    };
  }

  if (rawTranscriptText.length > 20000) {
    return {
      success: false,
      error: 'Transcript text exceeds the maximum permitted length of 20,000 characters.',
      source: 'heuristic-fallback',
    };
  }

  let rawExtraction: RawTranscriptExtraction;
  let source: 'opencode-zen' | 'heuristic-fallback' = 'opencode-zen';
  const auditNotes: string[] = [];

  try {
    if (!process.env.OPENCODE_ZEN_API_KEY || !process.env.OPENCODE_ZEN_API_KEY.trim()) {
      throw new Error('OPENCODE_ZEN_API_KEY is not configured in environment variables.');
    }

    auditNotes.push('Initiating AI parsing via OpenCode Zen (opencode/big-pickle)...');
    const result = await generateText({
      model: getOpenCodeZenModel(),
      output: Output.object({ schema: RawTranscriptExtractionSchema }),
      abortSignal: AbortSignal.timeout(5000),
      maxRetries: 0,
      system: `You are an expert academic credentials auditor and university registrar for Indian technical universities (such as RTMNU Nagpur).
Your task is to accurately extract academic attributes from messy, tabular, or unformatted transcript/grade sheet text.
Extract the student name, degree title, branch, awarding institution, enrollment/roll number, cumulative CGPA (scale 0-10), graduation year, and degree classification.
Always ensure CGPA is between 0.00 and 10.00.`,
      prompt: `Analyze the following academic transcript text and return structured JSON:\n\n"""\n${rawTranscriptText}\n"""`,
    });

    rawExtraction = result.output;
    auditNotes.push('OpenCode Zen successfully extracted structured academic attributes.');
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    auditNotes.push(`OpenCode Zen AI endpoint unavailable (${errorMsg}). Activating resilient academic heuristic fallback...`);

    // Resilient fallback parser
    try {
      rawExtraction = extractTranscriptHeuristically(rawTranscriptText);
      source = 'heuristic-fallback';
      auditNotes.push('Heuristic parser successfully normalized transcript into valid academic schema.');
    } catch (fallbackErr: unknown) {
      const fallbackMsg = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
      auditNotes.push(`Heuristic transcript parsing failed: ${fallbackMsg}`);
      return {
        success: false,
        error: fallbackMsg,
        source,
        auditNotes,
      };
    }
  }

  // Resolve matching institutional issuer authority
  let issuer: IssuerAuthority;
  try {
    issuer = resolveIssuerAuthority(rawExtraction.institution);
    auditNotes.push(`Matched accredited issuer: ${issuer.code} (${issuer.name})`);
  } catch (issuerErr: unknown) {
    const errorMsg = issuerErr instanceof Error ? issuerErr.message : String(issuerErr);
    return {
      success: false,
      error: errorMsg,
      source,
      auditNotes,
    };
  }

  try {
    auditNotes.push(`Scaling float CGPA ${rawExtraction.cgpa} to integer ${Math.round(rawExtraction.cgpa * 100)} for BN128 arithmetic circuit.`);
    
    // Compute client-side Zero-Knowledge subject (Poseidon hash + blinding secret)
    const zkSubject = await createZkSubject(rawExtraction.cgpa);
    auditNotes.push(`Computed Poseidon(2) commitment: ${zkSubject.commitment}`);

    const credentialId = `urn:uuid:${crypto.randomUUID()}`;
    const studentUrn = `urn:student:${rawExtraction.enrollmentNumber || 'RTMNU-UG'}`;

    // Derive batchId dynamically from graduation year, degree, and branch
    const cleanDegree = rawExtraction.degree.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 6) || 'DEG';
    const cleanBranch = rawExtraction.branch.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 8) || 'GEN';
    const batchId = `BATCH-${rawExtraction.graduationYear}-${cleanDegree}-${cleanBranch}`;

    const rawCredential: W3CCredential = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://autocert.rtmnu.ac.in/contexts/v1',
      ],
      id: credentialId,
      type: ['VerifiableCredential', 'AcademicDegreeCredential'],
      issuer: {
        id: issuer.id,
        name: issuer.name,
        code: issuer.code,
        publicKey: issuer.publicKey,
      },
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: studentUrn,
        studentName: rawExtraction.studentName,
        enrollmentNumber: rawExtraction.enrollmentNumber,
        degree: rawExtraction.degree,
        branch: rawExtraction.branch,
        institution: rawExtraction.institution,
        graduationYear: rawExtraction.graduationYear,
        classification: rawExtraction.classification,
        cgpa: rawExtraction.cgpa,
      },
      zkSubject,
      proof: {
        type: 'PoseidonMerkleProof2026',
        merkleRoot: 'PENDING_LEDGER_ANCHOR',
        batchId,
        created: new Date().toISOString(),
      },
    };

    // Validate complete credential against W3C Zod schema
    const validatedCredential = W3CCredentialSchema.parse(rawCredential);

    return {
      success: true,
      credential: validatedCredential,
      rawExtraction,
      source,
      auditNotes,
    };
  } catch (cryptoErr: unknown) {
    const errorMsg = cryptoErr instanceof Error ? cryptoErr.message : String(cryptoErr);
    return {
      success: false,
      error: `Cryptographic credential assembly failed: ${errorMsg}`,
      source,
      auditNotes,
    };
  }
}
