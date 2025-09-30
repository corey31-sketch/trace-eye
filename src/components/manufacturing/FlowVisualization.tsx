import { Equipment, FlowLink } from "@/types/manufacturing";
import { cn } from "@/lib/utils";

interface FlowVisualizationProps {
  equipment: Equipment[];
  links: FlowLink[];
  className?: string;
}

const flowStatusConfig = {
  high: { color: 'stroke-flow-high', width: '3' },
  medium: { color: 'stroke-flow-medium', width: '2' },
  low: { color: 'stroke-flow-low', width: '2' },
  inactive: { color: 'stroke-flow-inactive', width: '1' },
};

export const FlowVisualization = ({ equipment, links, className }: FlowVisualizationProps) => {
  // Create a map for quick equipment lookup
  const equipmentMap = new Map(equipment.map(eq => [eq.id, eq]));

  // Calculate SVG dimensions based on equipment positions
  const positions = equipment.map(eq => ({ x: eq.x, y: eq.y }));
  const minX = Math.min(...positions.map(p => p.x)) - 100;
  const maxX = Math.max(...positions.map(p => p.x)) + 100;
  const minY = Math.min(...positions.map(p => p.y)) - 100;
  const maxY = Math.max(...positions.map(p => p.y)) + 100;

  const width = maxX - minX;
  const height = maxY - minY;

  const calculatePath = (source: Equipment, target: Equipment) => {
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Control points for curved lines
    const controlOffset = Math.min(distance * 0.3, 100);
    const midX = source.x + dx * 0.5;
    const midY = source.y + dy * 0.5;
    
    // Add some curve based on the direction
    const perpX = -dy / distance * controlOffset;
    const perpY = dx / distance * controlOffset;
    
    return `M ${source.x} ${source.y} Q ${midX + perpX} ${midY + perpY} ${target.x} ${target.y}`;
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
          {/* Arrow markers for different flow statuses */}
          {Object.entries(flowStatusConfig).map(([status, config]) => (
            <marker
              key={status}
              id={`arrow-${status}`}
              markerWidth="10"
              markerHeight="10"
              refX="8"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path
                d="M0,0 L0,6 L9,3 z"
                className={cn("fill-current", config.color)}
              />
            </marker>
          ))}
        </defs>

        {/* Flow links */}
        {links.map(link => {
          const source = equipmentMap.get(link.sourceId);
          const target = equipmentMap.get(link.targetId);
          
          if (!source || !target) return null;
          
          const config = flowStatusConfig[link.status];
          
          return (
            <g key={link.id}>
              {/* Main flow line */}
              <path
                d={calculatePath(source, target)}
                className={cn("fill-none", config.color)}
                strokeWidth={config.width}
                markerEnd={`url(#arrow-${link.status})`}
                strokeLinecap="round"
              />
              
              {/* Throughput label */}
              <text
                x={(source.x + target.x) / 2}
                y={(source.y + target.y) / 2 - 10}
                className="fill-muted-foreground text-xs font-medium"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {link.throughputCount > 0 ? `${link.throughputCount}/h` : ''}
              </text>
              
              {/* Transition time if available */}
              {link.avgTransitionTime > 0 && (
                <text
                  x={(source.x + target.x) / 2}
                  y={(source.y + target.y) / 2 + 15}
                  className="fill-muted-foreground text-xs"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {link.avgTransitionTime < 60 
                    ? `${link.avgTransitionTime.toFixed(1)}s`
                    : `${(link.avgTransitionTime / 60).toFixed(1)}m`
                  }
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};