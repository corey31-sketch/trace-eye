import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Equipment, ParallelEquipmentGroup } from "@/types/manufacturing";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Activity, Clock, AlertTriangle, TrendingUp, Users } from "lucide-react";

interface ParallelEquipmentGroupCardProps {
  group: ParallelEquipmentGroup;
  onClick?: () => void;
  className?: string;
}

export const ParallelEquipmentGroupCard = ({ 
  group, 
  onClick, 
  className 
}: ParallelEquipmentGroupCardProps) => {
  
  const getOverallStatus = () => {
    const statuses = group.equipment.map(eq => eq.status);
    if (statuses.includes('critical')) return 'critical';
    if (statuses.includes('warning')) return 'warning';
    if (statuses.includes('offline')) return 'offline';
    if (statuses.some(s => s === 'good')) return 'good';
    return 'excellent';
  };

  const overallStatus = getOverallStatus();
  
  const statusConfig = {
    excellent: { 
      color: 'bg-status-excellent', 
      label: 'All Optimal',
      gradient: 'bg-gradient-status-excellent'
    },
    good: { 
      color: 'bg-status-good', 
      label: 'Operating Well',
      gradient: 'bg-gradient-status-excellent'
    },
    warning: { 
      color: 'bg-status-warning', 
      label: 'Attention Needed',
      gradient: 'bg-gradient-status-warning'
    },
    critical: { 
      color: 'bg-status-critical', 
      label: 'Critical Issues',
      gradient: 'bg-gradient-status-warning'
    },
    offline: { 
      color: 'bg-status-offline', 
      label: 'Some Offline',
      gradient: 'bg-muted'
    },
  };

  const status = statusConfig[overallStatus];
  
  const formatCycleTime = (seconds: number) => {
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    if (seconds < 3600) return `${(seconds / 60).toFixed(1)}m`;
    return `${(seconds / 3600).toFixed(1)}h`;
  };

  const activeEquipment = group.equipment.filter(eq => eq.status !== 'offline').length;
  const utilizationRate = (activeEquipment / group.equipment.length) * 100;

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
          <CardTitle className="text-lg font-semibold text-foreground">
            {group.name}
          </CardTitle>
          <Badge 
            className={cn(
              "text-xs font-medium border-none",
              status.gradient,
              overallStatus === 'offline' ? 'text-muted-foreground' : 'text-primary-foreground'
            )}
          >
            {status.label}
          </Badge>
        </div>
        
        {/* Parallel Equipment Indicator */}
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <span className="text-sm text-muted-foreground">
            {activeEquipment}/{group.equipment.length} units active
          </span>
          <div className="flex-1">
            <Progress value={utilizationRate} className="h-1" />
          </div>
          <span className="text-xs text-muted-foreground">
            {utilizationRate.toFixed(0)}%
          </span>
        </div>
        
        <div className={cn("h-1 w-full rounded-full", status.color)} />
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Combined KPI Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Combined FPY */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Combined FPY</span>
            </div>
            <p className="text-xl font-bold text-foreground">
              {group.combinedKpis.totalFpy.toFixed(1)}%
            </p>
          </div>

          {/* Total Units */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Total Units</span>
            </div>
            <p className="text-xl font-bold text-foreground">
              {group.combinedKpis.totalUnits.toLocaleString()}
            </p>
          </div>

          {/* Average Cycle Time */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Avg Cycle</span>
            </div>
            <p className="text-xl font-bold text-foreground">
              {formatCycleTime(group.combinedKpis.avgCycleTime)}
            </p>
          </div>

          {/* Max Anomaly Score */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Max Anomaly</span>
            </div>
            <p className={cn(
              "text-xl font-bold",
              group.combinedKpis.maxAnomalyScore > 70 ? "text-status-critical" :
              group.combinedKpis.maxAnomalyScore > 40 ? "text-status-warning" :
              "text-status-excellent"
            )}>
              {group.combinedKpis.maxAnomalyScore.toFixed(0)}
            </p>
          </div>
        </div>

        {/* Individual Equipment Status */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground font-medium">Individual Units:</div>
          <div className="grid grid-cols-2 gap-2">
            {group.equipment.map((equipment, index) => (
              <div 
                key={equipment.id}
                className="flex items-center gap-2 p-2 bg-muted/20 rounded text-xs"
              >
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  `bg-status-${equipment.status === 'excellent' ? 'excellent' : 
                    equipment.status === 'good' ? 'good' :
                    equipment.status === 'warning' ? 'warning' :
                    equipment.status === 'critical' ? 'critical' : 'offline'}`
                )} />
                <span className="font-medium">Unit {index + 1}</span>
                <span className="text-muted-foreground ml-auto">
                  {equipment.kpis.fpy.toFixed(1)}%
                </span>
              </div>
            ))}
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