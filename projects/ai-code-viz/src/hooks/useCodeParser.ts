import { useState, useCallback, useEffect } from 'react';
import type { Node, Edge } from '@xyflow/react';

interface ParseResult {
  nodes: Node[];
  edges: Edge[];
  error?: string;
}

interface CodeElement {
  id: string;
  type: string;
  name: string;
  startLine: number;
  endLine: number;
  dependencies: string[];
}

export const useCodeParser = () => {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate parser initialization
    const initParser = async () => {
      try {
        // In a real implementation, we would load tree-sitter here
        // For now, we'll use regex-based parsing as a fallback
        await new Promise((resolve) => setTimeout(resolve, 500));
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize parser:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initParser();
  }, []);

  // Extract function name from a line
  const extractFunctionName = (line: string): string | null => {
    const patterns = [
      /function\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/,
      /const\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(?:async\s+)?\(/,
      /const\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(?:async\s+)?function/,
      /([a-zA-Z_][a-zA-Z0-9_]*)\s*\([^)]*\)\s*{/,
      /([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(?:async\s+)?function/,
      /([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*\(.*?\)\s*=>/,
    ];

    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  };

  // Extract class name from a line
  const extractClassName = (line: string): string | null => {
    const pattern = /class\s+([a-zA-Z_][a-zA-Z0-9_]*)/;
    const match = line.match(pattern);
    return match ? match[1] : null;
  };

  // Extract import statements
  const extractImports = (line: string): string[] => {
    const imports: string[] = [];
    
    // import X from 'module'
    const defaultImport = line.match(/import\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+from/);
    if (defaultImport) {
      imports.push(defaultImport[1]);
    }

    // import { X, Y } from 'module'
    const namedImports = line.match(/import\s*{([^}]+)}\s*from/);
    if (namedImports) {
      const names = namedImports[1].split(',').map((n) => n.trim());
      imports.push(...names);
    }

    // import * as X from 'module'
    const namespaceImport = line.match(/import\s*\*\s*as\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
    if (namespaceImport) {
      imports.push(namespaceImport[1]);
    }

    return imports;
  };

  // Extract function calls (dependencies)
  const extractFunctionCalls = (line: string): string[] => {
    const calls: string[] = [];
    const pattern = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;
    let match;

    while ((match = pattern.exec(line)) !== null) {
      const name = match[1];
      // Filter out keywords and common patterns
      if (
        !['if', 'for', 'while', 'switch', 'catch', 'function', 'return', 'const', 'let', 'var'].includes(name)
      ) {
        calls.push(name);
      }
    }

    return calls;
  };

  const parseCode = useCallback(
    async (code: string): Promise<ParseResult> => {
      if (!isReady) {
        return { nodes: [], edges: [], error: 'Parser not ready' };
      }

      try {
        const lines = code.split('\n');
        const elements: CodeElement[] = [];
        const imports: CodeElement[] = [];
        
        let currentElement: CodeElement | null = null;
        let braceCount = 0;
        let inElement = false;

        // First pass: identify code elements
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const trimmedLine = line.trim();

          // Check for import statements
          if (trimmedLine.startsWith('import')) {
            const importNames = extractImports(trimmedLine);
            importNames.forEach((name, idx) => {
              imports.push({
                id: `import-${i}-${idx}`,
                type: 'import',
                name: name,
                startLine: i + 1,
                endLine: i + 1,
                dependencies: [],
              });
            });
            continue;
          }

          // Check for function declaration
          const funcName = extractFunctionName(trimmedLine);
          if (funcName && !currentElement) {
            currentElement = {
              id: `function-${i}`,
              type: 'function',
              name: funcName,
              startLine: i + 1,
              endLine: i + 1,
              dependencies: [],
            };
            inElement = true;
            braceCount = (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
            
            if (braceCount <= 0 && trimmedLine.includes('=>')) {
              // Arrow function on single line
              currentElement.endLine = i + 1;
              elements.push(currentElement);
              currentElement = null;
              inElement = false;
            }
            continue;
          }

          // Check for class declaration
          const className = extractClassName(trimmedLine);
          if (className && !currentElement) {
            currentElement = {
              id: `class-${i}`,
              type: 'class',
              name: className,
              startLine: i + 1,
              endLine: i + 1,
              dependencies: [],
            };
            inElement = true;
            braceCount = (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
            continue;
          }

          // Track braces for multi-line elements
          if (inElement && currentElement) {
            braceCount += (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
            
            if (braceCount <= 0) {
              currentElement.endLine = i + 1;
              elements.push(currentElement);
              currentElement = null;
              inElement = false;
            }
          }
        }

        // Second pass: extract dependencies
        for (const element of [...elements, ...imports]) {
          for (let i = element.startLine - 1; i < element.endLine && i < lines.length; i++) {
            const calls = extractFunctionCalls(lines[i]);
            element.dependencies.push(...calls);
          }
        }

        // Convert to React Flow nodes
        const nodes: Node[] = [
          ...imports.map((imp) => ({
            id: imp.id,
            type: 'import',
            data: { label: imp.name, type: 'import' },
            position: { x: 0, y: 0 },
          })),
          ...elements.map((elem) => ({
            id: elem.id,
            type: elem.type,
            data: { label: elem.name, type: elem.type },
            position: { x: 0, y: 0 },
          })),
        ];

        // Create edges based on dependencies
        const edges: Edge[] = [];
        const elementMap = new Map<string, CodeElement>();
        [...elements, ...imports].forEach((elem) => {
          elementMap.set(elem.name, elem);
        });

        for (const element of [...elements, ...imports]) {
          for (const dep of element.dependencies) {
            const targetElement = elementMap.get(dep);
            if (targetElement && targetElement.id !== element.id) {
              edges.push({
                id: `edge-${element.id}-${targetElement.id}`,
                source: element.id,
                target: targetElement.id,
                type: 'smoothstep',
                animated: true,
                style: { stroke: '#6366f1', strokeWidth: 2 },
              });
            }
          }
        }

        return { nodes, edges };
      } catch (error) {
        console.error('Parse error:', error);
        return {
          nodes: [],
          edges: [],
          error: error instanceof Error ? error.message : 'Parse failed',
        };
      }
    },
    [isReady]
  );

  return {
    parseCode,
    isReady,
    isLoading,
  };
};

export default useCodeParser;
