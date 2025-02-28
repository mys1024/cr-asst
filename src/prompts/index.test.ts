import { describe, expect, it } from 'vitest';
import { getPrompt } from './index';

describe('getPrompt()', () => {
  it('get builtin prompt: en', async () => {
    expect((await getPrompt('en', { $DIFFS: 'git diff output' })).length).toBeGreaterThan(0);
  });

  it('get builtin prompt: zh-cn', async () => {
    expect((await getPrompt('zh-cn', { $DIFFS: 'git diff output' })).length).toBeGreaterThan(0);
  });

  it('get builtin prompt: zh-cn-nyan', async () => {
    expect((await getPrompt('zh-cn-nyan', { $DIFFS: 'git diff output' })).length).toBeGreaterThan(
      0,
    );
  });

  it('get custom prompt', async () => {
    expect((await getPrompt('README.md', { $DIFFS: 'git diff output' })).length).toBeGreaterThan(0);
  });

  it('replacements', async () => {
    expect((await getPrompt('en', { $DIFFS: 'git diff output' })).includes('$DIFFS')).toBe(false);
    expect((await getPrompt('en', { $DIFFS: 'git diff output' })).includes('git diff output')).toBe(
      true,
    );
  });
});
