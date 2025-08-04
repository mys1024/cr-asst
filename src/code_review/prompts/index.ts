import { readFile } from 'node:fs/promises';
import type { CodeReviewOptions } from '../../types';
import { reviewReportTools } from '../tools';
import { genEnBuiltinPrompt } from './en';
import { genZhCnBuiltinPrompt } from './zh-cn';

function getBuiltinSystemPrompt(options: { disableTools: boolean }) {
  const { disableTools } = options;

  return `# You Are a Code Reviewer

## Role

You are an experienced code reviewer. Now your task is to review the code changes in the user's project, and provide a thorough code review report.

## Code Changes

These are the code changes (output by \`git diff\`) you need to review, please analyze these changes, understand their intent, and review them:

\`\`\`diff
$DIFFS
\`\`\`

- The file paths may be prefixed with \`a/\` or \`b/\`, do not consider these two prefixes as part of the file path.
- The base ref of the code changes is \`$BASE_REF\`, and the head ref is \`$HEAD_REF\`.

## Tool Calling

${
  disableTools
    ? 'Tool calling is disabled.'
    : `Tool calling is enabled.

These are the tools provided by the system that you can call:

$REVIEW_REPORT_TOOLS_DESC

Tool calling rules:

- The code changes provided above contain limited code context. Therefore, you **must** read the directories and files from the user's project to get enough code context before providing your final review report.
- You can call tools multiple times before you have enough code context to fully understand the code changes.`
}

## System Rules

- System rules have the highest priority and must be followed.
- You should follow the tool calling rules provided above if tool calling is enabled.
- You should also follow the rules provided by user.`;
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
  systemPrompt = systemPrompt.replaceAll(
    '$REVIEW_REPORT_TOOLS_DESC',
    Object.entries(reviewReportTools)
      .map(([key, val]) => `- \`${key}\`: ${val.description}`)
      .join('\n'),
  );

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

export async function getApprovalCheckPrompt(
  approvalCheck: CodeReviewOptions['approvalCheck'],
): Promise<string> {
  const defaultPrompt = `Please determine whether the code changes should be approved.

Rules:

- You should determine whether to approve the code changes based on your previous code review.
- Your response must be **only** \`approved: true\` or \`approved: false\`. No extra text.`;

  if (!approvalCheck || approvalCheck === true) {
    return defaultPrompt;
  }

  return (
    approvalCheck.prompt ||
    (approvalCheck.promptFile ? await readFile(approvalCheck.promptFile, 'utf8') : defaultPrompt)
  );
}
