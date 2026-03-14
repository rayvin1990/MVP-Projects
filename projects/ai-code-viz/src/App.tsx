import { useState, useCallback } from 'react';
import { GraphViewer } from './components/GraphViewer';
import { CodePanel } from './components/CodePanel';
import { SearchBar } from './components/SearchBar';
import { useCodeParser } from './hooks/useCodeParser';
import type { Node, Edge, OnNodesChange, OnEdgesChange } from '@xyflow/react';

const SAMPLE_CODE = `
import React from 'react';
import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);
  };

  return (
    <div>
      <h1>Counter: {count}</h1>
      <button onClick={handleClick}>Increment</button>
    </div>
  );
}

class Counter {
  constructor() {
    this.count = 0;
  }

  increment() {
    this.count++;
  }
}

export default App;
`;

function App() {
  const [code, setCode] = useState(SAMPLE_CODE);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const { parseCode, isReady, isLoading } = useCodeParser();

  const handleCodeChange = useCallback(async (newCode: string) => {
    setCode(newCode);
    
    if (isReady) {
      const result = await parseCode(newCode);
      if (result.nodes) {
        setNodes(result.nodes);
        setEdges(result.edges);
      }
    }
  }, [parseCode, isReady]);

  const handleSearch = useCallback((query: string) => {
    console.log('Search query:', query);
    // TODO: Implement search/filter logic
  }, []);

  const handleFilterChange = useCallback((filter: string) => {
    console.log('Filter changed to:', filter);
    // TODO: Implement filter logic
  }, []);

  const onNodesChange: OnNodesChange = useCallback((changes) => {
    setNodes((nds) => {
      const newNodes = [...nds];
      changes.forEach((change) => {
        if (change.type === 'position' && change.position) {
          const node = newNodes.find((n) => n.id === change.id);
          if (node) {
            node.position = change.position;
          }
        }
      });
      return newNodes;
    });
  }, []);

  const onEdgesChange: OnEdgesChange = useCallback((changes) => {
    setEdges((eds) => {
      const newEdges = [...eds];
      changes.forEach((change) => {
        if (change.type === 'select') {
          const edge = newEdges.find((e) => e.id === change.id);
          if (edge) {
            edge.selected = change.selected;
          }
        }
      });
      return newEdges;
    });
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="px-6 py-4 bg-white border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-800">
          AI Code Visualizer
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          可视化代码结构和依赖关系
        </p>
      </header>

      {/* Search Bar */}
      <div className="px-6 py-4">
        <SearchBar
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 pb-6 flex gap-6 min-h-0">
        {/* Code Panel */}
        <div className="w-1/3 min-w-[400px]">
          <CodePanel
            code={code}
            language="javascript"
            onCodeChange={handleCodeChange}
          />
        </div>

        {/* Graph Viewer */}
        <div className="flex-1 min-w-0">
          <GraphViewer 
            nodes={nodes} 
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
          />
        </div>
      </div>

      {/* Status Bar */}
      <footer className="px-6 py-2 bg-white border-t border-gray-200 text-sm text-gray-500">
        {isLoading ? (
          <span>加载解析器中...</span>
        ) : isReady ? (
          <span>解析器就绪 | 节点：{nodes.length} | 边：{edges.length}</span>
        ) : (
          <span>解析器未就绪</span>
        )}
      </footer>
    </div>
  );
}

export default App;
