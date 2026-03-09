import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '@/lib/config';
import { PromptGenerationResponse } from '@/lib/types';

// Call Qwen3-VL-Plus API to generate prompt
async function generatePromptWithQwen(base64Image: string): Promise<string> {
  const { apiKey, baseURL, endpoint, model } = API_CONFIG.qwen;

  // Convert Base64 image to format required by Qwen API
  // Remove data:image/xxx;base64, prefix
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
              text: 'Please describe this image in detail and generate an English description suitable as an AI image generation prompt. The description should include: main subject, scene, style, color, lighting, composition and other details.',
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Qwen API Error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const prompt = data.choices?.[0]?.message?.content || 'Failed to generate prompt';

  return prompt;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image } = body;

    // Validate request
    if (!image) {
      return NextResponse.json<PromptGenerationResponse>({
        success: false,
        error: 'Missing image data',
      }, { status: 400 });
    }

    // Call Qwen3-VL-Plus API to generate prompt
    const prompt = await generatePromptWithQwen(image);

    return NextResponse.json<PromptGenerationResponse>({
      success: true,
      prompt: prompt,
    });

  } catch (error) {
    console.error('Error generating prompt:', error);
    return NextResponse.json<PromptGenerationResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate prompt',
    }, { status: 500 });
  }
}
