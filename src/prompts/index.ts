import { readFile } from 'node:fs/promises';
import { genEnBuiltinPrompt } from './en';
import { genZhCnBuiltinPrompt } from './zh-cn';

function getBuiltinPrompt(name: string): string | undefined {
  switch (name) {
    case 'en':
      return genEnBuiltinPrompt();
    case 'zh-cn':
      return genZhCnBuiltinPrompt();
    case 'zh-cn-nyan':
      return genZhCnBuiltinPrompt({ nyan: true });
  }
}

export async function getPrompt(
  fileOrBuiltinName: string,
  replacements: Record<string, string>,
): Promise<string> {
  const builtinPrompt = getBuiltinPrompt(fileOrBuiltinName);
  let prompt = builtinPrompt ? builtinPrompt : await readFile(fileOrBuiltinName, 'utf8');
  for (const [key, value] of Object.entries(replacements)) {
    prompt = prompt.replaceAll(key, value);
  }
  return prompt;
}
