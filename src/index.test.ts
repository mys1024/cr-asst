import { describe, expect, it } from 'vitest';
import { foo } from './index';

describe('basic', () => {
  it('foo', async () => {
    expect(foo()).toBe('bar');
  });
});
