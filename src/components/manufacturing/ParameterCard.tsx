import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Activity, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ParameterStats } from "@/types/manufacturing";

interface ParameterCardProps {
  name: string;
  parameter: ParameterStats;
  className?: string;
}

export const ParameterCard = ({ name, parameter, className }: ParameterCardProps) => {
  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s === "stable") return "status-excellent";
    if (s === "warning") return "status-warning";
    if (s === "critical") return "status-critical";
    return "muted";
  };

  const [lcl, ucl] = parameter.controlLimits;
  const [lsl, usl] = parameter.specLimits;
  const hasSpecLimits = lsl != null && usl != null;

  // Calculate position within spec limits for progress bar
  const range = hasSpecLimits ? usl! - lsl! : ucl - lcl;
  const base = hasSpecLimits ? lsl! : lcl;
  const position = ((parameter.mean - base) / range) * 100;

  return (
    <Card className={cn("bg-gradient-card border-border/50", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-foreground">{name}</CardTitle>
          <Badge
            variant="outline"
            className={cn("text-xs border-none", `bg-${getStatusColor(parameter.status)}`, "text-primary-foreground")}
          >
            {parameter.status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Value */}
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground mb-1">
            {parameter.mean.toFixed(2)}
          </div>
          <div className="text-xs text-muted-foreground">Mean (σ = {parameter.stdDev.toFixed(2)})</div>
        </div>

        {/* Value Range Visualization */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{hasSpecLimits ? `LSL: ${lsl}` : `LCL: ${lcl.toFixed(1)}`}</span>
            <span>Mean: {parameter.mean.toFixed(1)}</span>
            <span>{hasSpecLimits ? `USL: ${usl}` : `UCL: ${ucl.toFixed(1)}`}</span>
          </div>
          <div className="relative">
            <Progress value={Math.max(0, Math.min(100, position))} className="h-2" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="space-y-1">
            <div className="text-muted-foreground">Control Limits</div>
            <div className="font-medium">{lcl.toFixed(2)} – {ucl.toFixed(2)}</div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">Spec Limits</div>
            <div className="font-medium">
              {lsl != null ? lsl.toFixed(2) : "—"} – {usl != null ? usl.toFixed(2) : "—"}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">Cpk</div>
            <div className={cn("font-medium",
              parameter.cpk != null && parameter.cpk >= 1.33 ? "text-status-excellent" :
              parameter.cpk != null && parameter.cpk >= 1.0 ? "text-status-good" : "text-status-warning"
            )}>
              {parameter.cpk != null ? parameter.cpk.toFixed(2) : "N/A"}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">Outliers</div>
            <div className="font-medium">{parameter.outlierCount} / {parameter.count}</div>
          </div>
        </div>

        {/* Anomaly indicator */}
        {parameter.anomalyWindows.length > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t border-border/30">
            <AlertTriangle className="h-3.5 w-3.5 text-status-warning" />
            <span className="text-xs text-status-warning">
              {parameter.anomalyWindows.length} anomaly window(s) detected
            </span>
          </div>
        )}

        {/* TTL indicator */}
        {parameter.ttlHours != null && parameter.ttlHours < 24 && (
          <div className="flex items-center gap-2 pt-2 border-t border-border/30">
            <AlertTriangle className="h-3.5 w-3.5 text-status-critical" />
            <span className="text-xs text-status-critical">
              Est. {parameter.ttlHours.toFixed(0)}h to spec breach
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
