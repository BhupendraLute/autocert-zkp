/**
 * AutoCert-ZKP: Benchmarking & Avishkar Deliverables Type Definitions
 * Avishkar 2026-27 Research Convention (RTMNU, Engineering & Technology UG)
 */

export interface StatisticalMetric {
  mean: number;
  stdDev: number;
  median: number;
  p95: number;
  min: number;
  max: number;
  iterations: number;
}

export interface MemoryMetric {
  initialHeapMb: number;
  peakHeapMb: number;
  deltaHeapMb: number;
  peakRssMb: number;
}

export interface PayloadMetric {
  rawProofJsonBytes: number;
  base64TokenBytes: number;
  publicSignalsBytes: number;
  traditionalPdfBytes: number;
  bandwidthReductionPercent: number;
}

export interface BenchmarkRunReport {
  timestamp: number;
  environment: {
    nodeVersion: string;
    os: string;
    arch: string;
    cpuModel: string;
    cpuCores: number;
    totalMemoryGb: number;
  };
  provingMetrics: StatisticalMetric;
  verificationMetrics: StatisticalMetric;
  memoryMetrics: MemoryMetric;
  payloadMetrics: PayloadMetric;
  deviceProfiles: HardwareProfile[];
}

export interface HardwareProfile {
  id: string;
  name: string;
  chipset: string;
  ram: string;
  os: string;
  provingTimeMs: number;
  verificationTimeMs: number;
  peakRamMb: number;
  payloadBytes: number;
  piiExposurePercent: number;
  cloudCostInr: number;
  category: 'low-end-mobile' | 'mid-tier-mobile' | 'desktop' | 'traditional-centralized';
  notes: string;
}

export type LiveBenchmarkStage =
  | 'idle'
  | 'initializing'
  | 'computing-witness'
  | 'generating-proof'
  | 'verifying-pairings'
  | 'completed'
  | 'failed';

export interface LiveBenchmarkProgress {
  stage: LiveBenchmarkStage;
  message: string;
  progressPercent: number;
}

export interface LiveBenchmarkResult {
  deviceInfo: {
    userAgent: string;
    platform: string;
    logicalCores: number;
    deviceMemoryGb?: number;
  };
  proofGenerationMs: number;
  verificationMs: number;
  totalCycleMs: number;
  payloadSizeBytes: number;
  base64Payload: string;
  isPairingValid: boolean;
  thresholdProven: number;
  commitmentHash: string;
  timestamp: number;
}
