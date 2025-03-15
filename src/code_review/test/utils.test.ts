import { describe, expect, it } from 'vitest';
import { usageToString, statsToString } from '../utils';

describe('usageToString()', () => {
  it('case 1', async () => {
    const promptTokens = 156;
    const completionTokens = 3245;
    expect(
      usageToString({
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
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
