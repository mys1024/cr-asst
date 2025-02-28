import { readFile } from 'node:fs/promises';
import type { PromptReplacements } from '../types';
import { genEnBuiltinPrompt } from './en';
import { genZhCnBuiltinPrompt } from './zh-cn';

function getBuiltinPrompt(name: string, replacements: PromptReplacements): string | undefined {
  switch (name) {
    case 'en':
      return genEnBuiltinPrompt(replacements);
    case 'zh-cn':
      return genZhCnBuiltinPrompt(replacements);
    case 'zh-cn-nyan':
      return genZhCnBuiltinPrompt(replacements, { nyan: true });
  }
}

export async function getPrompt(
  fileOrBuiltinName: string,
  replacements: PromptReplacements,
): Promise<string> {
  const builtinPrompt = getBuiltinPrompt(fileOrBuiltinName, replacements);
  if (builtinPrompt) {
    return builtinPrompt;
  }
  let customPrompt = await readFile(fileOrBuiltinName, 'utf8');
  for (const [key, value] of Object.entries(replacements)) {
    customPrompt = customPrompt.replaceAll(key, value);
  }
  return customPrompt;
}
