import { describe, expect, it } from 'vitest';
import { getUserPrompt } from '../index';

describe('getUserPrompt()', () => {
  it('get builtin prompt: en', async () => {
    expect((await getUserPrompt('en')).length).toBeGreaterThan(0);
  });

  it('get builtin prompt: zh-cn', async () => {
    expect((await getUserPrompt('zh-cn')).length).toBeGreaterThan(0);
  });

  it('get builtin prompt: zh-cn-nyan', async () => {
    expect((await getUserPrompt('zh-cn-nyan')).length).toBeGreaterThan(0);
  });

  it('get custom prompt', async () => {
    expect((await getUserPrompt('README.md')).length).toBeGreaterThan(0);
  });
});
