import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SPCChartComponent } from "@/components/manufacturing/SPCChart";
import { ParameterCard } from "@/components/manufacturing/ParameterCard";
import ReactECharts from "echarts-for-react";
import { TrendingUp, Activity, AlertTriangle, Gauge, Download, Settings, ArrowLeft, GitCompare } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockStationStats, stationDisplayNames, getStatusColor } from "@/data/mockManufacturingData";
import { DateTimeRangeSelector } from "@/components/manufacturing/DateTimeRangeSelector";

export default function EquipmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id || !mockStationStats[id]) {
    return <div className="min-h-screen bg-background p-6 text-foreground">Station not found</div>;
  }

  const station = mockStationStats[id];
  const displayName = stationDisplayNames[id] || id;
  const statusColor = getStatusColor(station.status);
  const paramEntries = Object.entries(station.parameters);

  // Build a simple FPY-like trend from trace data of first parameter
  const firstParam = paramEntries[0]?.[1];
  const trendData = firstParam?.trace.map((point, i) => ({
    time: new Date(point.timestamp).toLocaleTimeString(),
    value: point.value,
  })) || [];

  const trendOption = {
    backgroundColor: 'transparent',
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'hsl(var(--card))',
      borderColor: 'hsl(var(--border))',
      textStyle: { color: 'hsl(var(--foreground))' },
    },
    xAxis: {
      type: 'category',
      data: trendData.map(d => d.time),
      axisLine: { lineStyle: { color: 'hsl(var(--muted-foreground))' } },
      axisLabel: { color: 'hsl(var(--muted-foreground))', fontSize: 12 },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: 'hsl(var(--muted-foreground))' } },
      axisLabel: { color: 'hsl(var(--muted-foreground))', fontSize: 12 },
      splitLine: { lineStyle: { color: 'hsl(var(--border))', type: 'dashed' } },
    },
    series: [{
      name: paramEntries[0]?.[0] || 'Value',
      type: 'line',
      data: trendData.map(d => d.value),
      areaStyle: { color: 'hsl(var(--primary))', opacity: 0.3 },
      itemStyle: { color: 'hsl(var(--primary))' },
      lineStyle: { width: 2 },
      smooth: true,
    }],
  };

  const avgCpk = (() => {
    const cpks = paramEntries.filter(([, p]) => p.cpk != null).map(([, p]) => p.cpk!);
    return cpks.length > 0 ? cpks.reduce((a, b) => a + b, 0) / cpks.length : null;
  })();

  const totalAnomalies = paramEntries.reduce((sum, [, p]) => sum + p.anomalyWindows.length, 0);
  const totalOutliers = paramEntries.reduce((sum, [, p]) => sum + p.outlierCount, 0);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">
              {displayName} ({id}) — Detailed Analysis
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn("border-none", `bg-${statusColor}`, "text-primary-foreground")}
            >
              {station.status.toUpperCase()}
            </Badge>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
          </div>
        </div>

        <div className="flex justify-start">
          <DateTimeRangeSelector />
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="parameters">Parameters</TabsTrigger>
            <TabsTrigger value="spc">SPC Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <Card className="bg-gradient-card border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Gauge className="h-4 w-4" />
                    Avg Cpk
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {avgCpk?.toFixed(2) ?? "N/A"}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Parameters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {paramEntries.length}
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
                    {totalOutliers}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Anomalies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={cn("text-2xl font-bold", totalAnomalies > 0 ? "text-status-warning" : "text-status-excellent")}>
                    {totalAnomalies}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Parameter Trend — {paramEntries[0]?.[0] || "N/A"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ height: 300 }}>
                  <ReactECharts option={trendOption} style={{ height: '100%' }} />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center pt-4">
              <Button size="lg" onClick={() => navigate('/comparison')} className="gap-2">
                <GitCompare className="h-5 w-5" />
                Compare with Another Station
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="parameters" className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {paramEntries.map(([name, stats]) => (
                <ParameterCard key={name} name={name} parameter={stats} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="spc" className="space-y-6">
            {paramEntries.map(([name, stats]) => (
              <SPCChartComponent key={name} paramName={name} paramStats={stats} height={350} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
