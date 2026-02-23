import { StationStats, LineConfig } from "@/types/manufacturing";

// Hardcoded line configuration
export const lineConfig: LineConfig = {
  id: "line-01",
  name: "Main Production Line",
  stationOrder: ["OP10", "OP20A", "OP20B", "OP30", "OP40"],
};

// Helper to generate trace data
const generateTrace = (mean: number, stdDev: number, count: number): { timestamp: string; value: number }[] => {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => ({
    timestamp: new Date(now - (count - i) * 60000).toISOString(),
    value: mean + (Math.random() - 0.5) * stdDev * 4,
  }));
};

export const mockStationStats: Record<string, StationStats> = {
  "OP10": {
    stationId: "OP10",
    status: "Stable",
    parameters: {
      "Hydraulic Pressure": {
        mean: 2150, median: 2148, stdDev: 45, robustSigma: 40,
        controlLimits: [2050, 2250], specLimits: [2000, 2400],
        minVal: 2010, maxVal: 2310, count: 1240, outlierCount: 3,
        status: "Stable", anomalyWindows: [],
        trace: generateTrace(2150, 45, 50),
        cpk: 1.85, driftSlope: 0.2, ttlHours: 480,
      },
      "Oil Temperature": {
        mean: 182, median: 181, stdDev: 6.5, robustSigma: 5.8,
        controlLimits: [165, 195], specLimits: [160, 200],
        minVal: 162, maxVal: 198, count: 1240, outlierCount: 8,
        status: "Warning", 
        anomalyWindows: [{
          startTime: new Date(Date.now() - 3600000).toISOString(),
          endTime: new Date(Date.now() - 1800000).toISOString(),
          type: "DRIFT", severity: "MEDIUM",
          details: "Gradual temperature increase detected",
          durationMinutes: 30,
        }],
        trace: generateTrace(182, 6.5, 50),
        cpk: 0.92, driftSlope: 1.5, ttlHours: 12,
      },
    },
    correlationResults: [],
  },
  "OP20A": {
    stationId: "OP20A",
    status: "Stable",
    parameters: {
      "Welding Current": {
        mean: 185, median: 186, stdDev: 7.2, robustSigma: 6.5,
        controlLimits: [175, 205], specLimits: [170, 210],
        minVal: 172, maxVal: 208, count: 590, outlierCount: 2,
        status: "Stable", anomalyWindows: [],
        trace: generateTrace(185, 7.2, 50),
        cpk: 1.45,
      },
      "Wire Feed Rate": {
        mean: 320, median: 318, stdDev: 12, robustSigma: 10,
        controlLimits: [290, 350], specLimits: [280, 360],
        minVal: 285, maxVal: 355, count: 590, outlierCount: 1,
        status: "Stable", anomalyWindows: [],
        trace: generateTrace(320, 12, 50),
        cpk: 1.67,
      },
    },
    correlationResults: [
      { charA: "Welding Current", charB: "Wire Feed Rate", pearsonR: 0.72, strength: "STRONG", bothFailTogether: false },
    ],
  },
  "OP20B": {
    stationId: "OP20B",
    status: "Stable",
    parameters: {
      "Welding Current": {
        mean: 192, median: 191, stdDev: 6.8, robustSigma: 6.2,
        controlLimits: [175, 205], specLimits: [170, 210],
        minVal: 174, maxVal: 207, count: 590, outlierCount: 1,
        status: "Stable", anomalyWindows: [],
        trace: generateTrace(192, 6.8, 50),
        cpk: 1.52,
      },
      "Wire Feed Rate": {
        mean: 318, median: 317, stdDev: 11, robustSigma: 9.8,
        controlLimits: [290, 350], specLimits: [280, 360],
        minVal: 288, maxVal: 348, count: 590, outlierCount: 0,
        status: "Stable", anomalyWindows: [],
        trace: generateTrace(318, 11, 50),
        cpk: 1.72,
      },
    },
    correlationResults: [],
  },
  "OP30": {
    stationId: "OP30",
    status: "Warning",
    parameters: {
      "Line Speed": {
        mean: 12.5, median: 12.3, stdDev: 1.8, robustSigma: 1.5,
        controlLimits: [11, 17], specLimits: [10, 18],
        minVal: 10.2, maxVal: 16.8, count: 1150, outlierCount: 12,
        status: "Warning",
        anomalyWindows: [{
          startTime: new Date(Date.now() - 7200000).toISOString(),
          endTime: new Date(Date.now() - 5400000).toISOString(),
          type: "SPIKE", severity: "HIGH",
          details: "Sudden line speed drop detected",
          durationMinutes: 30,
        }],
        trace: generateTrace(12.5, 1.8, 50),
        cpk: 0.78, driftSlope: -0.3, ttlHours: 8,
      },
      "Torque": {
        mean: 45.2, median: 45.0, stdDev: 3.1, robustSigma: 2.8,
        controlLimits: [38, 52], specLimits: [35, 55],
        minVal: 36.1, maxVal: 53.5, count: 1150, outlierCount: 5,
        status: "Stable", anomalyWindows: [],
        trace: generateTrace(45.2, 3.1, 50),
        cpk: 1.05,
      },
    },
    correlationResults: [],
  },
  "OP40": {
    stationId: "OP40",
    status: "Stable",
    parameters: {
      "Measurement Accuracy": {
        mean: 2.1, median: 2.05, stdDev: 0.45, robustSigma: 0.38,
        controlLimits: [1.0, 4.0], specLimits: [0.5, 5.0],
        minVal: 0.8, maxVal: 4.2, count: 1140, outlierCount: 2,
        status: "Stable", anomalyWindows: [],
        trace: generateTrace(2.1, 0.45, 50),
        cpk: 2.15,
      },
    },
    correlationResults: [],
  },
};

// Helper: station display names
export const stationDisplayNames: Record<string, string> = {
  "OP10": "Press 01",
  "OP20A": "Weld Station 01",
  "OP20B": "Weld Station 02",
  "OP30": "Assembly Line",
  "OP40": "Quality Check",
};

// Helper: which stations are parallel
export const parallelGroups: Record<string, string[]> = {
  "weld-group": ["OP20A", "OP20B"],
};

// Helper to get station status color
export const getStatusColor = (status: string): string => {
  const s = status.toLowerCase();
  if (s === "stable") return "status-excellent";
  if (s === "warning") return "status-warning";
  if (s === "critical") return "status-critical";
  if (s === "offline") return "status-offline";
  return "status-good";
};

// Calculate overall metrics from station stats
export const calculateOverallMetrics = (stations: StationStats[]) => {
  const totalParams = stations.reduce((sum, s) => sum + Object.keys(s.parameters).length, 0);
  const totalAnomalies = stations.reduce(
    (sum, s) => sum + Object.values(s.parameters).reduce((a, p) => a + p.anomalyWindows.length, 0), 0
  );
  const totalOutliers = stations.reduce(
    (sum, s) => sum + Object.values(s.parameters).reduce((a, p) => a + p.outlierCount, 0), 0
  );
  const avgCpk = stations.reduce((sum, s) => {
    const cpks = Object.values(s.parameters).filter(p => p.cpk != null).map(p => p.cpk!);
    return sum + (cpks.length > 0 ? cpks.reduce((a, b) => a + b, 0) / cpks.length : 0);
  }, 0) / stations.length;
  const warningStations = stations.filter(s => s.status.toLowerCase() !== "stable").length;

  return { totalParams, totalAnomalies, totalOutliers, avgCpk, warningStations };
};
