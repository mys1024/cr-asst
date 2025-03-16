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
  handleToolCalls?: (
    toolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[],
  ) => Promise<OpenAI.Chat.Completions.ChatCompletionMessageParam[]>;
  invisibleMessageIndex?: number;
}) {
  // options
  const { client, model, messages, tools, handleToolCalls } = options;
  let { invisibleMessageIndex = 0 } = options;

  // print input messages
  for (; invisibleMessageIndex < messages.length; invisibleMessageIndex++) {
    console.log(
      `\n------------------------------------------------ Message ${invisibleMessageIndex + 1} ------------------------------------------------\n`,
    );
    const message = messages[invisibleMessageIndex];
    console.log(`[role] ${message.role}`);
    if (message.role === 'tool') {
      console.log(`[tool_call_id] ${message.tool_call_id}`);
    }
    if (message.role === 'assistant') {
      message.tool_calls?.forEach((toolCall, index) => {
        console.log(
          `[tool_call] index: ${index}, tool_call_id: ${toolCall.id}, function_name: ${toolCall.function.name}, arguments: ${toolCall.function.arguments}`,
        );
      });
    }
    if (message.content) {
      console.log(`[content] ${message.content}`);
    }
  }

  // completion
  console.log(
    `\n------------------------------------------------ Message ${invisibleMessageIndex + 1} ------------------------------------------------\n`,
  );
  let currentToolCallIndex = 0;
  const completion = await createCompletion({
    client,
    model,
    tools,
    messages,
    onDeltaReasoningContent: ({ role, delta, counter }) => {
      if (counter === 0) {
        stdout.write(`[role] ${role}\n`);
        stdout.write('[reasoning_content] ');
      }
      stdout.write(delta);
    },
    onDeltaContent: ({ role, delta, counter }) => {
      if (counter === 0) {
        stdout.write(`[role] ${role}\n`);
        stdout.write('[content] ');
      }
      stdout.write(delta);
    },
    onDeltaToolCall: ({ role, index, id, name, deltaArguments, counter }) => {
      if (index !== currentToolCallIndex) {
        currentToolCallIndex = index;
        stdout.write('\n');
      }
      if (counter === 0) {
        if (currentToolCallIndex === 0) {
          stdout.write(`[role] ${role}\n`);
        }
        stdout.write(
          `[tool_call] index: ${index}, tool_call_id: ${id}, function_name: ${name}, arguments: `,
        );
      }
      stdout.write(deltaArguments);
    },
  });

  // print usage and stats
  console.log();
  console.log();
  console.log(usageToString(completion.usage));
  console.log(statsToString(completion.stats));

  // handle tool calls
  if (completion.toolCalls) {
    if (!handleToolCalls) {
      throw new Error('No tool calls handler.');
    }
    const asstMessage: OpenAI.Chat.Completions.ChatCompletionMessageParam = {
      role: 'assistant',
      content: completion.content,
      tool_calls: completion.toolCalls,
    };
    const toolMessages = await handleToolCalls(completion.toolCalls);
    messages.push(asstMessage, ...toolMessages);
    await chat({
      ...options,
      invisibleMessageIndex: invisibleMessageIndex + 1,
    });
  }
}
