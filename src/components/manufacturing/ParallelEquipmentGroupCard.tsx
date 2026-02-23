import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Activity, AlertTriangle, Gauge, Users } from "lucide-react";
import { StationStats } from "@/types/manufacturing";
import { getStatusColor, stationDisplayNames } from "@/data/mockManufacturingData";

interface ParallelGroupCardProps {
  groupName: string;
  stations: StationStats[];
  onClick?: () => void;
  className?: string;
}

export const ParallelEquipmentGroupCard = ({
  groupName,
  stations,
  onClick,
  className,
}: ParallelGroupCardProps) => {
  const worstStatus = stations.reduce((worst, s) => {
    const order = ["Stable", "Active", "Warning", "Critical", "Offline"];
    return order.indexOf(s.status) > order.indexOf(worst) ? s.status : worst;
  }, "Stable");

  const statusColor = getStatusColor(worstStatus);
  const totalParams = stations.reduce((sum, s) => sum + Object.keys(s.parameters).length, 0);
  const totalAnomalies = stations.reduce(
    (sum, s) => sum + Object.values(s.parameters).reduce((a, p) => a + p.anomalyWindows.length, 0), 0
  );
  const avgCpk = (() => {
    const cpks = stations.flatMap(s =>
      Object.values(s.parameters).filter(p => p.cpk != null).map(p => p.cpk!)
    );
    return cpks.length > 0 ? cpks.reduce((a, b) => a + b, 0) / cpks.length : null;
  })();

  const activeCount = stations.filter(s => s.status.toLowerCase() !== "offline").length;
  const utilizationRate = (activeCount / stations.length) * 100;

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-glow",
        "bg-gradient-card border-border/50 shadow-equipment",
        "min-w-[320px] max-w-[360px]",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">{groupName}</CardTitle>
          <Badge className={cn("text-xs font-medium border-none", `bg-${statusColor}`, "text-primary-foreground")}>
            {worstStatus}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <span className="text-sm text-muted-foreground">
            {activeCount}/{stations.length} units active
          </span>
          <div className="flex-1">
            <Progress value={utilizationRate} className="h-1" />
          </div>
          <span className="text-xs text-muted-foreground">{utilizationRate.toFixed(0)}%</span>
        </div>
        <div className={cn("h-1 w-full rounded-full", `bg-${statusColor}`)} />
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Total Params</span>
            </div>
            <p className="text-xl font-bold text-foreground">{totalParams}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Avg Cpk</span>
            </div>
            <p className={cn(
              "text-xl font-bold",
              avgCpk != null && avgCpk >= 1.33 ? "text-status-excellent" :
              avgCpk != null && avgCpk >= 1.0 ? "text-status-good" : "text-status-warning"
            )}>
              {avgCpk != null ? avgCpk.toFixed(2) : "N/A"}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Anomalies</span>
            </div>
            <p className={cn("text-xl font-bold", totalAnomalies > 0 ? "text-status-warning" : "text-status-excellent")}>
              {totalAnomalies}
            </p>
          </div>
        </div>

        {/* Individual station status */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground font-medium">Individual Units:</div>
          <div className="grid grid-cols-2 gap-2">
            {stations.map((s) => (
              <div key={s.stationId} className="flex items-center gap-2 p-2 bg-muted/20 rounded text-xs">
                <div className={cn("w-2 h-2 rounded-full", `bg-${getStatusColor(s.status)}`)} />
                <span className="font-medium">{stationDisplayNames[s.stationId] || s.stationId}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-border/30">
          <div className={cn("w-2 h-2 rounded-full", `bg-${statusColor}`)} />
          <span className="text-xs text-muted-foreground">
            {stations.length} parallel units
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
