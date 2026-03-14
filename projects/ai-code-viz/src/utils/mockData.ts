import type { Node, Edge } from '@xyflow/react';

// 示例节点数据
export const initialNodes: Node[] = [
  {
    id: '1',
    type: 'default',
    position: { x: 250, y: 0 },
    data: { label: 'App.tsx' },
    style: { 
      background: '#fff', 
      border: '1px solid #6366f1',
      borderRadius: '8px',
      padding: '12px',
      minWidth: '150px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
  },
  {
    id: '2',
    type: 'default',
    position: { x: 100, y: 150 },
    data: { label: 'CodeFlow.tsx' },
    style: { 
      background: '#fff', 
      border: '1px solid #6366f1',
      borderRadius: '8px',
      padding: '12px',
      minWidth: '150px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
  },
  {
    id: '3',
    type: 'default',
    position: { x: 400, y: 150 },
    data: { label: 'utils/parse.ts' },
    style: { 
      background: '#fff', 
      border: '1px solid #6366f1',
      borderRadius: '8px',
      padding: '12px',
      minWidth: '150px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
  },
];

// 示例边数据
export const initialEdges: Edge[] = [
  { 
    id: 'e1-2', 
    source: '1', 
    target: '2', 
    label: 'imports',
    style: { stroke: '#6366f1', strokeWidth: 2 },
  },
  { 
    id: 'e1-3', 
    source: '1', 
    target: '3', 
    label: 'imports',
    style: { stroke: '#6366f1', strokeWidth: 2 },
  },
];
