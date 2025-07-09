import { readFile } from 'node:fs/promises';
import { genEnBuiltinPrompt } from './en';
import { genZhCnBuiltinPrompt } from './zh-cn';

function getBuiltinSystemPrompt(options: { disableTools: boolean }) {
  const { disableTools } = options;

  return `# Code Review Assistant

## Role

You are an experienced code reviewer analyzing Git diff changes.
Your goal is to provide thorough code reviews while following the rules below.

## Code Changes

These are the code changes you need to review, please analyze these changes, understand their intent, and review them:

\`\`\`diff
$DIFFS
\`\`\`

The code changes are represented in \`diff\` format, where file paths may be prefixed with \`a/\` or \`b/\`.
Do not consider these two prefixes as part of the file path.

The base ref of the code changes is \`$BASE_REF\`, and the head ref is \`$HEAD_REF\`.

## System Rules

System rules have the highest priority and must be followed.

${
  disableTools
    ? ''
    : `The code changes in diff format contain very limited code context, which is insufficient for a thorough code review.
Therefore, before providing your final review result, you must think about which directories and files you need to read to get more code context.

You must read the directories and files from the project being reviewed by calling the tools provided by the system.

You can call these tools multiple times before you have enough code context to fully understand the code changes.
You should only provide your final review result after you have enough code context to conduct a thorough code review.`
}`;
}

export async function getSystemPrompt(options: {
  systemPromptFile?: string;
  disableTools: boolean;
  diffs: string;
  baseRef: string;
  headRef: string;
}) {
  const { systemPromptFile, disableTools, diffs, baseRef, headRef } = options;

  let systemPrompt = systemPromptFile
    ? await readFile(systemPromptFile, 'utf8')
    : getBuiltinSystemPrompt({ disableTools });

  systemPrompt = systemPrompt.replaceAll('$DIFFS', diffs);
  systemPrompt = systemPrompt.replaceAll('$BASE_REF', baseRef);
  systemPrompt = systemPrompt.replaceAll('$HEAD_REF', headRef);

  return systemPrompt;
}

function getBuiltinUserPrompt(name: string): string | undefined {
  switch (name) {
    case 'en':
      return genEnBuiltinPrompt();
    case 'zh-cn':
      return genZhCnBuiltinPrompt();
    case 'zh-cn-nyan':
      return genZhCnBuiltinPrompt({ nyan: true });
  }
}

export async function getUserPrompt(fileOrBuiltinName: string): Promise<string> {
  const builtinPrompt = getBuiltinUserPrompt(fileOrBuiltinName);
  if (builtinPrompt) {
    return builtinPrompt;
  }
  return await readFile(fileOrBuiltinName, 'utf8');
}
