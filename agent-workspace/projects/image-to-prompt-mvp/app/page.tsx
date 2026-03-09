'use client';

import { useState } from 'react';
import ImageUploader from '@/components/ImageUploader';
import PromptDisplay from '@/components/PromptDisplay';
import { GenerateState } from '@/lib/types';

export default function Home() {
  const [state, setState] = useState<GenerateState>({
    imagePreview: null,
    isGenerating: false,
    generatedPrompt: null,
    error: null,
  });

  const handleImageSelected = async (imageData: string) => {
    setState({
      ...state,
      imagePreview: imageData,
      isGenerating: true,
      generatedPrompt: null,
      error: null,
    });

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setState({
          ...state,
          imagePreview: imageData,
          isGenerating: false,
          generatedPrompt: data.prompt,
          error: null,
        });
      } else {
        setState({
          ...state,
          imagePreview: imageData,
          isGenerating: false,
          generatedPrompt: null,
          error: data.error || '生成提示词失败',
        });
      }
    } catch (error) {
      setState({
        ...state,
        imagePreview: imageData,
        isGenerating: false,
        generatedPrompt: null,
        error: '网络错误，请重试',
      });
    }
  };

  const handleReset = () => {
    setState({
      imagePreview: null,
      isGenerating: false,
      generatedPrompt: null,
      error: null,
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              图片转提示词
            </h1>
            <p className="text-lg text-gray-600">
              上传图片，AI 自动生成详细的描述提示词
            </p>
          </header>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            {!state.imagePreview ? (
              <ImageUploader
                onImageSelected={handleImageSelected}
                disabled={state.isGenerating}
              />
            ) : (
              <div className="space-y-6">
                <div className="relative">
                  <img
                    src={state.imagePreview}
                    alt="Uploaded preview"
                    className="w-full rounded-lg shadow-md"
                  />
                  <button
                    onClick={handleReset}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-md transition-colors"
                  >
                    重新上传
                  </button>
                </div>

                <PromptDisplay
                  prompt={state.generatedPrompt}
                  isGenerating={state.isGenerating}
                  error={state.error}
                />
              </div>
            )}
          </div>

          <footer className="text-center mt-8 text-gray-500 text-sm">
            <p>图片仅用于生成提示词，不会被存储</p>
          </footer>
        </div>
      </div>
    </main>
  );
}
