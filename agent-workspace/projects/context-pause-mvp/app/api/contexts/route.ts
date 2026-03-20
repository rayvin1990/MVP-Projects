import { NextRequest, NextResponse } from 'next/server';
import { CreateContextRequest, UpdateContextRequest, ContextsResponse, ContextResponse, Context } from '@/lib/types';

// GET /api/contexts - 获取所有上下文
export async function GET() {
  try {
    // MVP 阶段：服务端无法访问 localStorage，返回空数组
    // 前端直接从 localStorage 读取数据
    const contexts: Context[] = [];

    return NextResponse.json<ContextsResponse>({
      success: true,
      data: contexts,
    });
  } catch (error) {
    console.error('Error fetching contexts:', error);
    return NextResponse.json<ContextsResponse>({
      success: false,
      error: '获取上下文失败',
    }, { status: 500 });
  }
}

// POST /api/contexts - 创建上下文
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('API: Received request body:', body);

    // 验证请求
    if (!body.name) {
      console.log('API: Validation failed - name is empty');
      return NextResponse.json<ContextResponse>({
        success: false,
        error: '上下文名称不能为空',
      }, { status: 400 });
    }

    // 在服务端创建上下文对象
    const context: Context = {
      id: Date.now().toString(),
      name: body.name,
      description: body.description || '',
      files: body.files || [],
      commands: body.commands || [],
      notes: body.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('API: Created context:', context);

    return NextResponse.json<ContextResponse>({
      success: true,
      data: context,
    });
  } catch (error) {
    console.error('API Error creating context:', error);
    return NextResponse.json<ContextResponse>({
      success: false,
      error: '创建上下文失败',
    }, { status: 500 });
  }
}
