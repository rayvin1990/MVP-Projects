import { useState, useCallback, useMemo } from 'react';
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

interface CodeNodeData {
  id: string;
  type: string;
  name: string;
  startLine: number;
  endLine: number;
  code: string;
}

function App() {
  const [code, setCode] = useState(SAMPLE_CODE);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [filteredNodes, setFilteredNodes] = useState<Node[]>([]);
  const { parseCode, isReady, isLoading } = useCodeParser();

  // Extract code node data for CodePanel
  const codeNodeData = useMemo((): CodeNodeData | null => {
    if (!selectedNodeId) return null;
    
    const node = nodes.find((n) => n.id === selectedNodeId);
    if (!node) return null;

    const lines = code.split('\n');
    const nodeType = node.type || 'unknown';
    const nodeName = (node.data as any)?.label || 'Unknown';
    
    // Find the node in code (simple approach)
    let startLine = -1;
    let endLine = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (nodeType === 'function' && line.includes(`function ${nodeName}`)) {
        startLine = i;
      } else if (nodeType === 'class' && line.includes(`class ${nodeName}`)) {
        startLine = i;
      } else if (nodeType === 'import' && line.includes('import')) {
        startLine = i;
      }
    }

    if (startLine === -1) return null;

    // Simple end line detection (find next function/class or end of file)
    endLine = lines.length - 1;
    for (let i = startLine + 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.match(/^\s*(function|class|export|import)\s/)) {
        endLine = i - 1;
        break;
      }
    }

    const nodeCode = lines.slice(startLine, endLine + 1).join('\n');

    return {
      id: selectedNodeId,
      type: nodeType,
      name: nodeName,
      startLine: startLine + 1,
      endLine: endLine + 1,
      code: nodeCode,
    };
  }, [selectedNodeId, nodes, code]);

  const handleCodeChange = useCallback(async (newCode: string) => {
    setCode(newCode);
    setSelectedNodeId(null);
    
    if (isReady) {
      const result = await parseCode(newCode);
      if (result.nodes) {
        setNodes(result.nodes);
        setEdges(result.edges || []);
      }
    }
  }, [parseCode, isReady]);

  const handleSearch = useCallback((_query: string, results: Array<{ id: string }>) => {
    if (results.length > 0) {
      const resultIds = results.map((r) => r.id);
      setFilteredNodes(nodes.filter((n) => resultIds.includes(n.id)));
    } else {
      setFilteredNodes([]);
    }
  }, [nodes]);

  const handleFilterChange = useCallback((filter: string) => {
    console.log('Filter changed to:', filter);
  }, []);

  const handleNodeClick = useCallback((node: Node) => {
    setSelectedNodeId(node.id);
    console.log('Node selected:', node);
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
        } else if (change.type === 'select') {
          const node = newNodes.find((n) => n.id === change.id);
          if (node) {
            node.selected = change.selected;
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
        } else if (change.type === 'remove') {
          const idx = newEdges.findIndex((e) => e.id === change.id);
          if (idx !== -1) {
            newEdges.splice(idx, 1);
          }
        }
      });
      return newEdges;
    });
  }, []);

  const displayNodes = filteredNodes.length > 0 ? filteredNodes : nodes;

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">
              AI Code Visualizer
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              可视化代码结构和依赖关系
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{nodes.length}</span> 节点
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">{edges.length}</span> 边
            </div>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="px-6 py-4">
        <SearchBar
          nodes={nodes}
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
            selectedNode={codeNodeData}
            onNodeNavigate={handleNodeNavigate}
          />
        </div>

        {/* Graph Viewer */}
        <div className="flex-1 min-w-0">
          <GraphViewer 
            nodes={displayNodes} 
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick}
            selectedNodeId={selectedNodeId}
          />
        </div>
      </div>

      {/* Status Bar */}
      <footer className="px-6 py-2 bg-white border-t border-gray-200 text-sm text-gray-500 flex items-center justify-between">
        <div>
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
              加载解析器中...
            </span>
          ) : isReady ? (
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              解析器就绪
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full" />
              解析器未就绪
            </span>
          )}
        </div>
        {selectedNodeId && (
          <div className="text-indigo-600">
            选中：<span className="font-medium">{selectedNodeId}</span>
          </div>
        )}
      </footer>
    </div>
  );
}

export default App;
