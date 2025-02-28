import { execa } from 'execa';
import type { PartialCodeReviewOptions, CodeReviewOptions } from './types';

export async function gitShow(excludePaths: string[] = []): Promise<string> {
  const { stdout } =
    excludePaths.length === 0
      ? await execa`git show`
      : await execa`git show ${excludePaths.map((path) => `:(exclude)${path}`).join(' ')}`;
  return stdout;
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
