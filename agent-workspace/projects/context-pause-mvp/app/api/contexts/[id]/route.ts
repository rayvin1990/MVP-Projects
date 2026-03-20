import { NextRequest, NextResponse } from 'next/server';
import { UpdateContextRequest, ContextResponse, Context } from '@/lib/types';

// PUT /api/contexts/[id] - 更新上下文
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    console.log('API: PUT request for id:', id);
    console.log('API: PUT body:', body);

    // 验证请求
    if (!body.name) {
      return NextResponse.json<ContextResponse>({
        success: false,
        error: '上下文名称不能为空',
      }, { status: 400 });
    }

    // 在服务端返回更新的上下文对象（不实际存储）
    const context: Context = {
      id,
      name: body.name,
      description: body.description || '',
      files: body.files || [],
      commands: body.commands || [],
      notes: body.notes || '',
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('API: Updated context:', context);

    return NextResponse.json<ContextResponse>({
      success: true,
      data: context,
    });
  } catch (error) {
    console.error('API Error updating context:', error);
    return NextResponse.json<ContextResponse>({
      success: false,
      error: '更新上下文失败',
    }, { status: 500 });
  }
}

// DELETE /api/contexts/[id] - 删除上下文
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log('API: DELETE request for id:', id);

    // 在 MVP 阶段直接返回成功（不实际删除）
    return NextResponse.json<ContextResponse>({
      success: true,
    });
  } catch (error) {
    console.error('API Error deleting context:', error);
    return NextResponse.json<ContextResponse>({
      success: false,
      error: '删除上下文失败',
    }, { status: 500 });
  }
}
