interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

const FREE_MODELS = [
  'openai/gpt-oss-120b:free',
  'google/gemma-4-31b-it:free',
];

class OpenRouterClient {
  private apiKeys: string[];
  private currentKeyIndex: number = 0;
  private baseURL: string = 'https://openrouter.ai/api/v1/chat/completions';

  constructor(apiKeys: string[]) {
    this.apiKeys = apiKeys.filter(key => key && key.trim().length > 0);
    if (this.apiKeys.length === 0) {
      console.warn('No valid OpenRouter API keys provided');
    }
  }

  private getNextKey(): string | null {
    if (this.apiKeys.length === 0) return null;
    const key = this.apiKeys[this.currentKeyIndex];
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
    return key;
  }

  async chat(
    messages: OpenRouterMessage[],
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    } = {}
  ): Promise<string> {
    const {
      model = FREE_MODELS[0],
      temperature = 0.7,
      maxTokens = 1000,
      systemPrompt,
    } = options;

    const finalMessages: OpenRouterMessage[] = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages;

    let lastError: Error | null = null;
    let modelIndex = 0;

    // Try all models with all keys
    while (modelIndex < FREE_MODELS.length) {
      const currentModel = FREE_MODELS[modelIndex];

      for (let keyAttempt = 0; keyAttempt < this.apiKeys.length; keyAttempt++) {
        const apiKey = this.getNextKey();
        if (!apiKey) {
          throw new Error('No API keys available');
        }

        try {
          const response = await fetch(this.baseURL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
              'HTTP-Referer': window.location.origin,
              'X-Title': 'MindWell - Mental Health Platform',
            },
            body: JSON.stringify({
              model: currentModel,
              messages: finalMessages,
              temperature,
              max_tokens: maxTokens,
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error (${response.status}): ${errorText}`);
          }

          const data: OpenRouterResponse = await response.json();

          if (data.choices && data.choices[0]?.message?.content) {
            return data.choices[0].message.content;
          }

          throw new Error('Invalid response format from API');
        } catch (error) {
          lastError = error as Error;
          console.warn(`Failed with model ${currentModel}, key ${keyAttempt + 1}:`, error);

          // If rate limited or server error, try next key immediately
          if (lastError.message.includes('429') || lastError.message.includes('503')) {
            continue;
          }
        }
      }

      // All keys failed for this model, try next model
      modelIndex++;
    }

    // All attempts failed
    throw new Error(
      `All AI models failed. Last error: ${lastError?.message || 'Unknown error'}`
    );
  }

  async streamChat(
    messages: OpenRouterMessage[],
    onChunk: (chunk: string) => void,
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    } = {}
  ): Promise<void> {
    const {
      model = FREE_MODELS[0],
      temperature = 0.7,
      maxTokens = 1000,
      systemPrompt,
    } = options;

    const finalMessages: OpenRouterMessage[] = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages;

    const apiKey = this.getNextKey();
    if (!apiKey) {
      throw new Error('No API keys available');
    }

    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'MindWell - Mental Health Platform',
      },
      body: JSON.stringify({
        model,
        messages: finalMessages,
        temperature,
        max_tokens: maxTokens,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Stream API Error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body available');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              onChunk(content);
            }
          } catch (e) {
            console.warn('Failed to parse streaming chunk:', e);
          }
        }
      }
    }
  }
}

// Singleton instance
let openRouterInstance: OpenRouterClient | null = null;

export function initializeOpenRouter(apiKeys: string[]) {
  openRouterInstance = new OpenRouterClient(apiKeys);
}

export function getOpenRouter(): OpenRouterClient {
  if (!openRouterInstance) {
    throw new Error('OpenRouter not initialized. Call initializeOpenRouter first.');
  }
  return openRouterInstance;
}

export type { OpenRouterMessage };
