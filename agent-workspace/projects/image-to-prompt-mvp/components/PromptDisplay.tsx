import React from 'react';

interface PromptDisplayProps {
  prompt: string | null;
  isGenerating: boolean;
  error: string | null;
}

export default function PromptDisplay({ prompt, isGenerating, error }: PromptDisplayProps) {
  if (isGenerating) {
    return (
      <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Generating prompt...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <svg
            className="w-6 h-6 text-red-500 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  if (prompt) {
    return (
      <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Generated Prompt:</h3>
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{prompt}</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-6">
      <p className="text-gray-400 text-center">Upload an image to generate a prompt</p>
    </div>
  );
}
