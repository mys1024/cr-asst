import OpenAI from 'openai';
import { chat } from './ai/chat';
import { tools, handleToolCalls } from './ai/tools';
import type { CodeReviewOptions } from '../types';

/* ------------------------------------------------ play ------------------------------------------------ */

export async function play(options: CodeReviewOptions) {
  // options
  const { model, apiKey, baseUrl } = options;

  // create openai client
  const client = new OpenAI({
    baseURL: baseUrl,
    apiKey,
  });

  chat({
    client,
    model,
    tools,
    handleToolCalls,
    messages: [
      {
        role: 'user',
        content: 'List all child directories in the current working directory.',
      },
    ],
  });
}
