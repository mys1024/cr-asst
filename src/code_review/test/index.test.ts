import { describe, expect, it } from 'vitest';
import { codeReview } from '../index';

describe('codeReview()', () => {
  it('basic', async () => {
    expect(
      await codeReview({
        model: 'gpt-4',
        apiKey: 'sk-xxx',
        dryRun: true,
      }),
    ).toBeTruthy();
  });
});
