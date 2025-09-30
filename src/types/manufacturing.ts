export interface Equipment {
  id: string;
  name: string;
  stationType: string; // e.g., "weld", "press", "assembly"
  x: number;
  y: number;
  status: 'excellent' | 'good' | 'warning' | 'critical' | 'offline';
  kpis: {
    fpy: number; // First Pass Yield (0-100%)
    totalUnits: number;
    avgCycleTime: number; // in seconds
    anomalyScore: number; // 0-100
  };
  parameters: ProcessParameter[];
  isParallel?: boolean; // true if this equipment is part of a parallel group
  parallelGroupId?: string; // shared ID for parallel equipment
}

export interface ProcessParameter {
  id: string;
  name: string;
  unit: string;
  currentValue: number;
  targetValue: number;
  upperLimit: number;
  lowerLimit: number;
  upperControlLimit: number;
  lowerControlLimit: number;
  trend: 'stable' | 'increasing' | 'decreasing' | 'volatile';
  status: 'normal' | 'warning' | 'out_of_control';
}

export interface SPCDataPoint {
  timestamp: Date;
  value: number;
  isOutOfControl?: boolean;
  violationType?: 'mean' | 'range' | 'trend' | 'pattern';
}

export interface SPCChart {
  parameterId: string;
  equipmentId: string;
  dataPoints: SPCDataPoint[];
  controlLimits: {
    upperControl: number;
    lowerControl: number;
    upperSpec: number;
    lowerSpec: number;
    target: number;
  };
  statistics: {
    mean: number;
    standardDeviation: number;
    cpk: number; // Process capability index
    cp: number; // Process capability
  };
}

export interface FlowLink {
  id: string;
  sourceId: string;
  targetId: string;
  throughputCount: number;
  avgTransitionTime: number; // in seconds
  status: 'high' | 'medium' | 'low' | 'inactive';
  isParallelFlow?: boolean; // true if connecting parallel equipment
}

export interface ParallelEquipmentGroup {
  id: string;
  stationType: string;
  name: string;
  equipment: Equipment[];
  combinedKpis: {
    totalFpy: number;
    totalUnits: number;
    avgCycleTime: number;
    maxAnomalyScore: number;
  };
}

export interface TimeRange {
  type: 'realtime' | 'predefined' | 'custom';
  duration?: '1h' | '4h' | '24h';
  startTime?: Date;
  endTime?: Date;
}

export interface ProductFilter {
  machineId?: string;
  timeSlot?: {
    start: Date;
    end: Date;
  };
}