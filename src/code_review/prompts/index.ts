import { readFile } from 'node:fs/promises';
import type { ModelMessage } from 'ai';
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

- The code changes provided above contain limited code context. Therefore, you **must** call tools to get enough code context before providing your final review report.
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

export async function getUserPrompt(fileOrBuiltinName: string): Promise<string> {
  switch (fileOrBuiltinName) {
    case 'en':
      return genEnBuiltinPrompt();
    case 'zh-cn':
      return genZhCnBuiltinPrompt();
    case 'zh-cn-nyan':
      return genZhCnBuiltinPrompt({ nyan: true });
    default:
      return await readFile(fileOrBuiltinName, 'utf8');
  }
}

export async function getReviewReportMessages(options: {
  systemPromptFile?: string;
  promptFile: string;
  disableTools: boolean;
  diffs: string;
  baseRef: string;
  headRef: string;
}): Promise<ModelMessage[]> {
  const { systemPromptFile, promptFile, disableTools, diffs, baseRef, headRef } = options;

  return [
    {
      role: 'system',
      content: await getSystemPrompt({
        systemPromptFile,
        disableTools,
        diffs,
        baseRef,
        headRef,
      }),
    },
    { role: 'user', content: await getUserPrompt(promptFile) },
  ];
}

export async function getApprovalCheckCommentMessages(options: {
  prevMessages: ModelMessage[];
  approvalCheck: CodeReviewOptions['approvalCheck'];
}): Promise<ModelMessage[]> {
  const { prevMessages, approvalCheck } = options;

  const defaultPrompt = `Based on the **previous conversation**, please determine whether to approve the code changes.

Your response should follow the template (do not wrap your response with code block symbols):

\`\`\`markdown
Approval check: **{{Passed or Failed}}**

Reasons: {{reasons}}
\`\`\``;

  let prompt = defaultPrompt;

  if (typeof approvalCheck === 'object') {
    if (approvalCheck.prompt) {
      prompt = approvalCheck.prompt;
    } else if (approvalCheck.promptFile) {
      prompt = await readFile(approvalCheck.promptFile, 'utf8');
    }
  }

  return [
    ...prevMessages,
    {
      role: 'system',
      content: 'Now tool calling is **disabled**.',
    },
    {
      role: 'user',
      content: prompt,
    },
  ];
}

export function getApprovalCheckStatusMessages(options: {
  prevMessages: ModelMessage[];
}): ModelMessage[] {
  const { prevMessages } = options;

  return [
    ...prevMessages,
    {
      role: 'user',
      content: `Based on the **previous conversation**, please determine whether to approve the code changes.
Your response must be **only** \`approved: true\` or \`approved: false\`. No extra text.`,
    },
  ];
}
