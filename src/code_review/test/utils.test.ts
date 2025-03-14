import { describe, expect, it } from 'vitest';
import { usageToString, statsToString } from '../utils';

describe('usageToString()', () => {
  it('case 1', async () => {
    const inputTokens = 156;
    const outputTokens = 3245;
    expect(
      usageToString({
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
      }),
    ).toMatchSnapshot();
  });
});

describe('statsToString()', () => {
  it('case 1', async () => {
    const startAt = 1741661141870;
    const firstTokenAt = 1741661156970;
    const finishAt = 1741661185963;
    expect(
      statsToString({
        startAt,
        firstTokenAt,
        finishAt,
        timeToFirstToken: firstTokenAt - startAt,
        timeToFinish: finishAt - startAt,
        tokensPerSecond: 6554 / ((finishAt - startAt) / 1000),
      }),
    ).toMatchSnapshot();
  });
});
