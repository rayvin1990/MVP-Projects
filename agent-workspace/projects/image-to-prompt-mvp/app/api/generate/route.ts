import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '@/lib/config';
import { PromptGenerationResponse } from '@/lib/types';

// 调用 Qwen3-VL-Plus API 生成提示词
async function generatePromptWithQwen(base64Image: string): Promise<string> {
  const { apiKey, baseURL, endpoint, model } = API_CONFIG.qwen;

  // 将 Base64 图片转换为 Qwen API 需要的格式
  // 移除 data:image/xxx;base64, 前缀
  const imageData = base64Image.split(',')[1];

  const response = await fetch(`${baseURL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageData}`,
              },
            },
            {
              type: 'text',
              text: '请详细描述这张图片的内容，生成一段适合作为 AI 图像生成提示词的英文描述。描述应该包括：主要对象、场景、风格、色彩、光影、构图等细节。',
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Qwen API 错误: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const prompt = data.choices?.[0]?.message?.content || '未能生成提示词';

  return prompt;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image } = body;

    // 验证请求
    if (!image) {
      return NextResponse.json<PromptGenerationResponse>({
        success: false,
        error: '缺少图片数据',
      }, { status: 400 });
    }

    // 调用 Qwen3-VL-Plus API 生成提示词
    const prompt = await generatePromptWithQwen(image);

    return NextResponse.json<PromptGenerationResponse>({
      success: true,
      prompt: prompt,
    });

  } catch (error) {
    console.error('Error generating prompt:', error);
    return NextResponse.json<PromptGenerationResponse>({
      success: false,
      error: error instanceof Error ? error.message : '生成提示词失败',
    }, { status: 500 });
  }
}
