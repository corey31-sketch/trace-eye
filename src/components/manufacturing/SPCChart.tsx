import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SPCChart, SPCDataPoint } from "@/types/manufacturing";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Scatter, ScatterChart } from "recharts";
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
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="time" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                
                {/* Control Limits */}
                <ReferenceLine 
                  y={spcData.controlLimits.upperControl} 
                  stroke="hsl(var(--status-critical))" 
                  strokeDasharray="5 5"
                  label={{ value: "UCL", position: "insideTopRight" }}
                />
                <ReferenceLine 
                  y={spcData.controlLimits.lowerControl} 
                  stroke="hsl(var(--status-critical))" 
                  strokeDasharray="5 5"
                  label={{ value: "LCL", position: "insideBottomRight" }}
                />
                <ReferenceLine 
                  y={spcData.controlLimits.target} 
                  stroke="hsl(var(--primary))" 
                  strokeDasharray="2 2"
                  label={{ value: "Target", position: "insideTopRight" }}
                />
                
                {/* Specification Limits */}
                <ReferenceLine 
                  y={spcData.controlLimits.upperSpec} 
                  stroke="hsl(var(--status-warning))" 
                  strokeWidth={2}
                  label={{ value: "USL", position: "insideTopRight" }}
                />
                <ReferenceLine 
                  y={spcData.controlLimits.lowerSpec} 
                  stroke="hsl(var(--status-warning))" 
                  strokeWidth={2}
                  label={{ value: "LSL", position: "insideBottomRight" }}
                />
                
                {/* Data Line */}
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
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