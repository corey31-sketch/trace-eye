export interface Equipment {
  id: string;
  name: string;
  x: number;
  y: number;
  status: 'excellent' | 'good' | 'warning' | 'critical' | 'offline';
  kpis: {
    fpy: number; // First Pass Yield (0-100%)
    totalUnits: number;
    avgCycleTime: number; // in seconds
    anomalyScore: number; // 0-100
  };
}

export interface FlowLink {
  id: string;
  sourceId: string;
  targetId: string;
  throughputCount: number;
  avgTransitionTime: number; // in seconds
  status: 'high' | 'medium' | 'low' | 'inactive';
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

export interface SPCData {
  timestamp: Date;
  value: number;
  parameter: string;
  upperLimit?: number;
  lowerLimit?: number;
  target?: number;
}