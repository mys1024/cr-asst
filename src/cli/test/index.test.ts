import { describe, expect, it } from 'vitest';
import { cli } from '../index';

describe('cli()', () => {
  it('basic', async () => {
    expect(cli).toBeTruthy();
  });
});
