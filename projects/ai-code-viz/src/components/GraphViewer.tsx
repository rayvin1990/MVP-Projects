import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
} from '@xyflow/react';
import dagre from 'dagre';
import '@xyflow/react/dist/style.css';

interface GraphViewerProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange?: OnNodesChange;
  onEdgesChange?: OnEdgesChange;
  onNodeClick?: (node: Node) => void;
  selectedNodeId?: string | null;
}

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 200;
const nodeHeight = 50;

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction = 'TB'
) => {
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

// Custom node component
const CustomNode = ({ data, selected }: { data: { label: string; type: string }; selected?: boolean }) => {
  const bgColor = {
    function: 'bg-indigo-500',
    class: 'bg-emerald-500',
    import: 'bg-amber-500',
    variable: 'bg-blue-500',
  }[data.type] || 'bg-gray-500';

  return (
    <div
      className={`px-4 py-2 rounded-lg shadow-md border-2 ${
        selected ? 'border-indigo-600' : 'border-gray-200'
      } ${bgColor} text-white min-w-[180px]`}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase opacity-75">{data.type}</span>
      </div>
      <div className="text-sm font-medium truncate">{data.label}</div>
    </div>
  );
};

const nodeTypes = {
  function: CustomNode,
  class: CustomNode,
  import: CustomNode,
  variable: CustomNode,
};

export const GraphViewer: React.FC<GraphViewerProps> = ({ 
  nodes, 
  edges,
  onNodesChange,
  onEdgesChange,
  onNodeClick,
  selectedNodeId,
}) => {
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(
    () => getLayoutedElements(nodes, edges),
    [nodes, edges]
  );

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onNodeClick?.(node);
    },
    [onNodeClick]
  );

  return (
    <div className="w-full h-full bg-white border border-gray-200 rounded-lg shadow-sm">
      <ReactFlow
        nodes={layoutedNodes.map((node) => ({
          ...node,
          selected: node.id === selectedNodeId,
        }))}
        edges={layoutedEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        fitView
        className="bg-gray-50"
        nodeTypes={nodeTypes}
        defaultEdgeOptions={{
          style: { stroke: '#6366f1', strokeWidth: 2 },
          type: 'smoothstep',
          animated: true,
        }}
        panOnDrag
        zoomOnScroll
        selectNodesOnDrag={false}
      >
        <Background color="#e5e7eb" gap={20} size={1} />
        <Controls className="bg-white rounded-lg shadow-md" />
        <MiniMap
          nodeColor={(node) => {
            switch (node.type) {
              case 'function':
                return '#6366f1';
              case 'class':
                return '#10b981';
              case 'import':
                return '#f59e0b';
              default:
                return '#3b82f6';
            }
          }}
          zoomable
          pannable
          className="bg-white rounded-lg shadow-md"
        />
      </ReactFlow>
    </div>
  );
};

export default GraphViewer;
