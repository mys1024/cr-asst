import { OpenAI } from 'openai';

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

  async function toolCallsHandler(
    toolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[],
  ) {
    const asstMessage: OpenAI.Chat.Completions.ChatCompletionMessageParam = {
      role: 'assistant',
      tool_calls: toolCalls,
    };

    const toolMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = (
      await Promise.all(
        toolCalls.map((toolCall) =>
          (async () => {
            const fn = fns.get(toolCall.function.name);
            if (!fn) {
              throw new Error(`Unknown tool call name: "${toolCall.function.name}".`);
            }
            const args = JSON.parse(toolCall.function.arguments);
            const result = fn(args);
            return {
              id: toolCall.id,
              result: result instanceof Promise ? await result : result,
            };
          })(),
        ),
      )
    ).map(({ id, result }) => ({
      role: 'tool',
      tool_call_id: id,
      content: JSON.stringify(result) || '',
    }));

    return [asstMessage, ...toolMessages];
  }

  return {
    tools,
    toolCallsHandler,
  };
}
