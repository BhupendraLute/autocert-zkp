/**
 * AutoCert-ZKP Database & Ledger Types
 * Avishkar 2026-27 (RTMNU) Engineering & Technology Category
 */

export type Institution = {
  id: string;
  name: string;
  code: string;
  public_key: string;
  created_at: string;
};

export type MerkleRoot = {
  id: string;
  institution_id: string;
  root_hash: string;
  batch_id: string;
  signed_by: string;
  created_at: string;
};

export type MerkleRootWithInstitution = MerkleRoot & {
  institution: Institution;
};

export type Revocation = {
  id: string;
  commitment_hash: string;
  reason: string;
  revoked_at: string;
};

/**
 * Result of querying ledger for proof commitment / root validity
 */
export type LedgerVerificationResult = {
  isValidRoot: boolean;
  isRevoked: boolean;
  institution?: Institution | null;
  rootRecord?: MerkleRoot | null;
  revocationRecord?: Revocation | null;
  message: string;
};

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/**
 * Supabase Database definition for type-safe supabase-js client
 */
export type Database = {
  public: {
    Tables: {
      institutions: {
        Row: Institution;
        Insert: {
          id?: string;
          name: string;
          code: string;
          public_key: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          public_key?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      merkle_roots: {
        Row: MerkleRoot;
        Insert: {
          id?: string;
          institution_id: string;
          root_hash: string;
          batch_id: string;
          signed_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          institution_id?: string;
          root_hash?: string;
          batch_id?: string;
          signed_by?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: string;
            columns: string[];
            isOneToOne?: boolean;
            referencedRelation: string;
            referencedColumns: string[];
          }
        ];
      };
      revocations: {
        Row: Revocation;
        Insert: {
          id?: string;
          commitment_hash: string;
          reason: string;
          revoked_at?: string;
        };
        Update: {
          id?: string;
          commitment_hash?: string;
          reason?: string;
          revoked_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
