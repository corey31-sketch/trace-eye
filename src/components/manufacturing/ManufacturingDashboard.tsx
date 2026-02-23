import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Equipment, FlowLink, TimeRange, ProductFilter, ParallelEquipmentGroup } from "@/types/manufacturing";
import { EquipmentCard } from "./EquipmentCard";
import { ParallelEquipmentGroupCard } from "./ParallelEquipmentGroupCard";
import { TimeRangeSelector } from "./TimeRangeSelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Settings, RefreshCw, TrendingUp, AlertTriangle, GitBranch, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockEquipment, mockFlowLinks, mockParallelGroups, calculateOverallMetrics } from "@/data/mockManufacturingData";

export const ManufacturingDashboard = () => {
  const navigate = useNavigate();
  // In FastHTML, this data would come from server-side rendering
  const [timeRange, setTimeRange] = useState<TimeRange>({ type: 'realtime' });
  const [productFilter, setProductFilter] = useState<ProductFilter>();
  
  // Simplified - no client-side state updates or intervals
  // In FastHTML, data refreshes would be handled with HTMX polling or websockets
  const equipment = mockEquipment;
  const parallelGroups = mockParallelGroups;
  const flowLinks = mockFlowLinks;

  const handleRefresh = () => {
    // In FastHTML: window.location.reload() or HTMX hx-get
    window.location.reload();
  };

  const handleEquipmentClick = (equipment: Equipment) => {
    navigate(`/equipment/${equipment.id}`);
  };

  const handleGroupClick = (group: ParallelEquipmentGroup) => {
    // For groups, navigate to the first equipment's detail
    if (group.equipment.length > 0) {
      navigate(`/equipment/${group.equipment[0].id}`);
    }
  };

  // Calculate overall metrics - in FastHTML this would be done server-side
  const overallMetrics = calculateOverallMetrics(equipment, flowLinks);

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
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/ml-decision-tree')}
            >
              <GitBranch className="h-4 w-4 mr-2" />
              ML Analysis
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

      {/* Main Dashboard - Simple horizontal flow with arrows */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4">
        {(() => {
          // Build ordered list: non-parallel equipment and groups in x-order
          const standaloneEquipment = equipment.filter(eq => !eq.isParallel);
          const items: { type: 'equipment' | 'group'; data: any; x: number }[] = [
            ...standaloneEquipment.map(eq => ({ type: 'equipment' as const, data: eq, x: eq.x })),
            ...parallelGroups.map(group => ({
              type: 'group' as const,
              data: group,
              x: group.equipment.reduce((sum, eq) => sum + eq.x, 0) / group.equipment.length,
            })),
          ];
          items.sort((a, b) => a.x - b.x);

          return items.map((item, index) => (
            <div key={item.type === 'equipment' ? item.data.id : item.data.id} className="flex items-center gap-2">
              {item.type === 'equipment' ? (
                <EquipmentCard
                  equipment={item.data}
                  onClick={() => handleEquipmentClick(item.data)}
                />
              ) : (
                <ParallelEquipmentGroupCard
                  group={item.data}
                  onClick={() => handleGroupClick(item.data)}
                />
              )}
              {index < items.length - 1 && (
                <ArrowRight className="h-8 w-8 text-muted-foreground flex-shrink-0" />
              )}
            </div>
          ));
        })()}
      </div>

    </div>
  );
};