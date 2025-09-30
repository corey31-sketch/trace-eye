import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TimeRange, ProductFilter } from "@/types/manufacturing";
import { Clock, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeRangeSelectorProps {
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  productFilter?: ProductFilter;
  onProductFilterChange: (filter?: ProductFilter) => void;
  className?: string;
}

export const TimeRangeSelector = ({ 
  timeRange, 
  onTimeRangeChange, 
  productFilter,
  onProductFilterChange,
  className 
}: TimeRangeSelectorProps) => {
  
  const handleTimeRangeSelect = (value: string) => {
    if (value === 'realtime') {
      onTimeRangeChange({ type: 'realtime' });
    } else {
      onTimeRangeChange({ type: 'predefined', duration: value as '1h' | '4h' | '24h' });
    }
  };

  const clearProductFilter = () => {
    onProductFilterChange(undefined);
  };

  const getTimeRangeLabel = () => {
    if (timeRange.type === 'realtime') return 'Real-time';
    if (timeRange.type === 'predefined') {
      switch (timeRange.duration) {
        case '1h': return 'Last 1 Hour';
        case '4h': return 'Last 4 Hours';
        case '24h': return 'Last 24 Hours';
        default: return 'Select Range';
      }
    }
    if (timeRange.type === 'custom') {
      return `${timeRange.startTime?.toLocaleDateString()} - ${timeRange.endTime?.toLocaleDateString()}`;
    }
    return 'Select Range';
  };

  return (
    <div className={cn("flex items-center gap-4", className)}>
      {/* Time Range Selector */}
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <Select 
          value={timeRange.type === 'realtime' ? 'realtime' : timeRange.duration || ''}
          onValueChange={handleTimeRangeSelect}
        >
          <SelectTrigger className="w-40 bg-card border-border">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="realtime">Real-time</SelectItem>
            <SelectItem value="1h">Last 1 Hour</SelectItem>
            <SelectItem value="4h">Last 4 Hours</SelectItem>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Current Filters Display */}
      <div className="flex items-center gap-2">
        {productFilter && (
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Badge variant="secondary" className="flex items-center gap-1">
              {productFilter.machineId && (
                <span>Machine: {productFilter.machineId}</span>
              )}
              {productFilter.timeSlot && (
                <span>
                  {productFilter.machineId ? ' | ' : ''}
                  Time: {productFilter.timeSlot.start.toLocaleTimeString()} - {productFilter.timeSlot.end.toLocaleTimeString()}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                onClick={clearProductFilter}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          </div>
        )}
      </div>

      {/* Time Range Display */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Viewing:</span>
        <Badge variant="outline" className="font-medium">
          {getTimeRangeLabel()}
        </Badge>
      </div>
    </div>
  );
};