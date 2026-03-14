import { useState, useCallback, useEffect } from 'react';
import type { default as ParserType } from 'web-tree-sitter';

interface ParseResult {
  nodes: any[];
  edges: any[];
  error?: string;
}

export const useCodeParser = () => {
  const [parserClass, setParserClass] = useState<typeof ParserType | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initParser = async () => {
      try {
        // Dynamic import for web-tree-sitter
        const TreeSitter = await import('web-tree-sitter');
        const TreeSitterClass = TreeSitter.default || TreeSitter;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (TreeSitterClass as any).init();
        setParserClass(TreeSitterClass);
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize tree-sitter parser:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initParser();
  }, []);

  const parseCode = useCallback(
    async (code: string): Promise<ParseResult> => {
      if (!parserClass || !isReady) {
        return { nodes: [], edges: [], error: 'Parser not ready' };
      }

      try {
        // TODO: Load language grammar and parse
        // This will be implemented when we have the WASM grammar files
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parser = new (parserClass as any)();
        const tree = parser.parse(code);
        
        // Extract nodes and edges from the syntax tree
        const nodes: any[] = [];
        const edges: any[] = [];
        
        // Simple extraction - will be enhanced later
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cursor: any = tree.walk();
        let nodeId = 0;

        const traverse = () => {
          const nodeType = cursor.nodeType;
          const nodeText = cursor.nodeText;
          
          if (nodeType === 'function_declaration' || nodeType === 'function') {
            nodes.push({
              id: `node-${nodeId++}`,
              type: 'function',
              data: { label: nodeText.substring(0, 30) + '...' },
              position: { x: 0, y: 0 },
            });
          } else if (nodeType === 'class_declaration' || nodeType === 'class') {
            nodes.push({
              id: `node-${nodeId++}`,
              type: 'class',
              data: { label: nodeText.substring(0, 30) + '...' },
              position: { x: 0, y: 0 },
            });
          } else if (nodeType === 'import_statement') {
            nodes.push({
              id: `node-${nodeId++}`,
              type: 'import',
              data: { label: nodeText.substring(0, 30) + '...' },
              position: { x: 0, y: 0 },
            });
          }

          if (cursor.gotoFirstChild()) {
            traverse();
            cursor.gotoParent();
          }
          
          if (cursor.gotoNextSibling()) {
            traverse();
            cursor.gotoParent();
          }
        };

        traverse();
        parser.delete();

        return { nodes, edges };
      } catch (error) {
        return { 
          nodes: [], 
          edges: [], 
          error: error instanceof Error ? error.message : 'Parse failed' 
        };
      }
    },
    [parserClass, isReady]
  );

  return {
    parseCode,
    isReady,
    isLoading,
  };
};

export default useCodeParser;
