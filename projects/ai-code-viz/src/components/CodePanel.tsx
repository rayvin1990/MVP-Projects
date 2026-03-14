import React, { useState, useCallback, useEffect, useRef } from 'react';

interface CodeNode {
  id: string;
  type: string;
  name: string;
  startLine: number;
  endLine: number;
  code: string;
}

interface CodePanelProps {
  code?: string;
  language?: string;
  onCodeChange?: (code: string) => void;
  readOnly?: boolean;
  selectedNode?: CodeNode | null;
}

// Simple syntax highlighting for JavaScript/TypeScript
const highlightSyntax = (code: string): string => {
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\b(import|export|from|const|let|var|function|class|return|if|else|for|while|switch|case|break|continue|try|catch|finally|throw|new|this|typeof|instanceof|in|of|await|async|yield|extends|implements|interface|type|enum|namespace|module|declare|public|private|protected|readonly|abstract|static|get|set)\b/g, '<span class="text-purple-400 font-semibold">$1</span>')
    .replace(/\b(true|false|null|undefined|NaN|Infinity)\b/g, '<span class="text-orange-400">$1</span>')
    .replace(/\b(\d+\.?\d*)\b/g, '<span class="text-green-400">$1</span>')
    .replace(/(['"`])(?:(?!\1)[^\\]|\\.)*\1/g, (match) => `<span class="text-green-300">${match}</span>`)
    .replace(/\/\/.*$/gm, (match) => `<span class="text-gray-500 italic">${match}</span>`)
    .replace(/\/\*[\s\S]*?\*\//g, (match) => `<span class="text-gray-500 italic">${match}</span>`)
    .replace(/\b([A-Z][a-zA-Z0-9_]*)\b/g, '<span class="text-yellow-300">$1</span>')
    .replace(/\b([a-z][a-zA-Z0-9_]*)(?=\()/g, '<span class="text-blue-300">$1</span>');
};

export const CodePanel: React.FC<CodePanelProps> = ({
  code = '',
  language = 'javascript',
  onCodeChange,
  readOnly = false,
  selectedNode,
}) => {
  const [localCode, setLocalCode] = useState(code);
  const [displayCode, setDisplayCode] = useState(code);
  const codeRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    setLocalCode(code);
  }, [code]);

  useEffect(() => {
    if (selectedNode?.code) {
      setDisplayCode(selectedNode.code);
    } else {
      setDisplayCode(localCode);
    }
  }, [selectedNode, localCode]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newCode = e.target.value;
      setLocalCode(newCode);
      onCodeChange?.(newCode);
    },
    [onCodeChange]
  );

  const lineNumbers = displayCode.split('\n').map((_, i) => i + 1);

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-300 font-mono">{language}</span>
          {selectedNode && (
            <span className="px-2 py-1 text-xs bg-indigo-600 text-white rounded">
              {selectedNode.type}: {selectedNode.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            {displayCode.split('\n').length} 行
          </span>
          {!readOnly && (
            <span className="text-xs text-gray-500">可编辑</span>
          )}
        </div>
      </div>

      {/* Code Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Line Numbers */}
        <div className="flex-shrink-0 px-3 py-4 bg-gray-800 text-gray-500 text-right select-none border-r border-gray-700">
          {lineNumbers.map((num) => (
            <div
              key={num}
              className="text-xs font-mono leading-6"
              style={{ minHeight: '24px' }}
            >
              {num}
            </div>
          ))}
        </div>

        {/* Code Display */}
        <div className="flex-1 overflow-auto">
          {readOnly ? (
            <pre
              ref={codeRef}
              className="p-4 bg-gray-900 text-gray-100 font-mono text-sm leading-6"
              dangerouslySetInnerHTML={{ __html: highlightSyntax(displayCode) }}
            />
          ) : (
            <textarea
              className="w-full h-full p-4 bg-gray-900 text-gray-100 font-mono text-sm resize-none focus:outline-none leading-6"
              value={localCode}
              onChange={handleChange}
              spellCheck={false}
              placeholder="在此粘贴或输入代码..."
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-800 border-t border-gray-700 text-xs text-gray-500 flex items-center justify-between">
        <span>UTF-8</span>
        <span>LF</span>
      </div>
    </div>
  );
};

export default CodePanel;
