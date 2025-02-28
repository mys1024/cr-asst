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
    expect((await getPrompt('en', {})).includes('$DIFF')).toBe(true);
    expect((await getPrompt('en', {})).includes('NEW_TEXT')).toBe(false);
    expect((await getPrompt('en', { $DIFF: 'NEW_TEXT' })).includes('$DIFF')).toBe(false);
    expect((await getPrompt('en', { $DIFF: 'NEW_TEXT' })).includes('NEW_TEXT')).toBe(true);
  });
});
