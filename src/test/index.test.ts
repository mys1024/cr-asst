import { describe, expect, it } from 'vitest';
import { codeReview } from '../index';

describe('main', () => {
  it('export: codeReview()', async () => {
    expect(codeReview).toBeTruthy();
  });
});
