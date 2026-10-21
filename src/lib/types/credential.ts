import { z } from 'zod';

/**
 * Raw academic transcript extraction schema for AI parser (OpenCode Zen / LLM)
 */
export const RawTranscriptExtractionSchema = z.object({
  studentName: z.string().min(1, 'Student name is required'),
  degree: z.string().min(1, 'Degree is required'),
  branch: z.string().default('General'),
  institution: z.string().min(1, 'Institution is required'),
  enrollmentNumber: z.string().optional().default(''),
  cgpa: z
    .number()
    .min(0, 'CGPA cannot be negative')
    .max(10, 'CGPA cannot exceed 10.00'),
  graduationYear: z
    .number()
    .int()
    .min(1950)
    .max(2100),
  classification: z.enum([
    'First Class with Distinction',
    'First Class',
    'Second Class',
    'Higher Second Class',
    'Pass Class',
  ]),
});

export type RawTranscriptExtraction = z.infer<typeof RawTranscriptExtractionSchema>;

/**
 * Zero-Knowledge cryptographic subject metadata.
 * Holds private signals (actualCgpaScaled, studentSecret) and public commitment.
 */
export const ZkSubjectSchema = z.object({
  actualCgpaScaled: z
    .number()
    .int()
    .min(0)
    .max(1000, 'Scaled CGPA must be <= 1000'),
  studentSecret: z
    .string()
    .regex(/^[0-9]+$/, 'Student secret must be a decimal string representation of BN128 scalar'),
  commitment: z
    .string()
    .regex(/^[0-9]+$/, 'Commitment must be a decimal string representation of Poseidon hash'),
  hashAlgorithm: z.literal('Poseidon(2)'),
});

export type ZkSubject = z.infer<typeof ZkSubjectSchema>;

/**
 * Institutional Issuer representation in W3C JSON-LD format.
 */
export const CredentialIssuerSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  publicKey: z.string().optional(),
});

export type CredentialIssuer = z.infer<typeof CredentialIssuerSchema>;

/**
 * Standard W3C Verifiable Credential schema extended with AutoCert ZK subject.
 */
export const W3CCredentialSchema = z.object({
  '@context': z.array(z.string()),
  id: z.string(),
  type: z.array(z.string()),
  issuer: CredentialIssuerSchema,
  issuanceDate: z.string(),
  credentialSubject: z.object({
    id: z.string(),
    studentName: z.string(),
    enrollmentNumber: z.string().optional(),
    degree: z.string(),
    branch: z.string(),
    institution: z.string(),
    graduationYear: z.number(),
    classification: z.string(),
    cgpa: z.number(),
  }),
  zkSubject: ZkSubjectSchema,
  proof: z
    .object({
      type: z.string(),
      merkleRoot: z.string(),
      batchId: z.string(),
      created: z.string(),
    })
    .optional(),
});

export type W3CCredential = z.infer<typeof W3CCredentialSchema>;

/**
 * Server Action ingestion response payload.
 */
export interface ParseCredentialResult {
  success: boolean;
  credential?: W3CCredential;
  rawExtraction?: RawTranscriptExtraction;
  error?: string;
  source: 'opencode-zen' | 'heuristic-fallback';
  auditNotes?: string[];
}
