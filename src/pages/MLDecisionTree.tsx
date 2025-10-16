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
import { DecisionTreeClassifier } from 'ml-cart';
import { toast } from 'sonner';
import { TreeVisualization, TreeNode } from '@/components/manufacturing/TreeVisualization';
import { LeafAnalysis } from '@/components/manufacturing/LeafAnalysis';

interface LeafData {
  samples: number[][];
  predictions: number[];
}

const MLDecisionTree = () => {
  const navigate = useNavigate();
  const [targetStation, setTargetStation] = useState<Equipment | null>(null);
  const [selectedTargetParams, setSelectedTargetParams] = useState<string[]>([]);
  const [inputStation, setInputStation] = useState<Equipment | null>(null);
  const [selectedInputParams, setSelectedInputParams] = useState<string[]>([]);
  const [trainedModel, setTrainedModel] = useState<any>(null);
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [selectedLeaf, setSelectedLeaf] = useState<TreeNode | null>(null);
  const [fullDataset, setFullDataset] = useState<{ X: number[][], y: number[] } | null>(null);

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
      setFullDataset({ X, y });

      const tree = buildTreeVisualization(classifier.root, inputParams);
      setTreeData(tree);
      setSelectedLeaf(null);
      toast.success('Model trained successfully!');
    } catch (error) {
      toast.error('Error training model');
      console.error(error);
    }
  };

  const buildTreeVisualization = (node: any, inputParams: ProcessParameter[], idPrefix: string = 'node'): TreeNode => {
    if (!node) {
      return {
        id: `${idPrefix}-empty`,
        samples: 0,
        value: null,
        isLeaf: true,
        gini: 0,
      };
    }

    const isLeaf = node.splitFeature === undefined;
    const children: TreeNode[] = [];

    if (!isLeaf) {
      if (node.left) {
        children.push(buildTreeVisualization(node.left, inputParams, `${idPrefix}-left`));
      }
      if (node.right) {
        children.push(buildTreeVisualization(node.right, inputParams, `${idPrefix}-right`));
      }
    }

    return {
      id: idPrefix,
      feature: isLeaf ? undefined : inputParams[node.splitFeature]?.name,
      threshold: isLeaf ? undefined : node.splitValue,
      samples: node.numSamples || 0,
      value: node.prediction,
      isLeaf,
      children: children.length > 0 ? children : undefined,
      gini: 0.5,
      prediction: node.prediction,
    };
  };

  const handleLeafClick = (leafNode: TreeNode) => {
    setSelectedLeaf(leafNode);
  };

  const getLeafData = (leafNode: TreeNode): LeafData => {
    if (!fullDataset) {
      return { samples: [], predictions: [] };
    }

    // For demo purposes, return a subset of the full dataset
    // In a real implementation, you would traverse the tree to find actual leaf samples
    const { X, y } = fullDataset;
    const sampleSize = Math.min(leafNode.samples, X.length);
    
    return {
      samples: X.slice(0, sampleSize),
      predictions: y.slice(0, sampleSize),
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
          <TreeVisualization
            treeData={treeData}
            modelConfig={{
              targetColumn: targetStation?.name,
              selectedFeatures: inputStation?.parameters
                .filter(p => selectedInputParams.includes(p.id))
                .map(p => p.name),
              modelType: 'Classification',
            }}
            onLeafClick={handleLeafClick}
          />
        )}

        {selectedLeaf && inputStation && (
          <LeafAnalysis
            leafNode={selectedLeaf}
            availableFeatures={
              inputStation.parameters
                .filter(p => selectedInputParams.includes(p.id))
                .map(p => p.name)
            }
            leafData={getLeafData(selectedLeaf)}
            onClose={() => setSelectedLeaf(null)}
          />
        )}
      </div>
    </div>
  );
};

export default MLDecisionTree;
