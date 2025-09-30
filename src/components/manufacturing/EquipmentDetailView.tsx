import { useState } from "react";
import { Equipment, SPCChart, ProcessParameter } from "@/types/manufacturing";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SPCChartComponent } from "./SPCChart";
import { ParameterCard } from "./ParameterCard";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { TrendingUp, Clock, Activity, AlertTriangle, BarChart3, Download, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface EquipmentDetailViewProps {
  equipment: Equipment | null;
  isOpen: boolean;
  onClose: () => void;
}

// Mock SPC data for demonstration
const generateMockSPCData = (parameterId: string, equipmentId: string): SPCChart => {
  const dataPoints = Array.from({ length: 50 }, (_, i) => {
    const baseValue = 50 + Math.sin(i * 0.1) * 5;
    const noise = (Math.random() - 0.5) * 8;
    const value = baseValue + noise;
    const isOutOfControl = Math.random() < 0.05; // 5% chance of out-of-control points
    
    return {
      timestamp: new Date(Date.now() - (49 - i) * 60000), // Last 50 minutes
      value,
      isOutOfControl,
      violationType: isOutOfControl ? (['mean', 'range', 'trend', 'pattern'][Math.floor(Math.random() * 4)] as any) : undefined
    };
  });

  return {
    parameterId,
    equipmentId,
    dataPoints,
    controlLimits: {
      upperControl: 58,
      lowerControl: 42,
      upperSpec: 65,
      lowerSpec: 35,
      target: 50
    },
    statistics: {
      mean: 50.2,
      standardDeviation: 2.8,
      cpk: 1.45,
      cp: 1.78
    }
  };
};

// Mock historical trend data
const generateTrendData = () => {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    fpy: 95 + Math.random() * 4,
    cycleTime: 45 + Math.random() * 10,
    throughput: 80 + Math.random() * 20,
    anomalyScore: Math.random() * 30
  }));
};

export const EquipmentDetailView = ({ equipment, isOpen, onClose }: EquipmentDetailViewProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  
  if (!equipment) return null;

  const spcData = equipment.parameters.map(param => 
    generateMockSPCData(param.id, equipment.id)
  );
  
  const trendData = generateTrendData();

  const exportData = () => {
    // Implementation for data export
    console.log("Exporting data for", equipment.name);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              {equipment.name} - Detailed Analysis
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline"
                className={cn(
                  "border-none",
                  equipment.status === 'excellent' ? 'bg-status-excellent' :
                  equipment.status === 'good' ? 'bg-status-good' :
                  equipment.status === 'warning' ? 'bg-status-warning' :
                  equipment.status === 'critical' ? 'bg-status-critical' : 'bg-status-offline',
                  "text-primary-foreground"
                )}
              >
                {equipment.status.toUpperCase()}
              </Badge>
              <Button variant="outline" size="sm" onClick={exportData}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="parameters">Parameters</TabsTrigger>
            <TabsTrigger value="spc">SPC Analysis</TabsTrigger>
            <TabsTrigger value="trends">Historical Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
              <Card className="bg-gradient-card border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    First Pass Yield
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {equipment.kpis.fpy.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">Target: 98%</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Total Units
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {equipment.kpis.totalUnits.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">Last 24h</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Cycle Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {equipment.kpis.avgCycleTime.toFixed(1)}s
                  </div>
                  <p className="text-xs text-muted-foreground">Target: 45s</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Anomaly Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={cn(
                    "text-2xl font-bold",
                    equipment.kpis.anomalyScore > 70 ? "text-status-critical" :
                    equipment.kpis.anomalyScore > 40 ? "text-status-warning" :
                    "text-status-excellent"
                  )}>
                    {equipment.kpis.anomalyScore.toFixed(0)}
                  </div>
                  <p className="text-xs text-muted-foreground">0-100 scale</p>
                </CardContent>
              </Card>
            </div>

            {/* Real-time Trends */}
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  24-Hour Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="fpy" 
                        stroke="hsl(var(--primary))" 
                        fill="hsl(var(--primary))" 
                        fillOpacity={0.3} 
                        name="FPY (%)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="parameters" className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {equipment.parameters.map(parameter => (
                <ParameterCard key={parameter.id} parameter={parameter} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="spc" className="space-y-6">
            {spcData.map(spc => (
              <SPCChartComponent key={spc.parameterId} spcData={spc} height={350} />
            ))}
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {/* Cycle Time Trend */}
              <Card className="bg-gradient-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Cycle Time Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div style={{ height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="cycleTime" 
                          stroke="hsl(var(--status-good))" 
                          strokeWidth={2}
                          name="Cycle Time (s)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Throughput Trend */}
              <Card className="bg-gradient-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Throughput Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div style={{ height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="throughput" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          name="Throughput (units/h)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};