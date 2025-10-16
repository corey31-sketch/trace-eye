import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Leaf, Settings, BarChart3, ScatterChart, RotateCcw, ZoomIn, ZoomOut, Move, Download } from 'lucide-react';
import ReactECharts from 'echarts-for-react';

interface TreeNode {
  id: string;
  feature?: string;
  threshold?: number;
  samples: number;
  value: any;
  isLeaf: boolean;
  gini?: number;
  prediction?: string | number;
}

interface LeafAnalysisProps {
  leafNode: TreeNode;
  availableFeatures: string[];
  leafData: {
    samples: number[][];
    predictions: number[];
  };
  onClose?: () => void;
  className?: string;
}

interface PlotConfig {
  plotType: '1d' | '2d';
  xAxis: string;
  yAxis?: string;
}

interface AxisLimits {
  xMin: string;
  xMax: string;
  yMin: string;
  yMax: string;
}

export const LeafAnalysis = ({ leafNode, availableFeatures, leafData, onClose, className }: LeafAnalysisProps) => {
  const [plotConfig, setPlotConfig] = useState<PlotConfig>({
    plotType: '2d',
    xAxis: availableFeatures[0] || '',
    yAxis: availableFeatures[1] || '',
  });

  const [axisLimits, setAxisLimits] = useState<AxisLimits>({
    xMin: '',
    xMax: '',
    yMin: '',
    yMax: '',
  });

  const [appliedLimits, setAppliedLimits] = useState<AxisLimits | null>(null);

  const handlePlotTypeChange = (type: '1d' | '2d') => {
    setPlotConfig(prev => ({ ...prev, plotType: type }));
  };

  const handleAxisLimitChange = (key: keyof AxisLimits, value: string) => {
    setAxisLimits(prev => ({ ...prev, [key]: value }));
  };

  const applyAxisLimits = () => {
    setAppliedLimits({ ...axisLimits });
  };

  const resetAxisLimits = () => {
    setAxisLimits({ xMin: '', xMax: '', yMin: '', yMax: '' });
    setAppliedLimits(null);
  };

  const getPlotOption = () => {
    if (plotConfig.plotType === '1d') {
      // 1D histogram
      const xFeatureIdx = availableFeatures.indexOf(plotConfig.xAxis);
      const values = leafData.samples.map(sample => sample[xFeatureIdx]);
      
      // Create histogram bins
      const min = Math.min(...values);
      const max = Math.max(...values);
      const binCount = 20;
      const binWidth = (max - min) / binCount;
      const bins = new Array(binCount).fill(0);
      
      values.forEach(val => {
        const binIdx = Math.min(Math.floor((val - min) / binWidth), binCount - 1);
        bins[binIdx]++;
      });

      return {
        title: {
          text: `Distribution of ${plotConfig.xAxis}`,
          left: 'center',
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        xAxis: {
          name: plotConfig.xAxis,
          nameLocation: 'middle',
          nameGap: 30,
          min: appliedLimits?.xMin ? parseFloat(appliedLimits.xMin) : undefined,
          max: appliedLimits?.xMax ? parseFloat(appliedLimits.xMax) : undefined,
        },
        yAxis: {
          name: 'Frequency',
          nameLocation: 'middle',
          nameGap: 40,
        },
        series: [
          {
            type: 'bar',
            data: bins.map((count, idx) => [min + idx * binWidth, count]),
            itemStyle: {
              color: '#8b5cf6',
            },
          },
        ],
      };
    } else {
      // 2D scatter
      const xFeatureIdx = availableFeatures.indexOf(plotConfig.xAxis);
      const yFeatureIdx = availableFeatures.indexOf(plotConfig.yAxis || availableFeatures[1]);
      
      const scatterData = leafData.samples.map((sample, idx) => [
        sample[xFeatureIdx],
        sample[yFeatureIdx],
        leafData.predictions[idx],
      ]);

      return {
        title: {
          text: `${plotConfig.xAxis} vs ${plotConfig.yAxis}`,
          left: 'center',
        },
        tooltip: {
          trigger: 'item',
          formatter: (params: any) => {
            return `${plotConfig.xAxis}: ${params.value[0].toFixed(2)}<br/>
                    ${plotConfig.yAxis}: ${params.value[1].toFixed(2)}<br/>
                    Prediction: ${params.value[2] === 1 ? 'High' : 'Low'}`;
          },
        },
        toolbox: {
          feature: {
            dataZoom: {},
            restore: {},
            saveAsImage: {},
          },
        },
        xAxis: {
          name: plotConfig.xAxis,
          nameLocation: 'middle',
          nameGap: 30,
          min: appliedLimits?.xMin ? parseFloat(appliedLimits.xMin) : undefined,
          max: appliedLimits?.xMax ? parseFloat(appliedLimits.xMax) : undefined,
        },
        yAxis: {
          name: plotConfig.yAxis,
          nameLocation: 'middle',
          nameGap: 40,
          min: appliedLimits?.yMin ? parseFloat(appliedLimits.yMin) : undefined,
          max: appliedLimits?.yMax ? parseFloat(appliedLimits.yMax) : undefined,
        },
        visualMap: {
          min: 0,
          max: 1,
          dimension: 2,
          orient: 'vertical',
          right: 10,
          top: 'center',
          text: ['High', 'Low'],
          calculable: true,
          inRange: {
            color: ['#3b82f6', '#f59e0b'],
          },
        },
        series: [
          {
            type: 'scatter',
            symbolSize: 8,
            data: scatterData,
          },
        ],
      };
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-success" />
              Leaf Node Analysis
            </CardTitle>
            <CardDescription>
              Detailed visualization of data points in the selected leaf node
            </CardDescription>
          </div>
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Leaf Node Info */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Leaf Node Information</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              Samples: {leafNode?.samples || 0}
            </Badge>
            <Badge variant="secondary">
              Prediction: {leafNode?.prediction?.toString() || leafNode?.value?.toString() || 'N/A'}
            </Badge>
            <Badge variant="secondary">
              Gini: {leafNode?.gini?.toFixed(3) || 'N/A'}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Plot Configuration */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-medium">Plot Configuration</h4>
          </div>

          {/* Plot Type Selection */}
          <div className="space-y-2">
            <Label className="text-sm">Plot Type</Label>
            <div className="flex gap-2">
              <Button
                variant={plotConfig.plotType === '1d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePlotTypeChange('1d')}
                disabled={availableFeatures.length === 0}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                1D Distribution
              </Button>
              <Button
                variant={plotConfig.plotType === '2d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePlotTypeChange('2d')}
                disabled={availableFeatures.length < 2}
              >
                <ScatterChart className="mr-2 h-4 w-4" />
                2D Scatter
              </Button>
            </div>
          </div>

          {/* Axis Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">X-Axis Feature</Label>
              <Select value={plotConfig.xAxis} onValueChange={(value) => 
                setPlotConfig(prev => ({ ...prev, xAxis: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select X-axis feature" />
                </SelectTrigger>
                <SelectContent>
                  {availableFeatures.map((feature) => (
                    <SelectItem key={feature} value={feature}>
                      {feature}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {plotConfig.plotType === '2d' && (
              <div className="space-y-2">
                <Label className="text-sm">Y-Axis Feature</Label>
                <Select value={plotConfig.yAxis || ''} onValueChange={(value) => 
                  setPlotConfig(prev => ({ ...prev, yAxis: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Y-axis feature" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFeatures.filter(f => f !== plotConfig.xAxis).map((feature) => (
                      <SelectItem key={feature} value={feature}>
                        {feature}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Axis Limits */}
          <div className="space-y-3">
            <Label className="text-sm">Axis Limits (Optional)</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">X Min</Label>
                <Input
                  type="number"
                  placeholder="Auto"
                  value={axisLimits.xMin}
                  onChange={(e) => handleAxisLimitChange('xMin', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">X Max</Label>
                <Input
                  type="number"
                  placeholder="Auto"
                  value={axisLimits.xMax}
                  onChange={(e) => handleAxisLimitChange('xMax', e.target.value)}
                />
              </div>
              {plotConfig.plotType === '2d' && (
                <>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Y Min</Label>
                    <Input
                      type="number"
                      placeholder="Auto"
                      value={axisLimits.yMin}
                      onChange={(e) => handleAxisLimitChange('yMin', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Y Max</Label>
                    <Input
                      type="number"
                      placeholder="Auto"
                      value={axisLimits.yMax}
                      onChange={(e) => handleAxisLimitChange('yMax', e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={applyAxisLimits}>
                Apply Limits
              </Button>
              <Button variant="outline" size="sm" onClick={resetAxisLimits}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        {/* Plot Visualization */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Visualization</h4>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Move className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <ReactECharts option={getPlotOption()} style={{ height: '400px' }} />
          
          {/* Plot Controls */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Click and drag to pan the plot</p>
            <p>• Use mouse wheel to zoom in/out</p>
            <p>• Different colors represent different prediction classes</p>
            <p>• Use the toolbar above the plot for additional controls</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
