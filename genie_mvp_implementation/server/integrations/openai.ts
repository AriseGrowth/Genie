import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface CompletionParams {
  messages: OpenAI.Chat.ChatCompletionMessageParam[];
  tools?: OpenAI.Chat.ChatCompletionTool[];
  model?: string;
  jsonMode?: boolean;
}

export async function callOpenAI({ messages, tools = [], model = 'gpt-4o', jsonMode = false }: CompletionParams) {
  const response = await openai.chat.completions.create({
    model,
    messages,
    tools: tools.length > 0 ? tools : undefined,
    temperature: 0.2,
    ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
  });
  return response;
}
