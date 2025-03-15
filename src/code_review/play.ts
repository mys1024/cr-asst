import { cwd } from 'node:process';
import OpenAI from 'openai';
import { defineTools } from './ai/tool';
import { chat } from './ai/chat';
import type { CodeReviewOptions } from '../types';
import { readFile, writeFile } from 'node:fs/promises';

/* ------------------------------------------------ tools ------------------------------------------------ */

const { tools, toolCallsHandler } = defineTools([
  {
    type: 'function',
    function: {
      name: 'getCwd',
      description: 'get current working directory',
      strict: true,
    },
    functionImpl: cwd,
  },
  {
    type: 'function',
    function: {
      name: 'readFile',
      description: 'read text from a file',
      strict: true,
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'path to a file' },
        },
        required: ['path'],
      },
    },
    functionImpl: async (args: { path: string }) => {
      const { path } = args;
      return await readFile(path, 'utf-8');
    },
  },
  {
    type: 'function',
    function: {
      name: 'writeFile',
      description: 'write text to a file',
      strict: true,
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'path to a file' },
          text: { type: 'string', description: 'text to be wrote to the file' },
        },
        required: ['path', 'text'],
      },
    },
    functionImpl: async (args: { path: string; text: string }) => {
      const { path, text } = args;
      await writeFile(path, text);
      return { status: 'ok' };
    },
  },
]);

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
    toolCallsHandler,
    messages: [
      {
        role: 'user',
        content: '读取 ./en.local.md，翻译为中文，然后写入 zh.local.md',
      },
    ],
  });
}
