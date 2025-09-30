import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Equipment } from "@/types/manufacturing";
import { cn } from "@/lib/utils";
import { Activity, Clock, AlertTriangle, TrendingUp, Zap } from "lucide-react";

interface EquipmentCardProps {
  equipment: Equipment;
  onClick?: () => void;
  className?: string;
}

const statusConfig = {
  excellent: { 
    color: 'bg-status-excellent', 
    label: 'Excellent',
    gradient: 'bg-gradient-status-excellent'
  },
  good: { 
    color: 'bg-status-good', 
    label: 'Good',
    gradient: 'bg-gradient-status-excellent'
  },
  warning: { 
    color: 'bg-status-warning', 
    label: 'Warning',
    gradient: 'bg-gradient-status-warning'
  },
  critical: { 
    color: 'bg-status-critical', 
    label: 'Critical',
    gradient: 'bg-gradient-status-warning'
  },
  offline: { 
    color: 'bg-status-offline', 
    label: 'Offline',
    gradient: 'bg-muted'
  },
};

export const EquipmentCard = ({ equipment, onClick, className }: EquipmentCardProps) => {
  const status = statusConfig[equipment.status];
  
  const formatCycleTime = (seconds: number) => {
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    if (seconds < 3600) return `${(seconds / 60).toFixed(1)}m`;
    return `${(seconds / 3600).toFixed(1)}h`;
  };

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
            {equipment.name}
          </CardTitle>
          <Badge 
            className={cn(
              "text-xs font-medium border-none",
              status.gradient,
              equipment.status === 'offline' ? 'text-muted-foreground' : 'text-primary-foreground'
            )}
          >
            {status.label}
          </Badge>
        </div>
        <div className={cn("h-1 w-full rounded-full", status.color)} />
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* FPY */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">FPY</span>
            </div>
            <p className="text-xl font-bold text-foreground">
              {equipment.kpis.fpy.toFixed(1)}%
            </p>
          </div>

          {/* Total Units */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Units</span>
            </div>
            <p className="text-xl font-bold text-foreground">
              {equipment.kpis.totalUnits.toLocaleString()}
            </p>
          </div>

          {/* Cycle Time */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Cycle</span>
            </div>
            <p className="text-xl font-bold text-foreground">
              {formatCycleTime(equipment.kpis.avgCycleTime)}
            </p>
          </div>

          {/* Anomaly Score */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Anomaly</span>
            </div>
            <p className={cn(
              "text-xl font-bold",
              equipment.kpis.anomalyScore > 70 ? "text-status-critical" :
              equipment.kpis.anomalyScore > 40 ? "text-status-warning" :
              "text-status-excellent"
            )}>
              {equipment.kpis.anomalyScore.toFixed(0)}
            </p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 pt-2 border-t border-border/30">
          <div className={cn("w-2 h-2 rounded-full", status.color)} />
          <span className="text-xs text-muted-foreground">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};