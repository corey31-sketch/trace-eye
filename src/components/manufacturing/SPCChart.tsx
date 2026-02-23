import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ParameterStats } from "@/types/manufacturing";
import ReactECharts from "echarts-for-react";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SPCChartComponentProps {
  paramName: string;
  paramStats: ParameterStats;
  height?: number;
  className?: string;
}

export const SPCChartComponent = ({ paramName, paramStats, height = 300, className }: SPCChartComponentProps) => {
  const [lcl, ucl] = paramStats.controlLimits;
  const [lsl, usl] = paramStats.specLimits;

  const chartData = paramStats.trace.map(point => ({
    time: new Date(point.timestamp).toLocaleTimeString(),
    value: point.value,
  }));

  const markLines: any[] = [
    { name: 'UCL', yAxis: ucl, lineStyle: { color: 'hsl(var(--status-critical))', type: 'dashed', width: 2 }, label: { formatter: 'UCL', color: 'hsl(var(--status-critical))' } },
    { name: 'LCL', yAxis: lcl, lineStyle: { color: 'hsl(var(--status-critical))', type: 'dashed', width: 2 }, label: { formatter: 'LCL', color: 'hsl(var(--status-critical))' } },
    { name: 'Mean', yAxis: paramStats.mean, lineStyle: { color: 'hsl(var(--primary))', type: 'dashed', width: 1 }, label: { formatter: 'Mean', color: 'hsl(var(--primary))' } },
  ];

  if (usl != null) markLines.push({ name: 'USL', yAxis: usl, lineStyle: { color: 'hsl(var(--status-warning))', type: 'solid', width: 2 }, label: { formatter: 'USL', color: 'hsl(var(--status-warning))' } });
  if (lsl != null) markLines.push({ name: 'LSL', yAxis: lsl, lineStyle: { color: 'hsl(var(--status-warning))', type: 'solid', width: 2 }, label: { formatter: 'LSL', color: 'hsl(var(--status-warning))' } });

  const chartOption = {
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
      data: chartData.map(d => d.time),
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
      name: paramName,
      type: 'line',
      data: chartData.map(d => d.value),
      itemStyle: { color: 'hsl(var(--primary))' },
      lineStyle: { width: 2 },
      symbol: 'circle',
      symbolSize: 6,
      markLine: { silent: true, symbol: 'none', label: { position: 'insideEndTop' }, data: markLines },
    }],
  };

  const getCapabilityStatus = (cpk: number | undefined) => {
    if (cpk == null) return { status: 'muted', label: 'N/A' };
    if (cpk >= 1.33) return { status: 'excellent', label: 'Excellent' };
    if (cpk >= 1.0) return { status: 'good', label: 'Acceptable' };
    if (cpk >= 0.67) return { status: 'warning', label: 'Marginal' };
    return { status: 'critical', label: 'Poor' };
  };

  const capabilityStatus = getCapabilityStatus(paramStats.cpk);

  return (
    <Card className={cn("bg-gradient-card border-border/50", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">SPC – {paramName}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn("border-none", `bg-status-${capabilityStatus.status}`, "text-primary-foreground")}>
              Cpk: {paramStats.cpk?.toFixed(2) ?? "N/A"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Mean</p>
              <p className="text-sm font-semibold">{paramStats.mean.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Std Dev</p>
              <p className="text-sm font-semibold">{paramStats.stdDev.toFixed(3)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Robust σ</p>
              <p className="text-sm font-semibold">{paramStats.robustSigma.toFixed(3)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Cpk</p>
              <p className="text-sm font-semibold text-status-excellent">{paramStats.cpk?.toFixed(2) ?? "N/A"}</p>
            </div>
          </div>

          <div style={{ height }}>
            <ReactECharts option={chartOption} style={{ height: '100%' }} />
          </div>

          {paramStats.anomalyWindows.length > 0 && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium text-destructive">Anomaly Windows Detected</span>
              </div>
              {paramStats.anomalyWindows.map((w, i) => (
                <div key={i} className="text-xs text-muted-foreground">
                  {w.type} ({w.severity}) – {w.details} ({w.durationMinutes}min)
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
