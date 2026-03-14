import React, { useState, useCallback } from 'react';

interface CodePanelProps {
  code?: string;
  language?: string;
  onCodeChange?: (code: string) => void;
  readOnly?: boolean;
}

export const CodePanel: React.FC<CodePanelProps> = ({
  code = '',
  language = 'javascript',
  onCodeChange,
  readOnly = false,
}) => {
  const [localCode, setLocalCode] = useState(code);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newCode = e.target.value;
      setLocalCode(newCode);
      onCodeChange?.(newCode);
    },
    [onCodeChange]
  );

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-sm text-gray-400 font-mono">{language}</span>
        {!readOnly && (
          <span className="text-xs text-gray-500">可编辑</span>
        )}
      </div>
      <textarea
        className="flex-1 w-full p-4 bg-gray-900 text-gray-100 font-mono text-sm resize-none focus:outline-none"
        value={localCode}
        onChange={handleChange}
        readOnly={readOnly}
        spellCheck={false}
        placeholder="在此粘贴或输入代码..."
      />
    </div>
  );
};

export default CodePanel;
