import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { mockEquipment } from '@/data/mockManufacturingData';
import { Equipment, ProcessParameter } from '@/types/manufacturing';
import ReactECharts from 'echarts-for-react';
import { DecisionTreeClassifier } from 'ml-cart';
import { toast } from 'sonner';

interface TreeNode {
  feature?: number;
  threshold?: number;
  left?: TreeNode;
  right?: TreeNode;
  prediction?: number;
  samples?: number;
  path?: string;
}

interface EdgeData {
  feature: string;
  threshold: number;
  samples: number[];
  predictions: number[];
  inputData: number[][];
}

const MLDecisionTree = () => {
  const navigate = useNavigate();
  const [targetStation, setTargetStation] = useState<Equipment | null>(null);
  const [selectedTargetParams, setSelectedTargetParams] = useState<string[]>([]);
  const [inputStation, setInputStation] = useState<Equipment | null>(null);
  const [selectedInputParams, setSelectedInputParams] = useState<string[]>([]);
  const [trainedModel, setTrainedModel] = useState<any>(null);
  const [treeData, setTreeData] = useState<any>(null);
  const [selectedEdge, setSelectedEdge] = useState<EdgeData | null>(null);

  const handleTargetStationChange = (stationId: string) => {
    const station = mockEquipment.find(s => s.id === stationId);
    setTargetStation(station || null);
    setSelectedTargetParams([]);
  };

  const handleInputStationChange = (stationId: string) => {
    const station = mockEquipment.find(s => s.id === stationId);
    setInputStation(station || null);
    setSelectedInputParams([]);
  };

  const handleTargetParamToggle = (paramId: string) => {
    setSelectedTargetParams(prev =>
      prev.includes(paramId) ? prev.filter(p => p !== paramId) : [...prev, paramId]
    );
  };

  const handleInputParamToggle = (paramId: string) => {
    setSelectedInputParams(prev =>
      prev.includes(paramId) ? prev.filter(p => p !== paramId) : [...prev, paramId]
    );
  };

  const generateMockData = (inputParams: ProcessParameter[], targetParams: ProcessParameter[], samples: number = 100) => {
    const X: number[][] = [];
    const y: number[] = [];

    for (let i = 0; i < samples; i++) {
      const inputRow: number[] = [];
      inputParams.forEach(param => {
        const value = param.lowerLimit + Math.random() * (param.upperLimit - param.lowerLimit);
        inputRow.push(value);
      });
      X.push(inputRow);

      // Generate target based on some logic
      const targetValue = targetParams[0].lowerLimit + Math.random() * (targetParams[0].upperLimit - targetParams[0].lowerLimit);
      y.push(targetValue > targetParams[0].targetValue ? 1 : 0);
    }

    return { X, y };
  };

  const trainModel = () => {
    if (!targetStation || !inputStation || selectedTargetParams.length === 0 || selectedInputParams.length === 0) {
      toast.error('Please select all required parameters');
      return;
    }

    const inputParams = inputStation.parameters.filter(p => selectedInputParams.includes(p.id));
    const targetParams = targetStation.parameters.filter(p => selectedTargetParams.includes(p.id));

    const { X, y } = generateMockData(inputParams, targetParams);

    try {
      const classifier = new DecisionTreeClassifier({
        maxDepth: 4,
        minNumSamples: 5,
      });

      classifier.train(X, y);
      setTrainedModel(classifier);

      const tree = buildTreeVisualization(classifier.root, inputParams);
      setTreeData(tree);
      toast.success('Model trained successfully!');
    } catch (error) {
      toast.error('Error training model');
      console.error(error);
    }
  };

  const buildTreeVisualization = (node: any, inputParams: ProcessParameter[], path: string = 'root'): any => {
    if (!node) return null;

    const nodeName = node.splitFeature !== undefined
      ? `${inputParams[node.splitFeature]?.name}\n≤ ${node.splitValue?.toFixed(2)}`
      : `Class: ${node.prediction}`;

    const children = [];
    if (node.left) {
      children.push(buildTreeVisualization(node.left, inputParams, `${path}-left`));
    }
    if (node.right) {
      children.push(buildTreeVisualization(node.right, inputParams, `${path}-right`));
    }

    return {
      name: nodeName,
      value: node.numSamples || 1,
      path,
      feature: node.splitFeature,
      threshold: node.splitValue,
      prediction: node.prediction,
      children: children.length > 0 ? children : undefined,
    };
  };

  const handleNodeClick = (params: any) => {
    if (!trainedModel || !inputStation || !targetStation) return;

    const nodeData = params.data;
    if (nodeData.feature === undefined) return;

    const inputParams = inputStation.parameters.filter(p => selectedInputParams.includes(p.id));
    const targetParams = targetStation.parameters.filter(p => selectedTargetParams.includes(p.id));
    const { X, y } = generateMockData(inputParams, targetParams, 200);

    const filteredIndices: number[] = [];
    X.forEach((sample, idx) => {
      if (sample[nodeData.feature] <= nodeData.threshold) {
        filteredIndices.push(idx);
      }
    });

    const edgeData: EdgeData = {
      feature: inputParams[nodeData.feature].name,
      threshold: nodeData.threshold,
      samples: filteredIndices,
      predictions: filteredIndices.map(idx => y[idx]),
      inputData: X,
    };

    setSelectedEdge(edgeData);
  };

  const getTreeOption = () => {
    if (!treeData) return {};

    return {
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove',
      },
      series: [
        {
          type: 'tree',
          data: [treeData],
          top: '5%',
          left: '10%',
          bottom: '5%',
          right: '20%',
          symbolSize: 12,
          label: {
            position: 'top',
            verticalAlign: 'middle',
            align: 'center',
            fontSize: 11,
          },
          leaves: {
            label: {
              position: 'bottom',
              verticalAlign: 'middle',
              align: 'center',
            },
          },
          emphasis: {
            focus: 'descendant',
          },
          expandAndCollapse: true,
          animationDuration: 550,
          animationDurationUpdate: 750,
        },
      ],
    };
  };

  const getScatterOption = () => {
    if (!selectedEdge || !inputStation) return {};

    const inputParams = inputStation.parameters.filter(p => selectedInputParams.includes(p.id));
    const feature1Idx = 0;
    const feature2Idx = Math.min(1, inputParams.length - 1);

    const scatterData = selectedEdge.samples.map(idx => {
      const sample = selectedEdge.inputData[idx];
      return [
        sample[feature1Idx],
        sample[feature2Idx],
        selectedEdge.predictions[idx],
      ];
    });

    return {
      title: {
        text: `${selectedEdge.feature} ≤ ${selectedEdge.threshold.toFixed(2)}`,
        left: 'center',
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          return `${inputParams[feature1Idx].name}: ${params.value[0].toFixed(2)}<br/>
                  ${inputParams[feature2Idx].name}: ${params.value[1].toFixed(2)}<br/>
                  Prediction: ${params.value[2] === 1 ? 'High' : 'Low'}`;
        },
      },
      xAxis: {
        name: inputParams[feature1Idx]?.name || 'Feature 1',
        nameLocation: 'middle',
        nameGap: 30,
      },
      yAxis: {
        name: inputParams[feature2Idx]?.name || 'Feature 2',
        nameLocation: 'middle',
        nameGap: 40,
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
          color: ['#50a3ba', '#eac736'],
        },
      },
      series: [
        {
          type: 'scatter',
          symbolSize: 10,
          data: scatterData,
        },
      ],
    };
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <GitBranch className="h-8 w-8" />
              ML Decision Tree Analysis
            </h1>
            <p className="text-muted-foreground">Train decision tree models to analyze station relationships</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Target Station Configuration</CardTitle>
              <CardDescription>Select the output station and parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Target Station</Label>
                <Select onValueChange={handleTargetStationChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target station" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockEquipment.map(station => (
                      <SelectItem key={station.id} value={station.id}>
                        {station.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {targetStation && (
                <div className="space-y-2">
                  <Label>Target Parameters</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                    {targetStation.parameters.map(param => (
                      <div key={param.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`target-${param.id}`}
                          checked={selectedTargetParams.includes(param.id)}
                          onCheckedChange={() => handleTargetParamToggle(param.id)}
                        />
                        <Label htmlFor={`target-${param.id}`} className="cursor-pointer">
                          {param.name} ({param.unit})
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Input Station Configuration</CardTitle>
              <CardDescription>Select the input station and parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Input Station</Label>
                <Select onValueChange={handleInputStationChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select input station" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockEquipment.map(station => (
                      <SelectItem key={station.id} value={station.id}>
                        {station.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {inputStation && (
                <div className="space-y-2">
                  <Label>Input Parameters</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                    {inputStation.parameters.map(param => (
                      <div key={param.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`input-${param.id}`}
                          checked={selectedInputParams.includes(param.id)}
                          onCheckedChange={() => handleInputParamToggle(param.id)}
                        />
                        <Label htmlFor={`input-${param.id}`} className="cursor-pointer">
                          {param.name} ({param.unit})
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Button onClick={trainModel} className="w-full" size="lg">
              <Play className="mr-2 h-4 w-4" />
              Train Decision Tree Model
            </Button>
          </CardContent>
        </Card>

        {treeData && (
          <Card>
            <CardHeader>
              <CardTitle>Decision Tree Visualization</CardTitle>
              <CardDescription>Click on any node to view detailed analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <ReactECharts
                option={getTreeOption()}
                style={{ height: '500px' }}
                onEvents={{
                  click: handleNodeClick,
                }}
              />
            </CardContent>
          </Card>
        )}

        {selectedEdge && (
          <Card>
            <CardHeader>
              <CardTitle>Edge Analysis - 2D Visualization</CardTitle>
              <CardDescription>
                Showing samples where {selectedEdge.feature} ≤ {selectedEdge.threshold.toFixed(2)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReactECharts option={getScatterOption()} style={{ height: '400px' }} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MLDecisionTree;
