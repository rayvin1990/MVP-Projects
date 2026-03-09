'use client';

import { useState } from 'react';
import ImageUploader from '@/components/ImageUploader';
import PromptDisplay from '@/components/PromptDisplay';
import { GenerateState } from '@/lib/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [state, setState] = useState<GenerateState>({
    imagePreview: null,
    isGenerating: false,
    generatedPrompt: null,
    error: null,
  });
  const router = useRouter();

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
          error: data.error || 'Failed to generate prompt',
        });
      }
    } catch (error) {
      setState({
        ...state,
        imagePreview: imageData,
        isGenerating: false,
        generatedPrompt: null,
        error: 'Network error, please try again',
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

  const handleViewInDashboard = () => {
    if (state.imagePreview && state.generatedPrompt) {
      const params = new URLSearchParams({
        image: state.imagePreview,
        prompt: state.generatedPrompt,
      });
      router.push(`/dashboard?${params.toString()}`);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Image to Prompt
            </h1>
            <p className="text-lg text-gray-600">
              Upload an image and AI will generate a detailed description prompt
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
                    Upload Again
                  </button>
                </div>

                <PromptDisplay
                  prompt={state.generatedPrompt}
                  isGenerating={state.isGenerating}
                  error={state.error}
                />

                {state.generatedPrompt && !state.isGenerating && (
                  <div className="flex justify-center">
                    <button
                      onClick={handleViewInDashboard}
                      className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg shadow-md transition-colors inline-flex items-center"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                      View in Dashboard
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <footer className="text-center mt-8 text-gray-500 text-sm">
            <p>Images are only used for prompt generation and are not stored</p>
          </footer>
        </div>
      </div>
    </main>
  );
}
