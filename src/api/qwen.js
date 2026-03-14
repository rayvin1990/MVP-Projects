import config from '../config/index.js';

/**
 * Qwen API Client
 * Handles communication with Qwen-Max for summarization
 */

class QwenClient {
  constructor(options = {}) {
    this.apiKey = options.apiKey || config.qwen.apiKey;
    this.model = options.model || config.qwen.model;
    this.baseUrl = config.qwen.baseUrl;
    
    if (!this.apiKey) {
      console.warn('Qwen API key not configured. Summarization will not work.');
    }
  }

  /**
   * Generate summary using Qwen-Max
   * @param {string} text - Text to summarize
   * @param {number} maxLength - Maximum length of summary
   * @returns {Promise<string>} Summary text
   */
  async summarize(text, maxLength = 1000) {
    if (!this.apiKey) {
      throw new Error('Qwen API key not configured');
    }

    const prompt = this._buildSummaryPrompt(text, maxLength);
    
    try {
      const response = await fetch(`${this.baseUrl}/services/aigc/text-generation/generation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          input: {
            messages: [
              {
                role: 'system',
                content: '你是一个专业的对话摘要助手。请简洁地总结对话内容，保留关键信息和上下文。',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
          },
          parameters: {
            max_tokens: Math.floor(maxLength / 4), // Approximate token to character ratio
            temperature: 0.3,
            top_p: 0.8,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Qwen API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      return data.output?.choices?.[0]?.message?.content || data.output?.text || '';
    } catch (error) {
      console.error('Qwen summarization failed:', error);
      throw error;
    }
  }

  /**
   * Build summary prompt
   * @param {string} text - Text to summarize
   * @param {number} maxLength - Target length
   * @returns {string} Prompt for Qwen
   */
  _buildSummaryPrompt(text, maxLength) {
    return `请总结以下对话内容，要求：
1. 保留关键信息和决策
2. 保持上下文连贯性
3. 长度控制在 ${maxLength} 字符以内
4. 使用简洁清晰的语言

对话内容：
${text}

摘要：`;
  }

  /**
   * Extract key information using Qwen
   * @param {string} text - Text to analyze
   * @returns {Promise<Array>} Key information items
   */
  async extractKeyInfo(text) {
    if (!this.apiKey) {
      return [];
    }

    try {
      const response = await fetch(`${this.baseUrl}/services/aigc/text-generation/generation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          input: {
            messages: [
              {
                role: 'system',
                content: '你是一个信息提取助手。从对话中提取关键信息，如决策、偏好、重要事实等。',
              },
              {
                role: 'user',
                content: `从以下对话中提取关键信息（决策、偏好、重要事实等），以 JSON 数组格式返回：\n\n${text}`,
              },
            ],
          },
          parameters: {
            max_tokens: 1000,
            temperature: 0.3,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Qwen API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.output?.choices?.[0]?.message?.content || '';
      
      // Try to parse as JSON
      try {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.warn('Failed to parse key info as JSON');
      }
      
      return [];
    } catch (error) {
      console.error('Key info extraction failed:', error);
      return [];
    }
  }

  /**
   * Health check
   * @returns {Promise<boolean>} API status
   */
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/services/aigc/text-generation/generation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          input: {
            messages: [{ role: 'user', content: 'Hello' }],
          },
        }),
      });
      return response.ok;
    } catch (error) {
      console.error('Qwen health check failed:', error);
      return false;
    }
  }
}

export default QwenClient;
