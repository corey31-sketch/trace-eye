import { Equipment, FlowLink, ParallelEquipmentGroup } from "@/types/manufacturing";
import { cn } from "@/lib/utils";

interface EnhancedFlowVisualizationProps {
  equipment: Equipment[];
  parallelGroups: ParallelEquipmentGroup[];
  links: FlowLink[];
  className?: string;
}

const flowStatusConfig = {
  high: { color: 'stroke-flow-high', width: '4', opacity: '1' },
  medium: { color: 'stroke-flow-medium', width: '3', opacity: '0.8' },
  low: { color: 'stroke-flow-low', width: '2', opacity: '0.6' },
  inactive: { color: 'stroke-flow-inactive', width: '1', opacity: '0.4' },
};

export const EnhancedFlowVisualization = ({ 
  equipment, 
  parallelGroups, 
  links, 
  className 
}: EnhancedFlowVisualizationProps) => {
  
  // Create maps for quick lookup
  const equipmentMap = new Map(equipment.map(eq => [eq.id, eq]));
  const groupMap = new Map(parallelGroups.map(group => [group.id, group]));

  // Get all positions including groups
  const allPositions = [
    ...equipment.filter(eq => !eq.isParallel).map(eq => ({ x: eq.x, y: eq.y })),
    ...parallelGroups.map(group => {
      // Calculate group center position
      const groupEquipment = group.equipment;
      const avgX = groupEquipment.reduce((sum, eq) => sum + eq.x, 0) / groupEquipment.length;
      const avgY = groupEquipment.reduce((sum, eq) => sum + eq.y, 0) / groupEquipment.length;
      return { x: avgX, y: avgY };
    })
  ];

  const minX = Math.min(...allPositions.map(p => p.x)) - 150;
  const maxX = Math.max(...allPositions.map(p => p.x)) + 150;
  const minY = Math.min(...allPositions.map(p => p.y)) - 150;
  const maxY = Math.max(...allPositions.map(p => p.y)) + 150;

  const width = maxX - minX;
  const height = maxY - minY;

  const calculateSmoothPath = (sourceX: number, sourceY: number, targetX: number, targetY: number) => {
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Enhanced curve calculation for better aesthetics
    const controlOffset = Math.min(distance * 0.4, 120);
    const midX = sourceX + dx * 0.5;
    const midY = sourceY + dy * 0.5;
    
    // Create more dynamic curves based on flow direction
    const perpX = -dy / distance * controlOffset;
    const perpY = dx / distance * controlOffset;
    
    // Add slight randomization for parallel flows to avoid overlap
    const randomOffset = (Math.abs(sourceX + sourceY + targetX + targetY) % 20) - 10;
    
    return `M ${sourceX} ${sourceY} Q ${midX + perpX + randomOffset} ${midY + perpY} ${targetX} ${targetY}`;
  };

  const getPositionForEntity = (entityId: string) => {
    // Check if it's an equipment
    const equipment = equipmentMap.get(entityId);
    if (equipment) {
      return { x: equipment.x, y: equipment.y };
    }
    
    // Check if it's a parallel group
    const group = groupMap.get(entityId);
    if (group) {
      const avgX = group.equipment.reduce((sum, eq) => sum + eq.x, 0) / group.equipment.length;
      const avgY = group.equipment.reduce((sum, eq) => sum + eq.y, 0) / group.equipment.length;
      return { x: avgX, y: avgY };
    }
    
    return null;
  };

  return (
    <div className={cn("relative", className)}>
      <svg
        width="100%"
        height="100%"
        viewBox={`${minX} ${minY} ${width} ${height}`}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      >
        <defs>
          {/* Enhanced gradient definitions for flows */}
          <linearGradient id="flowGradientHigh" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--flow-high))" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(var(--flow-high))" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="flowGradientMedium" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--flow-medium))" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(var(--flow-medium))" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="flowGradientLow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--flow-low))" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(var(--flow-low))" stopOpacity="1" />
          </linearGradient>

          {/* Arrow markers with enhanced design */}
          {Object.entries(flowStatusConfig).map(([status, config]) => (
            <marker
              key={status}
              id={`arrow-${status}`}
              markerWidth="12"
              markerHeight="12"
              refX="10"
              refY="4"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path
                d="M0,0 L0,8 L12,4 z"
                className={cn("fill-current", config.color)}
                opacity={config.opacity}
              />
            </marker>
          ))}

          {/* Enhanced arrow markers for parallel flows */}
          {Object.entries(flowStatusConfig).map(([status, config]) => (
            <marker
              key={`parallel-${status}`}
              id={`arrow-parallel-${status}`}
              markerWidth="14"
              markerHeight="14"
              refX="12"
              refY="5"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path
                d="M0,0 L0,10 L14,5 z"
                className={cn("fill-current", config.color)}
                opacity={config.opacity}
                filter="drop-shadow(0 0 3px currentColor)"
              />
            </marker>
          ))}

          {/* Flow animation definitions */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Background grid for better visualization */}
        <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3"/>
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Flow links with enhanced styling */}
        {links.map((link, index) => {
          const sourcePos = getPositionForEntity(link.sourceId);
          const targetPos = getPositionForEntity(link.targetId);
          
          if (!sourcePos || !targetPos) return null;
          
          const config = flowStatusConfig[link.status];
          const isParallel = link.isParallelFlow;
          
          return (
            <g key={link.id}>
              {/* Glow effect for high-throughput flows */}
              {link.status === 'high' && (
                <path
                  d={calculateSmoothPath(sourcePos.x, sourcePos.y, targetPos.x, targetPos.y)}
                  className={cn("fill-none", config.color)}
                  strokeWidth={parseInt(config.width) + 2}
                  opacity="0.3"
                  filter="url(#glow)"
                />
              )}
              
              {/* Main flow line */}
              <path
                d={calculateSmoothPath(sourcePos.x, sourcePos.y, targetPos.x, targetPos.y)}
                className={cn("fill-none", config.color)}
                strokeWidth={config.width}
                opacity={config.opacity}
                markerEnd={`url(#arrow-${isParallel ? 'parallel-' : ''}${link.status})`}
                strokeLinecap="round"
                strokeDasharray={link.status === 'inactive' ? '5 5' : 'none'}
              >
                {/* Animated flow for active connections */}
                {link.status !== 'inactive' && (
                  <animate
                    attributeName="stroke-dasharray"
                    values="0 10;10 0"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                )}
              </path>
              
              {/* Enhanced throughput label with background */}
              <g transform={`translate(${(sourcePos.x + targetPos.x) / 2}, ${(sourcePos.y + targetPos.y) / 2 - 15})`}>
                <rect 
                  x="-20" 
                  y="-8" 
                  width="40" 
                  height="16" 
                  fill="hsl(var(--card))" 
                  stroke="hsl(var(--border))" 
                  strokeWidth="1" 
                  rx="3"
                  opacity="0.9"
                />
                <text
                  x="0"
                  y="0"
                  className="fill-foreground text-xs font-medium"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {link.throughputCount > 0 ? `${link.throughputCount}/h` : 'Idle'}
                </text>
              </g>
              
              {/* Transition time label */}
              {link.avgTransitionTime > 0 && (
                <g transform={`translate(${(sourcePos.x + targetPos.x) / 2}, ${(sourcePos.y + targetPos.y) / 2 + 20})`}>
                  <rect 
                    x="-15" 
                    y="-6" 
                    width="30" 
                    height="12" 
                    fill="hsl(var(--muted))" 
                    rx="2"
                    opacity="0.8"
                  />
                  <text
                    x="0"
                    y="0"
                    className="fill-muted-foreground text-xs"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {link.avgTransitionTime < 60 
                      ? `${link.avgTransitionTime.toFixed(1)}s`
                      : `${(link.avgTransitionTime / 60).toFixed(1)}m`
                    }
                  </text>
                </g>
              )}

              {/* Flow direction indicator for parallel flows */}
              {isParallel && (
                <circle
                  cx={(sourcePos.x + targetPos.x) / 2}
                  cy={(sourcePos.y + targetPos.y) / 2}
                  r="4"
                  className={cn("fill-current", config.color)}
                  opacity={config.opacity}
                >
                  <animate
                    attributeName="r"
                    values="4;6;4"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};