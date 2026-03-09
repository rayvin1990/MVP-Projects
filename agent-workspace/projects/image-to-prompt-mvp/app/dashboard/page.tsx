'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function Dashboard() {
  const searchParams = useSearchParams();
  const prompt = searchParams.get('prompt') || '';
  const imagePreview = searchParams.get('image') || '';

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Your generated prompt result
            </p>
          </header>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            {imagePreview && (
              <div className="mb-6">
                <img
                  src={decodeURIComponent(imagePreview)}
                  alt="Uploaded preview"
                  className="w-full rounded-lg shadow-md"
                />
              </div>
            )}

            {prompt ? (
              <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Generated Prompt:</h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {decodeURIComponent(prompt)}
                </p>
              </div>
            ) : (
              <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-6">
                <p className="text-gray-400 text-center">No prompt available</p>
              </div>
            )}

            <div className="mt-6 flex justify-center">
              <Link
                href="/"
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md transition-colors inline-flex items-center"
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
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Home
              </Link>
            </div>
          </div>

          <footer className="text-center mt-8 text-gray-500 text-sm">
            <p>Images are only used for prompt generation and are not stored</p>
          </footer>
        </div>
      </div>
    </main>
  );
}
