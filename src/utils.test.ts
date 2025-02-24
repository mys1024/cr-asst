import { describe, expect, it } from 'vitest';
import { gitShow, readPromptFile } from './utils';

describe('gitShow()', () => {
  it('basic', async () => {
    expect((await gitShow()).length).toBeGreaterThan(0);
  });
});

describe('readPromptFile()', () => {
  it('read "en"', async () => {
    expect((await readPromptFile('en')).length).toBeGreaterThan(0);
  });

  it('read "zh-cn"', async () => {
    expect((await readPromptFile('zh-cn')).length).toBeGreaterThan(0);
  });
});
