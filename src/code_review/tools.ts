import { z } from 'zod';
import { tool, type ToolSet } from 'ai';
import { toToolResult, runCmd } from './utils';

export const reviewReportTools = {
  readProjectDir: tool({
    description: 'Read a directory from the project being reviewed.',
    inputSchema: z.object({
      revision: z
        .string()
        .describe(
          'Git revision to read the directory from, can be a branch name, a tag name, or a commit hash.',
        ),
      path: z
        .string()
        .describe(
          'Path to the directory, relative to the project root directory. Passing an empty string will read the root directory.',
        ),
    }),
    execute: ({ revision, path }) => toToolResult(runCmd('git', ['show', `${revision}:${path}`])),
  }),

  readProjectFile: tool({
    description: 'Read a file from the project being reviewed.',
    inputSchema: z.object({
      revision: z
        .string()
        .describe(
          'Git revision to read the file from, can be a branch name, a tag name, or a commit hash.',
        ),
      path: z.string().describe('Path to the file, relative to the project root directory.'),
    }),
    execute: ({ revision, path }) => toToolResult(runCmd('git', ['show', `${revision}:${path}`])),
  }),
} satisfies ToolSet;

export function createApprovalCheckTools(
  onApprovalCheckResult: (result: { approved: boolean }) => void,
) {
  return {
    sendApprovalCheckResult: tool({
      description: 'Send the approval check result.',
      inputSchema: z.object({
        approved: z.boolean().describe('Whether to approve the code changes.'),
      }),
      execute: ({ approved }) => toToolResult(() => onApprovalCheckResult({ approved })),
    }),
  } satisfies ToolSet;
}
