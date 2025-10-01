import { Equipment, FlowLink, ParallelEquipmentGroup } from "@/types/manufacturing";

// Mock data for demonstration - In FastHTML this would come from server/database
export const mockEquipment: Equipment[] = [
  {
    id: "press-01",
    name: "Press 01",
    stationType: "press",
    x: 100,
    y: 200,
    status: "excellent",
    kpis: {
      fpy: 98.5,
      totalUnits: 1240,
      avgCycleTime: 45.2,
      anomalyScore: 12
    },
    parameters: [
      {
        id: "pressure",
        name: "Hydraulic Pressure",
        unit: "PSI",
        currentValue: 2150,
        targetValue: 2200,
        upperLimit: 2400,
        lowerLimit: 2000,
        upperControlLimit: 2350,
        lowerControlLimit: 2050,
        trend: "stable",
        status: "normal"
      },
      {
        id: "temperature",
        name: "Oil Temperature",
        unit: "°F",
        currentValue: 185,
        targetValue: 180,
        upperLimit: 200,
        lowerLimit: 160,
        upperControlLimit: 195,
        lowerControlLimit: 165,
        trend: "increasing",
        status: "warning"
      }
    ]
  },
  {
    id: "weld-station-01",
    name: "Weld Station 01",
    stationType: "weld",
    x: 400,
    y: 180,
    status: "good",
    isParallel: true,
    parallelGroupId: "weld-group-01",
    kpis: {
      fpy: 96.8,
      totalUnits: 590,
      avgCycleTime: 62.8,
      anomalyScore: 28
    },
    parameters: [
      {
        id: "current",
        name: "Welding Current",
        unit: "A",
        currentValue: 185,
        targetValue: 190,
        upperLimit: 210,
        lowerLimit: 170,
        upperControlLimit: 205,
        lowerControlLimit: 175,
        trend: "stable",
        status: "normal"
      }
    ]
  },
  {
    id: "weld-station-02",
    name: "Weld Station 02",
    stationType: "weld",
    x: 400,
    y: 220,
    status: "excellent",
    isParallel: true,
    parallelGroupId: "weld-group-01",
    kpis: {
      fpy: 97.2,
      totalUnits: 590,
      avgCycleTime: 60.1,
      anomalyScore: 15
    },
    parameters: [
      {
        id: "current",
        name: "Welding Current",
        unit: "A",
        currentValue: 192,
        targetValue: 190,
        upperLimit: 210,
        lowerLimit: 170,
        upperControlLimit: 205,
        lowerControlLimit: 175,
        trend: "stable",
        status: "normal"
      }
    ]
  },
  {
    id: "assembly-line",
    name: "Assembly Line",
    stationType: "assembly",
    x: 700,
    y: 200,
    status: "warning",
    kpis: {
      fpy: 94.2,
      totalUnits: 1150,
      avgCycleTime: 78.5,
      anomalyScore: 45
    },
    parameters: [
      {
        id: "speed",
        name: "Line Speed",
        unit: "ft/min",
        currentValue: 12.5,
        targetValue: 15.0,
        upperLimit: 18.0,
        lowerLimit: 10.0,
        upperControlLimit: 17.0,
        lowerControlLimit: 11.0,
        trend: "decreasing",
        status: "warning"
      }
    ]
  },
  {
    id: "quality-check",
    name: "Quality Check",
    stationType: "inspection",
    x: 1000,
    y: 200,
    status: "excellent",
    kpis: {
      fpy: 99.1,
      totalUnits: 1140,
      avgCycleTime: 35.0,
      anomalyScore: 8
    },
    parameters: [
      {
        id: "accuracy",
        name: "Measurement Accuracy",
        unit: "μm",
        currentValue: 2.1,
        targetValue: 2.0,
        upperLimit: 5.0,
        lowerLimit: 0.5,
        upperControlLimit: 4.0,
        lowerControlLimit: 1.0,
        trend: "stable",
        status: "normal"
      }
    ]
  }
];

export const mockFlowLinks: FlowLink[] = [
  {
    id: "flow-1",
    sourceId: "press-01",
    targetId: "weld-group-01",
    throughputCount: 85,
    avgTransitionTime: 120,
    status: "high",
    isParallelFlow: true
  },
  {
    id: "flow-2",
    sourceId: "weld-group-01",
    targetId: "assembly-line",
    throughputCount: 78,
    avgTransitionTime: 180,
    status: "medium"
  },
  {
    id: "flow-3",
    sourceId: "assembly-line",
    targetId: "quality-check",
    throughputCount: 72,
    avgTransitionTime: 90,
    status: "medium"
  }
];

export const mockParallelGroups: ParallelEquipmentGroup[] = [
  {
    id: "weld-group-01",
    stationType: "weld",
    name: "Welding Station Group",
    equipment: mockEquipment.filter(eq => eq.parallelGroupId === "weld-group-01"),
    combinedKpis: {
      totalFpy: 97.0,
      totalUnits: 1180,
      avgCycleTime: 61.5,
      maxAnomalyScore: 28
    }
  }
];

// Helper function to calculate overall metrics
export const calculateOverallMetrics = (equipment: Equipment[], flowLinks: FlowLink[]) => ({
  avgFPY: equipment.reduce((sum, eq) => sum + eq.kpis.fpy, 0) / equipment.length,
  totalUnits: equipment.reduce((sum, eq) => sum + eq.kpis.totalUnits, 0),
  totalThroughput: flowLinks.reduce((sum, link) => sum + link.throughputCount, 0),
  criticalAlerts: equipment.filter(eq => eq.status === 'critical' || eq.status === 'warning').length
});
