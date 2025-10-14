import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DateTimeRangeSelectorProps {
  className?: string;
}

export const DateTimeRangeSelector = ({ className }: DateTimeRangeSelectorProps) => {
  const [rangeType, setRangeType] = useState<"1h" | "5h" | "custom">("1h");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const getDisplayText = () => {
    if (rangeType === "1h") return "Last 1 Hour";
    if (rangeType === "5h") return "Last 5 Hours";
    if (startDate && endDate) {
      return `${format(startDate, "PPP")} - ${format(endDate, "PPP")}`;
    }
    return "Select Date Range";
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Clock className="h-4 w-4 text-muted-foreground" />
      
      <Select 
        value={rangeType} 
        onValueChange={(value) => setRangeType(value as "1h" | "5h" | "custom")}
      >
        <SelectTrigger className="w-32 bg-card border-border">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1h">Last 1h</SelectItem>
          <SelectItem value="5h">Last 5h</SelectItem>
          <SelectItem value="custom">Custom</SelectItem>
        </SelectContent>
      </Select>

      {rangeType === "custom" && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[280px] justify-start text-left font-normal",
                !startDate && !endDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {getDisplayText()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3 space-y-3">
              <div>
                <p className="text-sm font-medium mb-2">Start Date</p>
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  className={cn("pointer-events-auto")}
                />
              </div>
              <div>
                <p className="text-sm font-medium mb-2">End Date</p>
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  disabled={(date) => startDate ? date < startDate : false}
                  className={cn("pointer-events-auto")}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};
