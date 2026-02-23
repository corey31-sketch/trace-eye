import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { StationStats, TimeRange, ProductFilter } from "@/types/manufacturing";
import { EquipmentCard } from "./EquipmentCard";
import { ParallelEquipmentGroupCard } from "./ParallelEquipmentGroupCard";
import { TimeRangeSelector } from "./TimeRangeSelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Settings, RefreshCw, TrendingUp, AlertTriangle, GitBranch, ArrowRight, Gauge } from "lucide-react";
import { mockStationStats, lineConfig, parallelGroups, calculateOverallMetrics, stationDisplayNames } from "@/data/mockManufacturingData";

export const ManufacturingDashboard = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<TimeRange>({ type: 'realtime' });
  const [productFilter, setProductFilter] = useState<ProductFilter>();

  const stations = lineConfig.stationOrder.map(id => mockStationStats[id]).filter(Boolean);
  const overallMetrics = calculateOverallMetrics(stations);

  const handleRefresh = () => window.location.reload();

  const handleStationClick = (stationId: string) => {
    navigate(`/equipment/${stationId}`);
  };

  // Build flow items: group parallel stations together
  const buildFlowItems = (): { type: 'station' | 'group'; stationIds: string[]; groupName?: string }[] => {
    const visited = new Set<string>();
    const items: { type: 'station' | 'group'; stationIds: string[]; groupName?: string }[] = [];

    for (const stationId of lineConfig.stationOrder) {
      if (visited.has(stationId)) continue;
      
      // Check if this station belongs to a parallel group
      const groupEntry = Object.entries(parallelGroups).find(([, ids]) => ids.includes(stationId));
      if (groupEntry) {
        const [groupName, groupIds] = groupEntry;
        groupIds.forEach(id => visited.add(id));
        items.push({ type: 'group', stationIds: groupIds, groupName: "Welding Stations" });
      } else {
        visited.add(stationId);
        items.push({ type: 'station', stationIds: [stationId] });
      }
    }
    return items;
  };

  const flowItems = buildFlowItems();

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
              Real-time monitoring and analytics — {lineConfig.name}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/ml-decision-tree')}>
              <GitBranch className="h-4 w-4 mr-2" />
              ML Analysis
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
          </div>
        </div>

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
              <Gauge className="h-4 w-4" />
              Avg Cpk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {overallMetrics.avgCpk.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Parameters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {overallMetrics.totalParams}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Outliers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {overallMetrics.totalOutliers}
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
                {overallMetrics.totalAnomalies}
              </div>
              {overallMetrics.totalAnomalies > 0 && (
                <Badge variant="destructive" className="text-xs">Active</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard - Simple horizontal flow with arrows */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4">
        {flowItems.map((item, index) => (
          <div key={item.stationIds.join('-')} className="flex items-center gap-2">
            {item.type === 'station' ? (
              <EquipmentCard
                station={mockStationStats[item.stationIds[0]]}
                onClick={() => handleStationClick(item.stationIds[0])}
              />
            ) : (
              <ParallelEquipmentGroupCard
                groupName={item.groupName || "Parallel Group"}
                stations={item.stationIds.map(id => mockStationStats[id])}
                onClick={() => handleStationClick(item.stationIds[0])}
              />
            )}
            {index < flowItems.length - 1 && (
              <ArrowRight className="h-8 w-8 text-muted-foreground flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
