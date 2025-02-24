import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { execa } from 'execa';
import type { PartialCodeReviewOptions, CodeReviewOptions } from './types';

export async function gitShow(excludePaths: string[] = []): Promise<string> {
  const { stdout } =
    excludePaths.length === 0
      ? await execa`git show`
      : await execa`git show ${excludePaths.map((path) => `:(exclude)${path}`).join(' ')}`;
  return stdout;
}

export async function readPromptFile(
  promptFile: string,
  replaces: Record<string, string> = {},
): Promise<string> {
  let prompt = await (promptFile === 'en'
    ? readFile(fileURLToPath(new URL('prompts/en.md', import.meta.url)), 'utf-8')
    : promptFile === 'zh-cn'
      ? readFile(fileURLToPath(new URL('prompts/zh-cn.md', import.meta.url)), 'utf-8')
      : promptFile === 'zh-cn-nyan'
        ? readFile(fileURLToPath(new URL('prompts/zh-cn-nyan.md', import.meta.url)), 'utf-8')
        : readFile(promptFile, 'utf-8'));
  for (const [key, value] of Object.entries(replaces)) {
    prompt = prompt.replaceAll(key, value);
  }
  return prompt;
}

export function assertAsCodeReviewOptions(
  options: PartialCodeReviewOptions,
): asserts options is CodeReviewOptions {
  if (!options.model) {
    throw new Error('model is required.');
  }
  if (!options.apiKey) {
    throw new Error('apiKey is required.');
  }
}
