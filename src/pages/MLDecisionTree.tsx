import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { mockStationStats, lineConfig, stationDisplayNames } from '@/data/mockManufacturingData';
import { StationStats } from '@/types/manufacturing';
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
  const allStationIds = lineConfig.stationOrder;

  const [targetStationId, setTargetStationId] = useState<string | null>(null);
  const [selectedTargetParams, setSelectedTargetParams] = useState<string[]>([]);
  const [inputStationId, setInputStationId] = useState<string | null>(null);
  const [selectedInputParams, setSelectedInputParams] = useState<string[]>([]);
  const [trainedModel, setTrainedModel] = useState<any>(null);
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [selectedLeaf, setSelectedLeaf] = useState<TreeNode | null>(null);
  const [fullDataset, setFullDataset] = useState<{ X: number[][]; y: number[] } | null>(null);

  const targetStation = targetStationId ? mockStationStats[targetStationId] : null;
  const inputStation = inputStationId ? mockStationStats[inputStationId] : null;
  const targetParamNames = targetStation ? Object.keys(targetStation.parameters) : [];
  const inputParamNames = inputStation ? Object.keys(inputStation.parameters) : [];

  const handleTargetStationChange = (id: string) => {
    setTargetStationId(id);
    setSelectedTargetParams([]);
  };

  const handleInputStationChange = (id: string) => {
    setInputStationId(id);
    setSelectedInputParams([]);
  };

  const handleTargetParamToggle = (name: string) => {
    setSelectedTargetParams(prev =>
      prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]
    );
  };

  const handleInputParamToggle = (name: string) => {
    setSelectedInputParams(prev =>
      prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]
    );
  };

  const generateMockData = (
    inputParams: { name: string; stats: { controlLimits: [number, number] } }[],
    targetParam: { stats: { controlLimits: [number, number]; mean: number } },
    samples: number = 100
  ) => {
    const X: number[][] = [];
    const y: number[] = [];

    for (let i = 0; i < samples; i++) {
      const inputRow: number[] = inputParams.map(p => {
        const [lcl, ucl] = p.stats.controlLimits;
        return lcl + Math.random() * (ucl - lcl);
      });
      X.push(inputRow);
      const [lcl, ucl] = targetParam.stats.controlLimits;
      const targetValue = lcl + Math.random() * (ucl - lcl);
      y.push(targetValue > targetParam.stats.mean ? 1 : 0);
    }
    return { X, y };
  };

  const trainModel = () => {
    if (!targetStation || !inputStation || selectedTargetParams.length === 0 || selectedInputParams.length === 0) {
      toast.error('Please select all required parameters');
      return;
    }

    const inputParams = selectedInputParams.map(name => ({
      name,
      stats: inputStation.parameters[name],
    }));
    const targetParam = {
      name: selectedTargetParams[0],
      stats: targetStation.parameters[selectedTargetParams[0]],
    };

    const { X, y } = generateMockData(inputParams, targetParam);

    try {
      const classifier = new DecisionTreeClassifier({ maxDepth: 4, minNumSamples: 5 });
      classifier.train(X, y);
      setTrainedModel(classifier);
      setFullDataset({ X, y });

      const tree = buildTreeVisualization(classifier.root, inputParams.map(p => p.name));
      setTreeData(tree);
      setSelectedLeaf(null);
      toast.success('Model trained successfully!');
    } catch (error) {
      toast.error('Error training model');
      console.error(error);
    }
  };

  const buildTreeVisualization = (node: any, featureNames: string[], idPrefix: string = 'node'): TreeNode => {
    if (!node) {
      return { id: `${idPrefix}-empty`, samples: 0, value: null, isLeaf: true, gini: 0 };
    }

    const isLeaf = node.splitFeature === undefined;
    const children: TreeNode[] = [];

    if (!isLeaf) {
      if (node.left) children.push(buildTreeVisualization(node.left, featureNames, `${idPrefix}-left`));
      if (node.right) children.push(buildTreeVisualization(node.right, featureNames, `${idPrefix}-right`));
    }

    return {
      id: idPrefix,
      feature: isLeaf ? undefined : featureNames[node.splitFeature],
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
    if (!fullDataset) return { samples: [], predictions: [] };
    const { X, y } = fullDataset;
    const sampleSize = Math.min(leafNode.samples, X.length);
    return { samples: X.slice(0, sampleSize), predictions: y.slice(0, sampleSize) };
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
                  <SelectTrigger><SelectValue placeholder="Select target station" /></SelectTrigger>
                  <SelectContent>
                    {allStationIds.map(id => (
                      <SelectItem key={id} value={id}>{stationDisplayNames[id] || id}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {targetStation && (
                <div className="space-y-2">
                  <Label>Target Parameters</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                    {targetParamNames.map(name => (
                      <div key={name} className="flex items-center space-x-2">
                        <Checkbox
                          id={`target-${name}`}
                          checked={selectedTargetParams.includes(name)}
                          onCheckedChange={() => handleTargetParamToggle(name)}
                        />
                        <Label htmlFor={`target-${name}`} className="cursor-pointer">{name}</Label>
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
                  <SelectTrigger><SelectValue placeholder="Select input station" /></SelectTrigger>
                  <SelectContent>
                    {allStationIds.map(id => (
                      <SelectItem key={id} value={id}>{stationDisplayNames[id] || id}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {inputStation && (
                <div className="space-y-2">
                  <Label>Input Parameters</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                    {inputParamNames.map(name => (
                      <div key={name} className="flex items-center space-x-2">
                        <Checkbox
                          id={`input-${name}`}
                          checked={selectedInputParams.includes(name)}
                          onCheckedChange={() => handleInputParamToggle(name)}
                        />
                        <Label htmlFor={`input-${name}`} className="cursor-pointer">{name}</Label>
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
              targetColumn: targetStationId ? stationDisplayNames[targetStationId] || targetStationId : undefined,
              selectedFeatures: selectedInputParams,
              modelType: 'Classification',
            }}
            onLeafClick={handleLeafClick}
          />
        )}

        {selectedLeaf && (
          <LeafAnalysis
            leafNode={selectedLeaf}
            availableFeatures={selectedInputParams}
            leafData={getLeafData(selectedLeaf)}
            onClose={() => setSelectedLeaf(null)}
          />
        )}
      </div>
    </div>
  );
};

export default MLDecisionTree;
