// TypeScript interfaces mirroring Python backend dataclasses

export interface Product {
  id: string; // serial number
  recordIds: string[];
  program: string;
}

export interface Record {
  id: string;
  timestamp: string; // ISO timestamp
  value: number;
  name: string;
  stationId: string;
  productId: string;
  program: string;
  upperValue: number | null;
  lowerValue: number | null;
}

export interface AnomalyWindow {
  startTime: string; // ISO timestamp
  endTime: string;
  type: 'SPIKE' | 'DRIFT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  details: string;
  durationMinutes: number;
}

export interface TracePoint {
  timestamp: string;
  value: number;
}

export interface ParameterStats {
  mean: number;
  median: number;
  stdDev: number;
  robustSigma: number;
  controlLimits: [number, number]; // [LCL, UCL]
  specLimits: [number | null, number | null]; // [LSL, USL]
  minVal: number;
  maxVal: number;
  count: number;
  outlierCount: number;
  status: string; // e.g. "Stable", "Warning", "Critical"
  anomalyWindows: AnomalyWindow[];
  trace: TracePoint[];
  cpk?: number;
  driftSlope?: number; // units per hour
  ttlHours?: number; // hours to nearest spec limit breach
}

export interface CorrelationResult {
  charA: string;
  charB: string;
  pearsonR: number;
  strength: 'STRONG' | 'MODERATE' | 'WEAK';
  bothFailTogether: boolean;
}

export interface ClassifierModeResult {
  auc: number;
  featureImportances: { [param: string]: number };
}

export interface QualityPeriod {
  startTime: string;
  endTime: string;
  label: 'good_period' | 'bad_period';
  meanFpy: number;
}

export interface ClassifierResult {
  stationId: string;
  breakpointTimestamps: string[];
  periods: QualityPeriod[];
  modeA?: ClassifierModeResult;
  modeB?: ClassifierModeResult;
}

export interface ProductPassFailResult {
  stationId: string;
  nPass: number;
  nFail: number;
  modeA?: ClassifierModeResult;
  modeB?: ClassifierModeResult;
}

export interface ParameterCausalEffect {
  parameter: string;
  ate: number;
  ateCiLower: number;
  ateCiUpper: number;
  pValue: number | null;
  method: 'dml_linear' | 'ols_backdoor';
  unitInterpretation: string;
}

export interface CausalInferenceResult {
  stationId: string;
  outcome: string;
  parameterEffects: ParameterCausalEffect[];
  dagEdges: [string, string][];
  adjustmentSets: { [param: string]: string[] };
  counterfactualFpy: { [param: string]: number };
}

export interface StationStats {
  stationId: string;
  parameters: { [paramName: string]: ParameterStats };
  status: string; // "Active", "Stable", "Warning", etc.
  correlationResults: CorrelationResult[];
  classifierResult?: ClassifierResult;
  causalResult?: CausalInferenceResult;
  passFailResult?: ProductPassFailResult;
}

// Frontend-only: line configuration (hardcoded station order)
export interface LineConfig {
  id: string;
  name: string;
  stationOrder: string[]; // ordered station IDs
}

export interface TimeRange {
  type: 'realtime' | 'predefined' | 'custom';
  duration?: '1h' | '4h' | '24h';
  startTime?: Date;
  endTime?: Date;
}

export interface ProductFilter {
  program?: string;
  timeSlot?: {
    start: Date;
    end: Date;
  };
}
