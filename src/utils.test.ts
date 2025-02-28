import { describe, expect, it } from 'vitest';
import { gitDiff } from './utils';

describe('gitShow()', () => {
  it('basic', async () => {
    expect(
      (
        await gitDiff({
          src: 'HEAD^',
          dst: 'HEAD',
          excludePaths: [],
        })
      ).length,
    ).toBeGreaterThan(0);
  });
});
