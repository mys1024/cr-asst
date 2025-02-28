import { describe, expect, it } from 'vitest';
import { gitShow } from './utils';

describe('gitShow()', () => {
  it('basic', async () => {
    expect((await gitShow()).length).toBeGreaterThan(0);
  });
});
