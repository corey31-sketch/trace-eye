import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SPCChart, SPCDataPoint } from "@/types/manufacturing";
import ReactECharts from "echarts-for-react";
import { AlertTriangle, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SPCChartComponentProps {
  spcData: SPCChart;
  height?: number;
  className?: string;
}

export const SPCChartComponent = ({ spcData, height = 300, className }: SPCChartComponentProps) => {
  const formatTimestamp = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const chartData = spcData.dataPoints.map(point => ({
    time: formatTimestamp(point.timestamp),
    value: point.value,
    isOutOfControl: point.isOutOfControl,
    violationType: point.violationType
  }));

  const chartOption = {
    backgroundColor: 'transparent',
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'hsl(var(--card))',
      borderColor: 'hsl(var(--border))',
      textStyle: {
        color: 'hsl(var(--foreground))'
      }
    },
    xAxis: {
      type: 'category',
      data: chartData.map(d => d.time),
      axisLine: { lineStyle: { color: 'hsl(var(--muted-foreground))' } },
      axisLabel: { color: 'hsl(var(--muted-foreground))', fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: 'hsl(var(--muted-foreground))' } },
      axisLabel: { color: 'hsl(var(--muted-foreground))', fontSize: 12 },
      splitLine: { lineStyle: { color: 'hsl(var(--border))', type: 'dashed' } }
    },
    series: [
      {
        name: 'Value',
        type: 'line',
        data: chartData.map(d => d.value),
        itemStyle: { color: 'hsl(var(--primary))' },
        lineStyle: { width: 2 },
        symbol: 'circle',
        symbolSize: 6,
        markLine: {
          silent: true,
          symbol: 'none',
          label: { position: 'insideEndTop' },
          data: [
            {
              name: 'UCL',
              yAxis: spcData.controlLimits.upperControl,
              lineStyle: { color: 'hsl(var(--status-critical))', type: 'dashed', width: 2 },
              label: { formatter: 'UCL', color: 'hsl(var(--status-critical))' }
            },
            {
              name: 'LCL',
              yAxis: spcData.controlLimits.lowerControl,
              lineStyle: { color: 'hsl(var(--status-critical))', type: 'dashed', width: 2 },
              label: { formatter: 'LCL', color: 'hsl(var(--status-critical))' }
            },
            {
              name: 'Target',
              yAxis: spcData.controlLimits.target,
              lineStyle: { color: 'hsl(var(--primary))', type: 'dashed', width: 1 },
              label: { formatter: 'Target', color: 'hsl(var(--primary))' }
            },
            {
              name: 'USL',
              yAxis: spcData.controlLimits.upperSpec,
              lineStyle: { color: 'hsl(var(--status-warning))', type: 'solid', width: 2 },
              label: { formatter: 'USL', color: 'hsl(var(--status-warning))' }
            },
            {
              name: 'LSL',
              yAxis: spcData.controlLimits.lowerSpec,
              lineStyle: { color: 'hsl(var(--status-warning))', type: 'solid', width: 2 },
              label: { formatter: 'LSL', color: 'hsl(var(--status-warning))' }
            }
          ]
        }
      }
    ]
  };

  const getStatusColor = () => {
    const outOfControlPoints = spcData.dataPoints.filter(p => p.isOutOfControl).length;
    const totalPoints = spcData.dataPoints.length;
    const outOfControlRatio = outOfControlPoints / totalPoints;
    
    if (outOfControlRatio === 0) return 'status-excellent';
    if (outOfControlRatio < 0.05) return 'status-good';
    if (outOfControlRatio < 0.1) return 'status-warning';
    return 'status-critical';
  };

  const getCapabilityStatus = (cpk: number) => {
    if (cpk >= 1.33) return { status: 'excellent', label: 'Excellent' };
    if (cpk >= 1.0) return { status: 'good', label: 'Acceptable' };
    if (cpk >= 0.67) return { status: 'warning', label: 'Marginal' };
    return { status: 'critical', label: 'Poor' };
  };

  const capabilityStatus = getCapabilityStatus(spcData.statistics.cpk);

  return (
    <Card className={cn("bg-gradient-card border-border/50", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            SPC Control Chart - Parameter {spcData.parameterId}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={cn(
                "border-none",
                `bg-${getStatusColor()}`,
                "text-primary-foreground"
              )}
            >
              In Control
            </Badge>
            <Badge 
              variant="outline"
              className={cn(
                "border-none",
                `bg-status-${capabilityStatus.status}`,
                "text-primary-foreground"
              )}
            >
              Cpk: {spcData.statistics.cpk.toFixed(2)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Control Statistics */}
          <div className="grid grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Mean</p>
              <p className="text-sm font-semibold">{spcData.statistics.mean.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Std Dev</p>
              <p className="text-sm font-semibold">{spcData.statistics.standardDeviation.toFixed(3)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Cp</p>
              <p className="text-sm font-semibold">{spcData.statistics.cp.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Cpk</p>
              <p className="text-sm font-semibold text-status-excellent">{spcData.statistics.cpk.toFixed(2)}</p>
            </div>
          </div>

          {/* SPC Chart */}
          <div style={{ height }}>
            <ReactECharts option={chartOption} style={{ height: '100%' }} />
          </div>

          {/* Violations Summary */}
          {spcData.dataPoints.some(p => p.isOutOfControl) && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium text-destructive">Control Violations Detected</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {spcData.dataPoints.filter(p => p.isOutOfControl).length} out of {spcData.dataPoints.length} points are out of control
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};