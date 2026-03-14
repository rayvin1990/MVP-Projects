import { NextRequest, NextResponse } from 'next/server';
import { CreateSnippetRequest, UpdateSnippetRequest, SnippetsResponse, SnippetResponse, Snippet } from '@/lib/types';

// GET /api/snippets - 获取所有片段
export async function GET() {
  try {
    // MVP: 返回空数组，前端从 localStorage 读取
    const snippets: Snippet[] = [];

    return NextResponse.json<SnippetsResponse>({
      success: true,
      data: snippets,
    });
  } catch (error) {
    console.error('Error fetching snippets:', error);
    return NextResponse.json<SnippetsResponse>({
      success: false,
      error: '获取文本片段失败',
    }, { status: 500 });
  }
}

// POST /api/snippets - 创建片段
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证请求
    if (!body.title || !body.content) {
      return NextResponse.json<SnippetResponse>({
        success: false,
        error: '标题和内容不能为空',
      }, { status: 400 });
    }

    const snippet: Snippet = {
      id: Date.now().toString(),
      title: body.title,
      content: body.content,
      abbreviation: body.abbreviation,
      tags: body.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('API: Created snippet:', snippet);

    return NextResponse.json<SnippetResponse>({
      success: true,
      data: snippet,
    });
  } catch (error) {
    console.error('Error creating snippet:', error);
    return NextResponse.json<SnippetResponse>({
      success: false,
      error: '创建文本片段失败',
    }, { status: 500 });
  }
}
