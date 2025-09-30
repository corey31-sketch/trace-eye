import { useState, useEffect } from "react";
import { Equipment, FlowLink, TimeRange, ProductFilter } from "@/types/manufacturing";
import { EquipmentCard } from "./EquipmentCard";
import { FlowVisualization } from "./FlowVisualization";
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
    x: 100,
    y: 200,
    status: "excellent",
    kpis: {
      fpy: 98.5,
      totalUnits: 1240,
      avgCycleTime: 45.2,
      anomalyScore: 12
    }
  },
  {
    id: "weld-station",
    name: "Weld Station",
    x: 400,
    y: 200,
    status: "good",
    kpis: {
      fpy: 96.8,
      totalUnits: 1180,
      avgCycleTime: 62.8,
      anomalyScore: 28
    }
  },
  {
    id: "assembly-line",
    name: "Assembly Line",
    x: 700,
    y: 200,
    status: "warning",
    kpis: {
      fpy: 94.2,
      totalUnits: 1150,
      avgCycleTime: 78.5,
      anomalyScore: 45
    }
  },
  {
    id: "quality-check",
    name: "Quality Check",
    x: 1000,
    y: 200,
    status: "excellent",
    kpis: {
      fpy: 99.1,
      totalUnits: 1140,
      avgCycleTime: 35.0,
      anomalyScore: 8
    }
  }
];

const mockFlowLinks: FlowLink[] = [
  {
    id: "flow-1",
    sourceId: "press-01",
    targetId: "weld-station",
    throughputCount: 85,
    avgTransitionTime: 120,
    status: "high"
  },
  {
    id: "flow-2",
    sourceId: "weld-station",
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

export const ManufacturingDashboard = () => {
  const [equipment, setEquipment] = useState<Equipment[]>(mockEquipment);
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
    // In a real app, this would navigate to detailed SPC view
    console.log('Opening detailed view for:', equipment.name);
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
        {/* Equipment Cards */}
        <div className="absolute inset-0" style={{ zIndex: 2 }}>
          {equipment.map(eq => (
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
        </div>

        {/* Flow Visualization */}
        <FlowVisualization
          equipment={equipment}
          links={flowLinks}
          className="min-h-[600px]"
        />
      </div>

      {/* Equipment Details Modal/Sidebar would go here */}
      {selectedEquipment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96 max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{selectedEquipment.name} - Detailed Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                SPC-style visualizations and detailed analytics would be displayed here.
              </p>
              <Button onClick={() => setSelectedEquipment(null)}>
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};