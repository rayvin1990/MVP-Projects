'use client';

import React, { useState } from 'react';
import { Context, CreateContextRequest } from '@/lib/types';
import ContextList from '@/components/ContextList';
import ContextForm from '@/components/ContextForm';

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [editingContext, setEditingContext] = useState<Context | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreate = () => {
    setEditingContext(undefined);
    setShowForm(true);
  };

  const handleEdit = (context: Context) => {
    setEditingContext(context);
    setShowForm(true);
  };

  const handleFormSubmit = async (data: CreateContextRequest) => {
    try {
      const url = editingContext
        ? `/api/contexts/${editingContext.id}`
        : '/api/contexts';

      console.log('Submitting to:', url);
      console.log('Data:', data);

      const response = await fetch(url, {
        method: editingContext ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('API Response:', result);

        // 手动保存到 localStorage
        if (editingContext) {
          // 更新
          const contexts = JSON.parse(localStorage.getItem('context_pause_data') || '[]');
          const index = contexts.findIndex((c: any) => c.id === editingContext.id);
          if (index !== -1) {
            contexts[index] = result.data;
            localStorage.setItem('context_pause_data', JSON.stringify(contexts));
          }
        } else {
          // 创建
          const contexts = JSON.parse(localStorage.getItem('context_pause_data') || '[]');
          contexts.push(result.data);
          localStorage.setItem('context_pause_data', JSON.stringify(contexts));
        }

        // 刷新列表
        if ((window as any).refreshContexts) {
          (window as any).refreshContexts();
        }

        setShowForm(false);
        setRefreshKey((prev) => prev + 1);
      } else {
        const error = await response.json();
        console.error('API Error:', error);
        alert(`操作失败: ${error.error || '未知错误'}`);
      }
    } catch (error) {
      console.error('Failed to submit form:', error);
      alert('操作失败，请重试');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个上下文吗？')) {
      return;
    }

    try {
      const response = await fetch(`/api/contexts/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // 手动从 localStorage 删除
        const contexts = JSON.parse(localStorage.getItem('context_pause_data') || '[]');
        const filtered = contexts.filter((c: any) => c.id !== id);
        localStorage.setItem('context_pause_data', JSON.stringify(filtered));

        // 刷新列表
        if ((window as any).refreshContexts) {
          (window as any).refreshContexts();
        }

        setRefreshKey((prev) => prev + 1);
      } else {
        const error = await response.json();
        alert(`删除失败: ${error.error || '未知错误'}`);
      }
    } catch (error) {
      console.error('Failed to delete context:', error);
      alert('删除失败，请重试');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-black mb-4">
              上下文暂存与恢复
            </h1>
            <p className="text-lg text-gray-800">
              减少上下文切换损失，保持心流状态
            </p>
          </header>

          {!showForm ? (
            <>
              <div className="mb-8 flex justify-center">
                <button
                  onClick={handleCreate}
                  className="bg-blue-700 text-white py-3 px-6 rounded-lg hover:bg-blue-800 transition-colors text-lg font-bold shadow-md"
                >
                  创建上下文
                </button>
              </div>

              <ContextList
                key={refreshKey}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </>
          ) : (
            <div className="max-w-2xl mx-auto">
              <ContextForm
                context={editingContext}
                onSubmit={handleFormSubmit}
                onCancel={() => setShowForm(false)}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
