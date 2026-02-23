import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StationStats } from "@/types/manufacturing";
import { cn } from "@/lib/utils";
import { Activity, AlertTriangle, TrendingUp, Gauge } from "lucide-react";
import { getStatusColor, stationDisplayNames } from "@/data/mockManufacturingData";

interface StationCardProps {
  station: StationStats;
  onClick?: () => void;
  className?: string;
}

export const EquipmentCard = ({ station, onClick, className }: StationCardProps) => {
  const paramEntries = Object.entries(station.parameters);
  const totalAnomalies = paramEntries.reduce((sum, [, p]) => sum + p.anomalyWindows.length, 0);
  const avgCpk = (() => {
    const cpks = paramEntries.filter(([, p]) => p.cpk != null).map(([, p]) => p.cpk!);
    return cpks.length > 0 ? cpks.reduce((a, b) => a + b, 0) / cpks.length : null;
  })();
  const totalOutliers = paramEntries.reduce((sum, [, p]) => sum + p.outlierCount, 0);
  const statusColor = getStatusColor(station.status);
  const displayName = stationDisplayNames[station.stationId] || station.stationId;

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-glow",
        "bg-gradient-card border-border/50 shadow-equipment",
        "min-w-[280px] max-w-[320px]",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">
            {displayName}
          </CardTitle>
          <Badge
            className={cn(
              "text-xs font-medium border-none",
              `bg-${statusColor}`,
              "text-primary-foreground"
            )}
          >
            {station.status}
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground">{station.stationId}</div>
        <div className={cn("h-1 w-full rounded-full", `bg-${statusColor}`)} />
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {/* Parameters count */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Params</span>
            </div>
            <p className="text-xl font-bold text-foreground">{paramEntries.length}</p>
          </div>

          {/* Avg Cpk */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Avg Cpk</span>
            </div>
            <p className={cn(
              "text-xl font-bold",
              avgCpk != null && avgCpk >= 1.33 ? "text-status-excellent" :
              avgCpk != null && avgCpk >= 1.0 ? "text-status-good" :
              "text-status-warning"
            )}>
              {avgCpk != null ? avgCpk.toFixed(2) : "N/A"}
            </p>
          </div>

          {/* Anomalies */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Anomalies</span>
            </div>
            <p className={cn(
              "text-xl font-bold",
              totalAnomalies > 0 ? "text-status-warning" : "text-status-excellent"
            )}>
              {totalAnomalies}
            </p>
          </div>

          {/* Outliers */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Outliers</span>
            </div>
            <p className="text-xl font-bold text-foreground">{totalOutliers}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-border/30">
          <div className={cn("w-2 h-2 rounded-full", `bg-${statusColor}`)} />
          <span className="text-xs text-muted-foreground">
            {paramEntries.length} parameters monitored
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
