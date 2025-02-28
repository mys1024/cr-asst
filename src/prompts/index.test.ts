import { describe, expect, it } from 'vitest';
import { getPrompt } from './index';

describe('getPrompt()', () => {
  it('get builtin prompt: en', async () => {
    expect((await getPrompt('en', {})).length).toBeGreaterThan(0);
  });

  it('get builtin prompt: zh-cn', async () => {
    expect((await getPrompt('zh-cn', {})).length).toBeGreaterThan(0);
  });

  it('get builtin prompt: zh-cn-nyan', async () => {
    expect((await getPrompt('zh-cn-nyan', {})).length).toBeGreaterThan(0);
  });

  it('get prompt file', async () => {
    expect((await getPrompt('README.md', {})).length).toBeGreaterThan(0);
  });

  it('replacements', async () => {
    expect((await getPrompt('en', {})).includes('$DIFFS')).toBe(true);
    expect((await getPrompt('en', {})).includes('NEW_TEXT')).toBe(false);
    expect((await getPrompt('en', { $DIFFS: 'NEW_TEXT' })).includes('$DIFFS')).toBe(false);
    expect((await getPrompt('en', { $DIFFS: 'NEW_TEXT' })).includes('NEW_TEXT')).toBe(true);
  });
});
