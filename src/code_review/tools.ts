import { z } from 'zod';
import { tool, type ToolSet } from 'ai';
import { toToolResult, runCmd } from './utils';

export const reviewReportTools = {
  readUserProjectDir: tool({
    description: "Read a directory from the user's project.",
    inputSchema: z.object({
      ref: z
        .string()
        .describe(
          'Git ref to read the directory from, can be a branch name, a tag name, or a commit hash.',
        ),
      path: z
        .string()
        .describe(
          'Path to the directory, relative to the project root directory. Passing an empty string will read the root directory.',
        ),
    }),
    execute: ({ ref, path }) => toToolResult(runCmd('git', ['show', `${ref}:${path}`])),
  }),

  readUserProjectFile: tool({
    description: "Read a file from the user's project.",
    inputSchema: z.object({
      ref: z
        .string()
        .describe(
          'Git ref to read the file from, can be a branch name, a tag name, or a commit hash.',
        ),
      path: z.string().describe('Path to the file, relative to the project root directory.'),
    }),
    execute: ({ ref, path }) => toToolResult(runCmd('git', ['show', `${ref}:${path}`])),
  }),
} satisfies ToolSet;
