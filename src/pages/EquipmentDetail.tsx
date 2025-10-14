import { useParams, useNavigate } from "react-router-dom";
import { Equipment, SPCChart, ProcessParameter } from "@/types/manufacturing";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SPCChartComponent } from "@/components/manufacturing/SPCChart";
import { ParameterCard } from "@/components/manufacturing/ParameterCard";
import ReactECharts from "echarts-for-react";
import { TrendingUp, Clock, Activity, AlertTriangle, BarChart3, Download, Settings, ArrowLeft, GitCompare } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockEquipment } from "@/data/mockManufacturingData";
import { DateTimeRangeSelector } from "@/components/manufacturing/DateTimeRangeSelector";

// Mock data generator functions
const generateMockSPCData = (parameterId: string, equipmentId: string): SPCChart => {
  const dataPoints = Array.from({ length: 50 }, (_, i) => {
    const baseValue = 50 + Math.sin(i * 0.1) * 5;
    const noise = (Math.random() - 0.5) * 8;
    const value = baseValue + noise;
    const isOutOfControl = Math.random() < 0.05;
    
    return {
      timestamp: new Date(Date.now() - (49 - i) * 60000),
      value,
      isOutOfControl,
      violationType: isOutOfControl ? (['mean', 'range', 'trend', 'pattern'][Math.floor(Math.random() * 4)] as any) : undefined
    };
  });

  return {
    parameterId,
    equipmentId,
    dataPoints,
    controlLimits: {
      upperControl: 58,
      lowerControl: 42,
      upperSpec: 65,
      lowerSpec: 35,
      target: 50
    },
    statistics: {
      mean: 50.2,
      standardDeviation: 2.8,
      cpk: 1.45,
      cp: 1.78
    }
  };
};

const generateTrendData = () => {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    fpy: 95 + Math.random() * 4,
    cycleTime: 45 + Math.random() * 10,
    throughput: 80 + Math.random() * 20,
    anomalyScore: Math.random() * 30
  }));
};

// In FastHTML, equipment data would be fetched server-side and passed to template
const getMockEquipment = (id: string): Equipment => {
  // Use data from centralized mock data file
  const found = mockEquipment.find(eq => eq.id === id);
  return found || mockEquipment[0];
};

export default function EquipmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // Removed useState - in FastHTML, active tab would be a URL parameter
  // Example: /equipment/press-01?tab=overview

  if (!id) {
    return <div>Equipment not found</div>;
  }

  // In FastHTML, all this data would be generated server-side
  const equipment = getMockEquipment(id);
  const spcData = equipment.parameters?.map(param => 
    generateMockSPCData(param.id, equipment.id)
  ) || [];
  const trendData = generateTrendData();

  const exportData = () => {
    console.log("Exporting data for", equipment.name);
  };

  // ECharts options for 24-hour performance trends
  const performanceTrendsOption = {
    backgroundColor: 'transparent',
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'hsl(var(--card))',
      borderColor: 'hsl(var(--border))',
      textStyle: { color: 'hsl(var(--foreground))' }
    },
    xAxis: {
      type: 'category',
      data: trendData.map(d => d.hour),
      axisLine: { lineStyle: { color: 'hsl(var(--muted-foreground))' } },
      axisLabel: { color: 'hsl(var(--muted-foreground))', fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: 'hsl(var(--muted-foreground))' } },
      axisLabel: { color: 'hsl(var(--muted-foreground))', fontSize: 12 },
      splitLine: { lineStyle: { color: 'hsl(var(--border))', type: 'dashed' } }
    },
    series: [{
      name: 'FPY (%)',
      type: 'line',
      data: trendData.map(d => d.fpy),
      areaStyle: { color: 'hsl(var(--primary))', opacity: 0.3 },
      itemStyle: { color: 'hsl(var(--primary))' },
      lineStyle: { width: 2 },
      smooth: true
    }]
  };

  // ECharts options for cycle time trend
  const cycleTimeTrendOption = {
    backgroundColor: 'transparent',
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'hsl(var(--card))',
      borderColor: 'hsl(var(--border))',
      textStyle: { color: 'hsl(var(--foreground))' }
    },
    xAxis: {
      type: 'category',
      data: trendData.map(d => d.hour),
      axisLine: { lineStyle: { color: 'hsl(var(--muted-foreground))' } },
      axisLabel: { color: 'hsl(var(--muted-foreground))', fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: 'hsl(var(--muted-foreground))' } },
      axisLabel: { color: 'hsl(var(--muted-foreground))', fontSize: 12 },
      splitLine: { lineStyle: { color: 'hsl(var(--border))', type: 'dashed' } }
    },
    series: [{
      name: 'Cycle Time (s)',
      type: 'line',
      data: trendData.map(d => d.cycleTime),
      itemStyle: { color: 'hsl(var(--status-good))' },
      lineStyle: { width: 2 }
    }]
  };

  // ECharts options for throughput trend
  const throughputTrendOption = {
    backgroundColor: 'transparent',
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'hsl(var(--card))',
      borderColor: 'hsl(var(--border))',
      textStyle: { color: 'hsl(var(--foreground))' }
    },
    xAxis: {
      type: 'category',
      data: trendData.map(d => d.hour),
      axisLine: { lineStyle: { color: 'hsl(var(--muted-foreground))' } },
      axisLabel: { color: 'hsl(var(--muted-foreground))', fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: 'hsl(var(--muted-foreground))' } },
      axisLabel: { color: 'hsl(var(--muted-foreground))', fontSize: 12 },
      splitLine: { lineStyle: { color: 'hsl(var(--border))', type: 'dashed' } }
    },
    series: [{
      name: 'Throughput (units/h)',
      type: 'line',
      data: trendData.map(d => d.throughput),
      itemStyle: { color: 'hsl(var(--primary))' },
      lineStyle: { width: 2 }
    }]
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">
              {equipment.name} - Detailed Analysis
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline"
              className={cn(
                "border-none",
                equipment.status === 'excellent' ? 'bg-status-excellent' :
                equipment.status === 'good' ? 'bg-status-good' :
                equipment.status === 'warning' ? 'bg-status-warning' :
                equipment.status === 'critical' ? 'bg-status-critical' : 'bg-status-offline',
                "text-primary-foreground"
              )}
            >
              {equipment.status.toUpperCase()}
            </Badge>
            <Button variant="outline" size="sm" onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
          </div>
        </div>

        {/* Date/Time Range Selector */}
        <div className="flex justify-start">
          <DateTimeRangeSelector />
        </div>

        {/* Tabs - in FastHTML, use defaultValue or URL parameters for active tab */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="parameters">Parameters</TabsTrigger>
            <TabsTrigger value="spc">SPC Analysis</TabsTrigger>
            <TabsTrigger value="trends">Historical Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
              <Card className="bg-gradient-card border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    First Pass Yield
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {equipment.kpis.fpy.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">Target: 98%</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Total Units
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {equipment.kpis.totalUnits.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">Last 24h</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Cycle Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {equipment.kpis.avgCycleTime.toFixed(1)}s
                  </div>
                  <p className="text-xs text-muted-foreground">Target: 45s</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Anomaly Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={cn(
                    "text-2xl font-bold",
                    equipment.kpis.anomalyScore > 70 ? "text-status-critical" :
                    equipment.kpis.anomalyScore > 40 ? "text-status-warning" :
                    "text-status-excellent"
                  )}>
                    {equipment.kpis.anomalyScore.toFixed(0)}
                  </div>
                  <p className="text-xs text-muted-foreground">0-100 scale</p>
                </CardContent>
              </Card>
            </div>

            {/* Real-time Trends */}
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  24-Hour Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ height: 300 }}>
                  <ReactECharts option={performanceTrendsOption} style={{ height: '100%' }} />
                </div>
              </CardContent>
            </Card>

            {/* Station Comparison Button */}
            <div className="flex justify-center pt-4">
              <Button 
                size="lg" 
                onClick={() => navigate('/comparison')}
                className="gap-2"
              >
                <GitCompare className="h-5 w-5" />
                Compare with Another Station
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="parameters" className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {equipment.parameters.map(parameter => (
                <ParameterCard key={parameter.id} parameter={parameter} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="spc" className="space-y-6">
            {spcData.map(spc => (
              <SPCChartComponent key={spc.parameterId} spcData={spc} height={350} />
            ))}
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {/* Cycle Time Trend */}
              <Card className="bg-gradient-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Cycle Time Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div style={{ height: 200 }}>
                    <ReactECharts option={cycleTimeTrendOption} style={{ height: '100%' }} />
                  </div>
                </CardContent>
              </Card>

              {/* Throughput Trend */}
              <Card className="bg-gradient-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Throughput Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div style={{ height: 200 }}>
                    <ReactECharts option={throughputTrendOption} style={{ height: '100%' }} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
