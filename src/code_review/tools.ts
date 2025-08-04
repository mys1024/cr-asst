import { z } from 'zod';
import { tool, type ToolSet } from 'ai';
import { toToolResult, runCmd } from './utils';

export const reviewReportTools = {
  readUserProjectDir: tool({
    description:
      "Reads a directory from the user's project. Returns the list of files and directories in the directory.",
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

  readUserProjectFileLines: tool({
    description: "Reads a file's lines from the user's project.",
    inputSchema: z.object({
      ref: z
        .string()
        .describe(
          'Git ref to read the file from, can be a branch name, a tag name, or a commit hash.',
        ),
      path: z.string().describe('Path to the file, relative to the project root directory.'),
      lineStart: z
        .number()
        .describe(
          'Line number to start reading from, 1-based. If it is greater than the total number of lines in the file, return an empty string.',
        ),
      lineEnd: z
        .number()
        .describe(
          'Line number to end reading at, 1-based. If it is greater than the total number of lines in the file, read until the end of the file.',
        ),
    }),
    execute: ({ ref, path, lineStart, lineEnd }) =>
      toToolResult(async () => {
        const content = await runCmd('git', ['show', `${ref}:${path}`]);
        return content
          .split('\n')
          .slice(lineStart - 1, lineEnd)
          .join('\n');
      }),
  }),

  searchUserProjectByKeyword: tool({
    description:
      "Searches for a keyword in the user's project files. Returns the output of the `git grep --heading` command. It is useful to find the references to a variable, a function, a class, etc.",
    inputSchema: z.object({
      ref: z
        .string()
        .describe(
          'Git ref to search for the keyword in, can be a branch name, a tag name, or a commit hash.',
        ),
      keyword: z.string().describe('Keyword to search for.'),
    }),
    execute: ({ ref, keyword }) =>
      toToolResult(runCmd('git', ['grep', '--heading', '-n', '-C', '8', keyword, ref])),
  }),
} satisfies ToolSet;
