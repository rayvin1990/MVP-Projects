import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from '@xyflow/react';

interface CodeFlowProps {
  nodes: Node[];
  edges: Edge[];
}

export function CodeFlow({ nodes: initialNodes, edges: initialEdges }: CodeFlowProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    console.log('Node clicked:', node);
    // TODO: 实现代码跳转功能
  }, []);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        fitView
        className="bg-white dark:bg-gray-900"
      >
        <Background />
        <Controls />
        <MiniMap 
          nodeStrokeColor={() => '#6366f1'}
          nodeColor={() => '#a5b4fc'}
          maskColor="rgb(240, 240, 240, 0.8)"
        />
      </ReactFlow>
    </div>
  );
}
