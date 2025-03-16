import { cwd } from 'node:process';
import { OpenAI } from 'openai';
import { readFile, writeFile, readdir, stat, mkdir } from 'node:fs/promises';

/* ------------------------------------------------ tools and handler ------------------------------------------------ */

export const { tools, handleToolCalls } = defineTools([
  {
    type: 'function',
    function: {
      name: 'cwd',
      description: 'Return current working directory.',
      strict: true,
    },
    functionImpl: cwd,
  },
  {
    type: 'function',
    function: {
      name: 'isDir',
      description: 'Determine whether a path is a directory, return boolean.',
      strict: true,
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Path to be determined.' },
        },
        required: ['path'],
      },
    },
    functionImpl: async (args: { path: string }) => {
      return (await stat(args.path)).isDirectory();
    },
  },
  {
    type: 'function',
    function: {
      name: 'isFile',
      description: 'Determine whether a path is a file, return boolean.',
      strict: true,
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Path to be determined.' },
        },
        required: ['path'],
      },
    },
    functionImpl: async (args: { path: string }) => {
      return (await stat(args.path)).isFile();
    },
  },
  {
    type: 'function',
    function: {
      name: 'createDir',
      description: 'Create a directory, return "ok" upon success.',
      strict: true,
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Path to the directory to be created.' },
        },
        required: ['path'],
      },
    },
    functionImpl: async (args: { path: string }) => {
      await mkdir(args.path);
      return 'ok';
    },
  },
  {
    type: 'function',
    function: {
      name: 'readDir',
      description: 'Read a directory, return file and child directory names.',
      strict: true,
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Path to a directory.' },
        },
        required: ['path'],
      },
    },
    functionImpl: async (args: { path: string }) => {
      return (await readdir(args.path, { withFileTypes: true })).map((dirent) => ({
        name: dirent.name,
        isDirectory: dirent.isDirectory(),
        isFile: dirent.isFile(),
      }));
    },
  },
  {
    type: 'function',
    function: {
      name: 'readFile',
      description: 'Read a file, return the file content as text.',
      strict: true,
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Path to a file.' },
        },
        required: ['path'],
      },
    },
    functionImpl: async (args: { path: string }) => {
      const { path } = args;
      return await readFile(path, 'utf-8');
    },
  },
  {
    type: 'function',
    function: {
      name: 'writeFile',
      description: 'Write text to a file, return "ok" upon success.',
      strict: true,
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Path to a file.' },
          text: { type: 'string', description: 'Text to be wrote to the file.' },
        },
        required: ['path', 'text'],
      },
    },
    functionImpl: async (args: { path: string; text: string }) => {
      const { path, text } = args;
      await writeFile(path, text);
      return 'ok';
    },
  },
]);

/* ------------------------------------------------ defineTools() ------------------------------------------------ */

export function defineTools(
  tools: (OpenAI.Chat.Completions.ChatCompletionTool & {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    functionImpl: (args: any) => unknown;
  })[],
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fns = new Map<string, (args: any) => unknown>();

  for (const tool of tools) {
    fns.set(tool.function.name, tool.functionImpl);
  }

  async function handleToolCalls(
    toolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[],
  ) {
    const toolMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = (
      await Promise.all(
        toolCalls.map((toolCall) =>
          (async () => {
            const fn = fns.get(toolCall.function.name);
            if (!fn) {
              throw new Error(`Unknown tool call name: "${toolCall.function.name}".`);
            }
            const args = JSON.parse(toolCall.function.arguments);
            try {
              const returnValue = fn(args);
              return {
                id: toolCall.id,
                content:
                  JSON.stringify(
                    returnValue instanceof Promise ? await returnValue : returnValue,
                  ) || '',
              };
            } catch (error) {
              return {
                id: toolCall.id,
                content: JSON.stringify({
                  error: error instanceof Error ? error.message : String(error),
                }),
              };
            }
          })(),
        ),
      )
    ).map(({ id, content }) => ({
      role: 'tool',
      tool_call_id: id,
      content,
    }));

    return toolMessages;
  }

  return {
    tools,
    handleToolCalls,
  };
}
