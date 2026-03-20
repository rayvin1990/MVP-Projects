import { NextRequest, NextResponse } from 'next/server';
import { UpdateSnippetRequest, SnippetResponse, Snippet } from '@/lib/types';

// PUT /api/snippets/[id] - 更新片段
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 验证请求
    if (!body.title || !body.content) {
      return NextResponse.json<SnippetResponse>({
        success: false,
        error: '标题和内容不能为空',
      }, { status: 400 });
    }

    const snippet: Snippet = {
      id,
      title: body.title,
      content: body.content,
      abbreviation: body.abbreviation,
      tags: body.tags || [],
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('API: Updated snippet:', snippet);

    return NextResponse.json<SnippetResponse>({
      success: true,
      data: snippet,
    });
  } catch (error) {
    console.error('Error updating snippet:', error);
    return NextResponse.json<SnippetResponse>({
      success: false,
      error: '更新文本片段失败',
    }, { status: 500 });
  }
}

// DELETE /api/snippets/[id] - 删除片段
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log('API: DELETE request for id:', id);

    return NextResponse.json<SnippetResponse>({
      success: true,
    });
  } catch (error) {
    console.error('API Error deleting snippet:', error);
    return NextResponse.json<SnippetResponse>({
      success: false,
      error: '删除文本片段失败',
    }, { status: 500 });
  }
}
