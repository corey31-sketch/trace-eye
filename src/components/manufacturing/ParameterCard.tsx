import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProcessParameter } from "@/types/manufacturing";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Activity, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ParameterCardProps {
  parameter: ProcessParameter;
  className?: string;
}

export const ParameterCard = ({ parameter, className }: ParameterCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'status-excellent';
      case 'warning': return 'status-warning';
      case 'out_of_control': return 'status-critical';
      default: return 'muted';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-3 w-3" />;
      case 'decreasing': return <TrendingDown className="h-3 w-3" />;
      case 'volatile': return <AlertTriangle className="h-3 w-3" />;
      default: return <Activity className="h-3 w-3" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'text-status-good';
      case 'decreasing': return 'text-status-warning';
      case 'volatile': return 'text-status-critical';
      default: return 'text-muted-foreground';
    }
  };

  // Calculate position within control limits for progress bar
  const range = parameter.upperLimit - parameter.lowerLimit;
  const position = ((parameter.currentValue - parameter.lowerLimit) / range) * 100;
  const targetPosition = ((parameter.targetValue - parameter.lowerLimit) / range) * 100;

  return (
    <Card className={cn("bg-gradient-card border-border/50", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-foreground">
            {parameter.name}
          </CardTitle>
          <Badge 
            variant="outline"
            className={cn(
              "text-xs border-none",
              `bg-${getStatusColor(parameter.status)}`,
              "text-primary-foreground"
            )}
          >
            {parameter.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Value */}
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground mb-1">
            {parameter.currentValue.toFixed(2)}
          </div>
          <div className="text-xs text-muted-foreground">
            {parameter.unit}
          </div>
        </div>

        {/* Value Range Visualization */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{parameter.lowerLimit}</span>
            <span>Target: {parameter.targetValue}</span>
            <span>{parameter.upperLimit}</span>
          </div>
          
          <div className="relative">
            <Progress 
              value={Math.max(0, Math.min(100, position))} 
              className="h-2"
            />
            {/* Target line */}
            <div 
              className="absolute top-0 h-2 w-0.5 bg-primary"
              style={{ left: `${targetPosition}%` }}
            />
            {/* Control limits indicators */}
            <div className="flex justify-between mt-1">
              <div className="text-xs text-status-critical">LCL</div>
              <div className="text-xs text-status-critical">UCL</div>
            </div>
          </div>
        </div>

        {/* Limits Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="space-y-1">
            <div className="text-muted-foreground">Control Limits</div>
            <div className="font-medium">
              {parameter.lowerControlLimit.toFixed(2)} - {parameter.upperControlLimit.toFixed(2)}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">Spec Limits</div>
            <div className="font-medium">
              {parameter.lowerLimit.toFixed(2)} - {parameter.upperLimit.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Trend Indicator */}
        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          <div className="flex items-center gap-2">
            <div className={cn("flex items-center gap-1", getTrendColor(parameter.trend))}>
              {getTrendIcon(parameter.trend)}
              <span className="text-xs font-medium capitalize">
                {parameter.trend}
              </span>
            </div>
          </div>
          
          {/* Status Indicator */}
          <div className={cn("w-2 h-2 rounded-full", `bg-${getStatusColor(parameter.status)}`)} />
        </div>
      </CardContent>
    </Card>
  );
};