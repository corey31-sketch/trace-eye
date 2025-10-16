import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TreePine, Maximize2, ChevronDown, ChevronRight, Leaf, Split } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TreeNode {
  id: string;
  feature?: string;
  threshold?: number;
  samples: number;
  value: any;
  isLeaf: boolean;
  children?: TreeNode[];
  gini?: number;
  prediction?: string | number;
}

interface TreeVisualizationProps {
  treeData: TreeNode;
  modelConfig: {
    targetColumn?: string;
    selectedFeatures?: string[];
    modelType?: string;
  };
  modelMetrics?: {
    accuracy?: number;
  };
  onLeafClick?: (leafNode: TreeNode) => void;
  className?: string;
}

const TreeNodeComponent = ({ 
  node, 
  onLeafClick, 
  level = 0 
}: { 
  node: TreeNode; 
  onLeafClick?: (node: TreeNode) => void; 
  level?: number;
}) => {
  const [isExpanded, setIsExpanded] = useState(level < 2);

  const handleNodeClick = () => {
    if (node.isLeaf && onLeafClick) {
      onLeafClick(node);
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  const getPredictedClass = () => {
    if (node.prediction !== undefined) {
      return node.prediction.toString();
    }
    if (Array.isArray(node.value)) {
      const maxIndex = node.value.indexOf(Math.max(...node.value));
      return `Class ${maxIndex}`;
    }
    return node.value?.toString() || 'N/A';
  };

  return (
    <div className="space-y-2">
      <div
        onClick={handleNodeClick}
        className={cn(
          'rounded-lg border p-4 transition-all duration-200 cursor-pointer',
          node.isLeaf
            ? 'bg-card border-success/30 hover:border-success/50 hover:shadow-md'
            : 'bg-card border-primary/30 hover:border-primary/50 hover:shadow-md',
          level === 0 && 'ring-2 ring-primary/20'
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {node.isLeaf ? (
              <Leaf className="h-4 w-4 text-success" />
            ) : (
              <Split className="h-4 w-4 text-primary" />
            )}
            <Badge variant={node.isLeaf ? 'secondary' : 'default'}>
              {node.isLeaf ? 'Leaf' : 'Split'}
            </Badge>
          </div>
          {!node.isLeaf && (
            <Button variant="ghost" size="sm">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        <div className="mt-2 space-y-1">
          {!node.isLeaf && (
            <div className="text-sm font-medium">
              {node.feature} ≤ {node.threshold?.toFixed(2)}
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            Samples: {node.samples}
          </div>
          {node.gini !== undefined && (
            <div className="text-xs text-muted-foreground">
              Gini: {node.gini.toFixed(3)}
            </div>
          )}
          {node.isLeaf && (
            <div className="text-xs font-medium text-success-foreground">
              Prediction: {getPredictedClass()}
            </div>
          )}
          {Array.isArray(node.value) && (
            <div className="text-xs text-muted-foreground">
              Distribution: [{node.value.join(', ')}]
            </div>
          )}
        </div>
      </div>

      {!node.isLeaf && isExpanded && node.children && (
        <div className="ml-8 space-y-4">
          {node.children.map((child, index) => (
            <div key={child.id}>
              <div className="text-xs text-muted-foreground mb-2">
                {index === 0 ? 'True' : 'False'}
              </div>
              <TreeNodeComponent
                node={child}
                onLeafClick={onLeafClick}
                level={level + 1}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const TreeVisualization = ({ 
  treeData, 
  modelConfig, 
  modelMetrics, 
  onLeafClick, 
  className 
}: TreeVisualizationProps) => {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <TreePine className="h-5 w-5 text-primary" />
              Decision Tree Visualization
            </CardTitle>
            <CardDescription>
              Interactive tree structure - click on leaf nodes for detailed analysis
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Maximize2 className="mr-2 h-4 w-4" />
            Full Screen
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Model Info */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              Target: {modelConfig?.targetColumn || 'N/A'}
            </Badge>
            <Badge variant="outline">
              Features: {modelConfig?.selectedFeatures?.length || 0}
            </Badge>
            <Badge variant="outline">
              Type: {modelConfig?.modelType || 'Classification'}
            </Badge>
            {modelMetrics?.accuracy && (
              <Badge variant="secondary">
                Accuracy: {(modelMetrics.accuracy * 100).toFixed(1)}%
              </Badge>
            )}
          </div>

          {/* Tree Structure */}
          <ScrollArea className="h-[600px] w-full">
            <div className="p-4">
              <TreeNodeComponent
                node={treeData}
                onLeafClick={onLeafClick}
              />
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};
