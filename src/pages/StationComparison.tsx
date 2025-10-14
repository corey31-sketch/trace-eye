import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, TrendingUp, Clock, Activity, AlertTriangle } from "lucide-react";
import { mockEquipment } from "@/data/mockManufacturingData";
import ReactECharts from "echarts-for-react";
import { cn } from "@/lib/utils";
import { DateTimeRangeSelector } from "@/components/manufacturing/DateTimeRangeSelector";

export default function StationComparison() {
  const navigate = useNavigate();
  const [station1Id, setStation1Id] = useState<string>(mockEquipment[0].id);
  const [station2Id, setStation2Id] = useState<string>(mockEquipment[1].id);

  const station1 = mockEquipment.find(eq => eq.id === station1Id) || mockEquipment[0];
  const station2 = mockEquipment.find(eq => eq.id === station2Id) || mockEquipment[1];

  // Parameter selection state
  const allParameterIds = station1.parameters.map(p => p.id);
  const [selectedParameters, setSelectedParameters] = useState<string[]>(allParameterIds);

  const handleSelectAll = (checked: boolean) => {
    setSelectedParameters(checked ? allParameterIds : []);
  };

  const handleParameterToggle = (parameterId: string, checked: boolean) => {
    if (checked) {
      setSelectedParameters(prev => [...prev, parameterId]);
    } else {
      setSelectedParameters(prev => prev.filter(id => id !== parameterId));
    }
  };

  const isAllSelected = selectedParameters.length === allParameterIds.length;
  const filteredParameters = station1.parameters.filter(p => selectedParameters.includes(p.id));

  // Generate comparison chart data
  const comparisonChartOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'hsl(var(--card))',
      borderColor: 'hsl(var(--border))',
      textStyle: { color: 'hsl(var(--foreground))' }
    },
    legend: {
      data: [station1.name, station2.name],
      textStyle: { color: 'hsl(var(--foreground))' }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['FPY (%)', 'Cycle Time (s)', 'Total Units', 'Anomaly Score'],
      axisLine: { lineStyle: { color: 'hsl(var(--muted-foreground))' } },
      axisLabel: { color: 'hsl(var(--muted-foreground))' }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: 'hsl(var(--muted-foreground))' } },
      axisLabel: { color: 'hsl(var(--muted-foreground))' },
      splitLine: { lineStyle: { color: 'hsl(var(--border))', type: 'dashed' } }
    },
    series: [
      {
        name: station1.name,
        type: 'bar',
        data: [
          station1.kpis.fpy,
          station1.kpis.avgCycleTime,
          station1.kpis.totalUnits,
          station1.kpis.anomalyScore
        ],
        itemStyle: { color: 'hsl(var(--primary))' }
      },
      {
        name: station2.name,
        type: 'bar',
        data: [
          station2.kpis.fpy,
          station2.kpis.avgCycleTime,
          station2.kpis.totalUnits,
          station2.kpis.anomalyScore
        ],
        itemStyle: { color: 'hsl(var(--status-good))' }
      }
    ]
  };

  // Time series comparison
  const timeSeriesData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    station1Fpy: 95 + Math.random() * 4,
    station2Fpy: 93 + Math.random() * 5
  }));

  const timeSeriesOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'hsl(var(--card))',
      borderColor: 'hsl(var(--border))',
      textStyle: { color: 'hsl(var(--foreground))' }
    },
    legend: {
      data: [station1.name, station2.name],
      textStyle: { color: 'hsl(var(--foreground))' }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: timeSeriesData.map(d => d.hour),
      axisLine: { lineStyle: { color: 'hsl(var(--muted-foreground))' } },
      axisLabel: { color: 'hsl(var(--muted-foreground))' }
    },
    yAxis: {
      type: 'value',
      name: 'FPY (%)',
      axisLine: { lineStyle: { color: 'hsl(var(--muted-foreground))' } },
      axisLabel: { color: 'hsl(var(--muted-foreground))' },
      splitLine: { lineStyle: { color: 'hsl(var(--border))', type: 'dashed' } }
    },
    series: [
      {
        name: station1.name,
        type: 'line',
        data: timeSeriesData.map(d => d.station1Fpy),
        itemStyle: { color: 'hsl(var(--primary))' },
        smooth: true,
        lineStyle: { width: 2 }
      },
      {
        name: station2.name,
        type: 'line',
        data: timeSeriesData.map(d => d.station2Fpy),
        itemStyle: { color: 'hsl(var(--status-good))' },
        smooth: true,
        lineStyle: { width: 2 }
      }
    ]
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
            <h1 className="text-3xl font-bold">Station Comparison</h1>
          </div>
          <DateTimeRangeSelector />
        </div>

        {/* Station Selectors */}
        <div className="grid grid-cols-2 gap-6">
          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Station 1</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={station1Id} onValueChange={setStation1Id}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockEquipment.map(eq => (
                    <SelectItem key={eq.id} value={eq.id}>{eq.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge 
                variant="outline"
                className={cn(
                  "border-none w-fit",
                  station1.status === 'excellent' ? 'bg-status-excellent' :
                  station1.status === 'good' ? 'bg-status-good' :
                  station1.status === 'warning' ? 'bg-status-warning' :
                  station1.status === 'critical' ? 'bg-status-critical' : 'bg-status-offline',
                  "text-primary-foreground"
                )}
              >
                {station1.status.toUpperCase()}
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Station 2</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={station2Id} onValueChange={setStation2Id}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockEquipment.map(eq => (
                    <SelectItem key={eq.id} value={eq.id}>{eq.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge 
                variant="outline"
                className={cn(
                  "border-none w-fit",
                  station2.status === 'excellent' ? 'bg-status-excellent' :
                  station2.status === 'good' ? 'bg-status-good' :
                  station2.status === 'warning' ? 'bg-status-warning' :
                  station2.status === 'critical' ? 'bg-status-critical' : 'bg-status-offline',
                  "text-primary-foreground"
                )}
              >
                {station2.status.toUpperCase()}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* KPI Comparison Grid */}
        <div className="grid grid-cols-4 gap-4">
          {/* Station 1 KPIs */}
          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                {station1.name} - FPY
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {station1.kpis.fpy.toFixed(1)}%
              </div>
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
                {station1.kpis.avgCycleTime.toFixed(1)}s
              </div>
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
                {station1.kpis.totalUnits.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Anomaly
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {station1.kpis.anomalyScore.toFixed(0)}
              </div>
            </CardContent>
          </Card>

          {/* Station 2 KPIs */}
          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                {station2.name} - FPY
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {station2.kpis.fpy.toFixed(1)}%
              </div>
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
                {station2.kpis.avgCycleTime.toFixed(1)}s
              </div>
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
                {station2.kpis.totalUnits.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Anomaly
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {station2.kpis.anomalyScore.toFixed(0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Charts */}
        <div className="grid grid-cols-1 gap-6">
          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle>KPI Comparison (Non-Timely)</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ height: 400 }}>
                <ReactECharts option={comparisonChartOption} style={{ height: '100%' }} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle>Performance Over Time (Timely Comparison)</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ height: 400 }}>
                <ReactECharts option={timeSeriesOption} style={{ height: '100%' }} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Parameter Selection and Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Parameter Selection */}
          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle>Select Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2 pb-2 border-b border-border">
                <Checkbox
                  id="select-all"
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                />
                <label
                  htmlFor="select-all"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  All Parameters
                </label>
              </div>
              {station1.parameters.map(param => (
                <div key={param.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={param.id}
                    checked={selectedParameters.includes(param.id)}
                    onCheckedChange={(checked) => handleParameterToggle(param.id, checked as boolean)}
                  />
                  <label
                    htmlFor={param.id}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {param.name}
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Parameter Comparison Table */}
          <Card className="bg-gradient-card border-border/50 lg:col-span-3">
            <CardHeader>
              <CardTitle>Parameter Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Parameter</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">{station1.name}</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">{station2.name}</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Difference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParameters.map((param, idx) => {
                      const param2 = station2.parameters.find(p => p.name === param.name);
                      const diff = param2 ? ((param.currentValue - param2.currentValue) / param2.currentValue * 100).toFixed(1) : 0;
                      return (
                        <tr key={param.id} className="border-b border-border/50">
                          <td className="p-3 text-sm">{param.name}</td>
                          <td className="p-3 text-sm">{param.currentValue} {param.unit}</td>
                          <td className="p-3 text-sm">{param2?.currentValue} {param2?.unit}</td>
                          <td className="p-3 text-sm">
                            <Badge variant="outline">{diff}%</Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
