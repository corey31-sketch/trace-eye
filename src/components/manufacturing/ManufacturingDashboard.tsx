import { useState, useEffect } from "react";
import { Equipment, FlowLink, TimeRange, ProductFilter, ParallelEquipmentGroup } from "@/types/manufacturing";
import { EquipmentCard } from "./EquipmentCard";
import { ParallelEquipmentGroupCard } from "./ParallelEquipmentGroupCard";
import { EnhancedFlowVisualization } from "./EnhancedFlowVisualization";
import { EquipmentDetailView } from "./EquipmentDetailView";
import { TimeRangeSelector } from "./TimeRangeSelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Settings, RefreshCw, TrendingUp, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data for demonstration
const mockEquipment: Equipment[] = [
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

const mockFlowLinks: FlowLink[] = [
  {
    id: "flow-1",
    sourceId: "press-01",
    targetId: "weld-group-01", // Points to parallel group
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

// Create parallel equipment groups
const mockParallelGroups: ParallelEquipmentGroup[] = [
  {
    id: "weld-group-01",
    stationType: "weld",
    name: "Welding Station Group",
    equipment: mockEquipment.filter(eq => eq.parallelGroupId === "weld-group-01"),
    combinedKpis: {
      totalFpy: 97.0, // Average of parallel units
      totalUnits: 1180, // Sum of all units
      avgCycleTime: 61.5, // Average cycle time
      maxAnomalyScore: 28 // Maximum anomaly score
    }
  }
];

export const ManufacturingDashboard = () => {
  const [equipment, setEquipment] = useState<Equipment[]>(mockEquipment);
  const [parallelGroups, setParallelGroups] = useState<ParallelEquipmentGroup[]>(mockParallelGroups);
  const [flowLinks, setFlowLinks] = useState<FlowLink[]>(mockFlowLinks);
  const [timeRange, setTimeRange] = useState<TimeRange>({ type: 'realtime' });
  const [productFilter, setProductFilter] = useState<ProductFilter>();
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulate real-time data updates
  useEffect(() => {
    if (timeRange.type !== 'realtime') return;

    const interval = setInterval(() => {
      setEquipment(prev => prev.map(eq => ({
        ...eq,
        kpis: {
          ...eq.kpis,
          totalUnits: eq.kpis.totalUnits + Math.floor(Math.random() * 5),
          anomalyScore: Math.max(0, Math.min(100, eq.kpis.anomalyScore + (Math.random() - 0.5) * 10))
        }
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, [timeRange.type]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const handleEquipmentClick = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
  };

  const handleGroupClick = (group: ParallelEquipmentGroup) => {
    // For groups, show the first equipment's detail (could be enhanced to show group view)
    if (group.equipment.length > 0) {
      setSelectedEquipment(group.equipment[0]);
    }
  };

  // Calculate overall metrics
  const overallMetrics = {
    avgFPY: equipment.reduce((sum, eq) => sum + eq.kpis.fpy, 0) / equipment.length,
    totalUnits: equipment.reduce((sum, eq) => sum + eq.kpis.totalUnits, 0),
    totalThroughput: flowLinks.reduce((sum, link) => sum + link.throughputCount, 0),
    criticalAlerts: equipment.filter(eq => eq.status === 'critical' || eq.status === 'warning').length
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Manufacturing Operations Center
            </h1>
            <p className="text-muted-foreground">
              Real-time monitoring and analytics for discrete manufacturing processes
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
          </div>
        </div>

        {/* Time Range and Filters */}
        <TimeRangeSelector
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          productFilter={productFilter}
          onProductFilterChange={setProductFilter}
        />
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overall FPY
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {overallMetrics.avgFPY.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Total Units
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {overallMetrics.totalUnits.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Throughput
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {overallMetrics.totalThroughput}/h
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-foreground">
                {overallMetrics.criticalAlerts}
              </div>
              {overallMetrics.criticalAlerts > 0 && (
                <Badge variant="destructive" className="text-xs">
                  Active
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <div className="relative">
        {/* Individual Equipment Cards */}
        <div className="absolute inset-0" style={{ zIndex: 2 }}>
          {equipment.filter(eq => !eq.isParallel).map(eq => (
            <div
              key={eq.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: eq.x,
                top: eq.y,
              }}
            >
              <EquipmentCard
                equipment={eq}
                onClick={() => handleEquipmentClick(eq)}
              />
            </div>
          ))}
          
          {/* Parallel Equipment Group Cards */}
          {parallelGroups.map(group => {
            const avgX = group.equipment.reduce((sum, eq) => sum + eq.x, 0) / group.equipment.length;
            const avgY = group.equipment.reduce((sum, eq) => sum + eq.y, 0) / group.equipment.length;
            
            return (
              <div
                key={group.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: avgX,
                  top: avgY,
                }}
              >
                <ParallelEquipmentGroupCard
                  group={group}
                  onClick={() => handleGroupClick(group)}
                />
              </div>
            );
          })}
        </div>

        {/* Enhanced Flow Visualization */}
        <EnhancedFlowVisualization
          equipment={equipment}
          parallelGroups={parallelGroups}
          links={flowLinks}
          className="min-h-[600px]"
        />
      </div>

      {/* Equipment Details Modal */}
      <EquipmentDetailView
        equipment={selectedEquipment}
        isOpen={!!selectedEquipment}
        onClose={() => setSelectedEquipment(null)}
      />
    </div>
  );
};