'use client';

import React, { useEffect, useState } from 'react';

export default function TestApi() {
  const [status, setStatus] = useState('');

  const testApi = async () => {
    setStatus('Testing...');

    try {
      // Test GET
      console.log('Testing GET /api/contexts...');
      const getResponse = await fetch('/api/contexts');
      console.log('GET Response status:', getResponse.status);
      console.log('GET Response ok:', getResponse.ok);

      if (getResponse.ok) {
        const getData = await getResponse.json();
        console.log('GET Response data:', getData);
        setStatus(`GET Success: ${JSON.stringify(getData)}`);
      } else {
        const error = await getResponse.json();
        console.error('GET Error:', error);
        setStatus(`GET Failed: ${JSON.stringify(error)}`);
      }

      // Test POST
      console.log('\nTesting POST /api/contexts...');
      const testData = {
        name: 'Test Context',
        description: 'This is a test',
        files: ['test1.ts', 'test2.ts'],
        commands: ['npm run dev'],
        notes: 'Test notes',
      };

      const postResponse = await fetch('/api/contexts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      console.log('POST Response status:', postResponse.status);
      console.log('POST Response ok:', postResponse.ok);

      if (postResponse.ok) {
        const postData = await postResponse.json();
        console.log('POST Response data:', postData);
        setStatus(`POST Success: ${JSON.stringify(postData)}`);
      } else {
        const postError = await postResponse.text();
        console.error('POST Error:', postError);
        setStatus(`POST Failed: ${postError}`);
      }
    } catch (error) {
      console.error('Test failed:', error);
      setStatus(`Test failed: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
        <button
          onClick={testApi}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Test API
        </button>
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Status:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {status || 'Waiting for test...'}
          </pre>
        </div>
      </div>
    </div>
  );
}
