/**
 * Z.ai API client for Viralyze
 *
 * This replaces z-ai-web-dev-sdk for production/Vercel.
 * It uses Z.ai's OpenAI-compatible Chat Completions API
 * directly with environment variables.
 */

type ChatCompletionRequest = {
  model?: string;
  messages: Array<{
    role: string;
    content: string;
  }>;
  stream?: boolean;
  thinking?: {
    type: string;
  };
  response_format?: {
    type: string;
  };
  temperature?: number;
  max_tokens?: number;
};

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      role?: string;
      content?: string;
    };
  }>;
  error?: unknown;
};

function getConfig() {
  const apiKey = process.env.Z_AI_API_KEY;
  const baseUrl =
    process.env.Z_AI_BASE_URL ||
    'https://api.z.ai/api/paas/v4';

  if (!apiKey) {
    throw new Error(
      'Z_AI_API_KEY environment variable is missing.'
    );
  }

  return {
    apiKey,
    baseUrl: baseUrl.replace(/\/+$/, ''),
  };
}

async function createChatCompletion(
  body: ChatCompletionRequest
): Promise<ChatCompletionResponse> {
  const { apiKey, baseUrl } = getConfig();

  const model =
    body.model ||
    process.env.Z_AI_MODEL ||
    'glm-4.7-flash';

  const response = await fetch(
    `${baseUrl}/chat/completions`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },

      body: JSON.stringify({
        ...body,
        model,
      }),
    }
  );

  const responseText = await response.text();

  let data: ChatCompletionResponse;

  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error(
      `Z.ai returned an invalid response (${response.status}).`
    );
  }

  if (!response.ok) {
    console.error(
      'Z.ai API error:',
      JSON.stringify(data, null, 2)
    );

    const errorMessage =
      typeof data?.error === 'object' &&
      data.error !== null &&
      'message' in data.error
        ? String(
            (data.error as { message?: unknown }).message ||
              'Z.ai API request failed'
          )
        : 'Z.ai API request failed';

    throw new Error(
      `${errorMessage} (HTTP ${response.status})`
    );
  }

  return data;
}

/**
 * This provides the same interface your existing routes use:
 *
 * const zai = await getZAI();
 * const completion = await zai.chat.completions.create({...});
 */
export async function getZAI() {
  return {
    chat: {
      completions: {
        create: createChatCompletion,
      },
    },
  };
}