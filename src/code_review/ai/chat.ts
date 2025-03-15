import { stdout } from 'node:process';
import OpenAI from 'openai';
import { usageToString, statsToString } from '../utils';
import { createCompletion } from './completion';

export async function chat(options: {
  client: OpenAI;
  model: string;
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  tools?: (OpenAI.Chat.Completions.ChatCompletionTool & {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    functionImpl: (args: any) => unknown;
  })[];
  toolCallsHandler?: (
    toolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[],
  ) => Promise<OpenAI.Chat.Completions.ChatCompletionMessageParam[]>;
  round?: number;
}) {
  // options
  const { client, model, messages, tools, toolCallsHandler, round = 1 } = options;

  // print round divider
  console.log(
    `------------------------------------------------ Round ${round} ------------------------------------------------\n`,
  );

  // completion
  let currentToolCallIndex = 0;
  const completion = await createCompletion({
    client,
    model,
    tools,
    messages,
    onDeltaReasoningContent: ({ delta, counter }) => {
      if (counter === 0) {
        stdout.write('> (Reasoning)\n> \n> ');
      }
      stdout.write(delta.replaceAll('\n', '\n> '));
    },
    onDeltaContent: ({ delta }) => {
      stdout.write(delta);
    },
    onDeltaToolCall: ({ index, name, deltaArguments, counter }) => {
      if (index !== currentToolCallIndex) {
        currentToolCallIndex = index;
        stdout.write('\n\n');
      }
      if (counter === 0) {
        stdout.write(`> (Tool call: ${index})\n> name: ${name}\n> arguments: `);
      }
      stdout.write(deltaArguments);
    },
  });

  // print debug info
  console.log();
  console.log();
  console.log(usageToString(completion.usage));
  console.log(statsToString(completion.stats));
  console.log();

  // handle tool calls
  if (completion.toolCalls) {
    if (!toolCallsHandler) {
      throw new Error('No tool calls handler.');
    }
    const toolMessages = await toolCallsHandler(completion.toolCalls);
    messages.push(...toolMessages);
    chat({
      ...options,
      round: round + 1,
    });
  }
}
