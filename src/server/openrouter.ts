import { appConfig } from './config.js';

interface OpenRouterOptions {
  model?: string;
  systemPrompt: string;
  userMessage: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  retries?: number;
}

async function attempt(options: OpenRouterOptions): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 15000);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${appConfig.openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': appConfig.appOrigin,
      },
      body: JSON.stringify({
        model: options.model ?? appConfig.openRouterModel,
        messages: [
          { role: 'system', content: options.systemPrompt },
          { role: 'user', content: options.userMessage },
        ],
        temperature: options.temperature ?? 0.1,
        max_tokens: options.maxTokens ?? 500,
      }),
    });

    if (!response.ok) {
      console.error('OpenRouter API error:', response.status, await response.text());
      return null;
    }

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    return data.choices?.[0]?.message?.content ?? null;
  } catch (error) {
    console.error('OpenRouter call failed:', error instanceof Error ? error.message : error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function callOpenRouter(options: OpenRouterOptions): Promise<string | null> {
  if (!appConfig.openRouterApiKey) return null;

  const maxRetries = options.retries ?? 1;

  for (let i = 0; i <= maxRetries; i++) {
    const result = await attempt(options);
    if (result) return result;
    if (i < maxRetries) {
      console.log(`OpenRouter retry ${i + 1}/${maxRetries}...`);
    }
  }

  return null;
}

export function parseJsonResponse<T>(content: string | null): T | null {
  if (!content) return null;
  try {
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
}
