/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'circomlibjs' {
  export function buildPoseidon(): Promise<any>;
  export function buildEddsa(): Promise<any>;
  export function buildBabyjub(): Promise<any>;
}
