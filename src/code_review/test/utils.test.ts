import { describe, expect, it } from 'vitest';
import { usageToString, statsToString } from '../utils';

describe('usageToString()', () => {
  it('case 1', async () => {
    expect(
      usageToString({
        inputTokens: 321,
        cachedInputTokens: 123,
        outputTokens: 3245,
        reasoningTokens: 2345,
        totalTokens: 7000,
      }),
    ).toMatchSnapshot();
  });
});

describe('statsToString()', () => {
  it('case 1', async () => {
    const startedAt = 1741661141870;
    const firstTokenReceivedAt = 1741661156970;
    const finishedAt = 1741661185963;
    expect(
      statsToString({
        startedAt,
        firstTokenReceivedAt,
        finishedAt,
        timeToFirstToken: firstTokenReceivedAt - startedAt,
        timeToFinish: finishedAt - startedAt,
        tokensPerSecond: 6554 / ((finishedAt - startedAt) / 1000),
      }),
    ).toMatchSnapshot();
  });
});
