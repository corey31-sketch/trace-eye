import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Gauge, Activity, AlertTriangle } from "lucide-react";
import { mockStationStats, stationDisplayNames, lineConfig, getStatusColor } from "@/data/mockManufacturingData";
import ReactECharts from "echarts-for-react";
import { cn } from "@/lib/utils";
import { DateTimeRangeSelector } from "@/components/manufacturing/DateTimeRangeSelector";

export default function StationComparison() {
  const navigate = useNavigate();
  const allStationIds = lineConfig.stationOrder;
  const [station1Id, setStation1Id] = useState<string>(allStationIds[0]);
  const [station2Id, setStation2Id] = useState<string>(allStationIds[1]);

  const station1 = mockStationStats[station1Id];
  const station2 = mockStationStats[station2Id];

  // Get shared parameter names
  const params1 = Object.keys(station1.parameters);
  const params2 = Object.keys(station2.parameters);
  const allParamNames = [...new Set([...params1, ...params2])];
  const [selectedParameters, setSelectedParameters] = useState<string[]>(allParamNames);

  const handleSelectAll = (checked: boolean) => {
    setSelectedParameters(checked ? allParamNames : []);
  };

  const handleParameterToggle = (name: string, checked: boolean) => {
    if (checked) setSelectedParameters(prev => [...prev, name]);
    else setSelectedParameters(prev => prev.filter(n => n !== name));
  };

  const isAllSelected = selectedParameters.length === allParamNames.length;
  const filteredParams = allParamNames.filter(n => selectedParameters.includes(n));

  const name1 = stationDisplayNames[station1Id] || station1Id;
  const name2 = stationDisplayNames[station2Id] || station2Id;

  // Compare means
  const comparisonChartOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'hsl(var(--card))',
      borderColor: 'hsl(var(--border))',
      textStyle: { color: 'hsl(var(--foreground))' },
    },
    legend: {
      data: [name1, name2],
      textStyle: { color: 'hsl(var(--foreground))' },
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: filteredParams,
      axisLine: { lineStyle: { color: 'hsl(var(--muted-foreground))' } },
      axisLabel: { color: 'hsl(var(--muted-foreground))' },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: 'hsl(var(--muted-foreground))' } },
      axisLabel: { color: 'hsl(var(--muted-foreground))' },
      splitLine: { lineStyle: { color: 'hsl(var(--border))', type: 'dashed' } },
    },
    series: [
      {
        name: name1,
        type: 'bar',
        data: filteredParams.map(n => station1.parameters[n]?.mean ?? 0),
        itemStyle: { color: 'hsl(var(--primary))' },
      },
      {
        name: name2,
        type: 'bar',
        data: filteredParams.map(n => station2.parameters[n]?.mean ?? 0),
        itemStyle: { color: 'hsl(var(--status-good))' },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
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

        <div className="grid grid-cols-2 gap-6">
          <Card className="bg-gradient-card border-border/50">
            <CardHeader><CardTitle className="text-lg">Station 1</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Select value={station1Id} onValueChange={setStation1Id}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {allStationIds.map(id => (
                    <SelectItem key={id} value={id}>{stationDisplayNames[id] || id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant="outline" className={cn("border-none w-fit", `bg-${getStatusColor(station1.status)}`, "text-primary-foreground")}>
                {station1.status.toUpperCase()}
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardHeader><CardTitle className="text-lg">Station 2</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Select value={station2Id} onValueChange={setStation2Id}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {allStationIds.map(id => (
                    <SelectItem key={id} value={id}>{stationDisplayNames[id] || id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant="outline" className={cn("border-none w-fit", `bg-${getStatusColor(station2.status)}`, "text-primary-foreground")}>
                {station2.status.toUpperCase()}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* KPI Comparison */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Avg Cpk", icon: Gauge, val1: (() => { const c = Object.values(station1.parameters).filter(p => p.cpk != null).map(p => p.cpk!); return c.length ? (c.reduce((a,b)=>a+b,0)/c.length).toFixed(2) : "N/A"; })(), val2: (() => { const c = Object.values(station2.parameters).filter(p => p.cpk != null).map(p => p.cpk!); return c.length ? (c.reduce((a,b)=>a+b,0)/c.length).toFixed(2) : "N/A"; })() },
            { label: "Parameters", icon: Activity, val1: Object.keys(station1.parameters).length, val2: Object.keys(station2.parameters).length },
            { label: "Anomalies", icon: AlertTriangle, val1: Object.values(station1.parameters).reduce((s, p) => s + p.anomalyWindows.length, 0), val2: Object.values(station2.parameters).reduce((s, p) => s + p.anomalyWindows.length, 0) },
          ].map(({ label, icon: Icon, val1, val2 }) => (
            <Card key={label} className="bg-gradient-card border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Icon className="h-4 w-4" />{label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between">
                  <div><div className="text-xs text-muted-foreground">{name1}</div><div className="text-xl font-bold">{val1}</div></div>
                  <div className="text-right"><div className="text-xs text-muted-foreground">{name2}</div><div className="text-xl font-bold">{val2}</div></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-gradient-card border-border/50">
          <CardHeader><CardTitle>Parameter Mean Comparison</CardTitle></CardHeader>
          <CardContent>
            <div style={{ height: 400 }}>
              <ReactECharts option={comparisonChartOption} style={{ height: '100%' }} />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-card border-border/50">
            <CardHeader><CardTitle>Select Parameters</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2 pb-2 border-b border-border">
                <Checkbox id="select-all" checked={isAllSelected} onCheckedChange={handleSelectAll} />
                <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">All Parameters</label>
              </div>
              {allParamNames.map(name => (
                <div key={name} className="flex items-center space-x-2">
                  <Checkbox id={name} checked={selectedParameters.includes(name)} onCheckedChange={(c) => handleParameterToggle(name, c as boolean)} />
                  <label htmlFor={name} className="text-sm cursor-pointer">{name}</label>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50 lg:col-span-3">
            <CardHeader><CardTitle>Parameter Comparison</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Parameter</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">{name1} (Mean ± σ)</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">{name2} (Mean ± σ)</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Δ Mean</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParams.map(name => {
                      const p1 = station1.parameters[name];
                      const p2 = station2.parameters[name];
                      const diff = p1 && p2 ? ((p1.mean - p2.mean) / p2.mean * 100).toFixed(1) : "—";
                      return (
                        <tr key={name} className="border-b border-border/50">
                          <td className="p-3 text-sm">{name}</td>
                          <td className="p-3 text-sm">{p1 ? `${p1.mean.toFixed(2)} ± ${p1.stdDev.toFixed(2)}` : "—"}</td>
                          <td className="p-3 text-sm">{p2 ? `${p2.mean.toFixed(2)} ± ${p2.stdDev.toFixed(2)}` : "—"}</td>
                          <td className="p-3 text-sm"><Badge variant="outline">{diff}%</Badge></td>
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
