import { OpenAI } from 'openai';

/* ------------------------------------------------ types ------------------------------------------------ */

export type CompletionUsage = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

export type CompletionStats = {
  startedAt: number;
  firstTokenReceivedAt: number;
  finishedAt: number;
  timeToFirstToken: number;
  timeToFinish: number;
  tokensPerSecond?: number;
};

export type ToolCall = {
  index: number;
  id: string;
  type: string;
  function: {
    name: string;
    arguments: string;
  };
};

type CompletionStream = AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>;

type OnDeltaReasoningContent = (args: { delta: string; counter: number }) => void;

type OnDeltaContent = (args: { delta: string; counter: number }) => void;

type OnDeltaToolCall = (args: {
  index: number;
  name: string;
  deltaArguments: string;
  counter: number;
}) => void;

/* ------------------------------------------------ createCompletion ------------------------------------------------ */

export async function createCompletion(options: {
  client: OpenAI;
  model: string;
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  tools?: OpenAI.Chat.Completions.ChatCompletionTool[];
  onDeltaReasoningContent?: OnDeltaReasoningContent;
  onDeltaContent?: OnDeltaContent;
  onDeltaToolCall?: OnDeltaToolCall;
}) {
  const {
    client,
    model,
    messages,
    tools,
    onDeltaReasoningContent,
    onDeltaContent,
    onDeltaToolCall,
  } = options;

  const stream = await client.chat.completions.create({
    stream: true,
    model,
    messages,
    tools,
  });

  const completion = await readCompletionStream({
    stream,
    onDeltaReasoningContent,
    onDeltaContent,
    onDeltaToolCall,
  });

  return completion;
}

/* ------------------------------------------------ readCompletionStream ------------------------------------------------ */

async function readCompletionStream(options: {
  stream: CompletionStream;
  onDeltaReasoningContent?: OnDeltaReasoningContent;
  onDeltaContent?: OnDeltaContent;
  onDeltaToolCall?: OnDeltaToolCall;
}) {
  const { stream, onDeltaReasoningContent, onDeltaContent, onDeltaToolCall } = options;

  let reasoningContent: string | undefined;
  let reasoningContentCounter = 0;
  let content: string | undefined;
  let contentCounter = 0;
  let toolCalls: ToolCall[] | undefined;
  const toolCallsCounter = new Map<number, number>();
  let finishReason: OpenAI.Chat.Completions.ChatCompletionChunk.Choice['finish_reason'] = null;
  let usage: CompletionUsage | undefined;
  const stats: CompletionStats = {
    startedAt: Date.now(),
    firstTokenReceivedAt: 0,
    finishedAt: 0,
    timeToFirstToken: 0,
    timeToFinish: 0,
  };

  for await (const chunk of stream) {
    if (chunk.usage) {
      usage = {
        promptTokens: chunk.usage.prompt_tokens,
        completionTokens: chunk.usage.completion_tokens,
        totalTokens: chunk.usage.total_tokens,
      };
    }

    if (stats.firstTokenReceivedAt === 0) {
      stats.firstTokenReceivedAt = Date.now();
    }

    const choice = chunk.choices[0];
    if (!choice) {
      continue;
    }

    if (choice.finish_reason) {
      finishReason = choice.finish_reason;
    }

    const delta = choice.delta as OpenAI.Chat.Completions.ChatCompletionChunk.Choice.Delta & {
      reasoning_content?: string;
    };

    if (!delta) {
      continue;
    }

    if (typeof delta.reasoning_content === 'string') {
      reasoningContent = (reasoningContent || '') + delta.reasoning_content;
      onDeltaReasoningContent?.({
        delta: delta.reasoning_content,
        counter: reasoningContentCounter,
      });
      reasoningContentCounter++;
    }

    if (typeof delta.content === 'string') {
      content = (content || '') + delta.content;
      onDeltaContent?.({
        delta: delta.content,
        counter: contentCounter,
      });
      contentCounter++;
    }

    if (delta.tool_calls) {
      toolCalls = toolCalls || [];
      for (const toolCallChunk of delta.tool_calls) {
        toolCalls[toolCallChunk.index] = toolCalls[toolCallChunk.index] || {
          index: toolCallChunk.index,
          id: '',
          type: '',
          function: {
            name: '',
            arguments: '',
          },
        };
        const toolCall = toolCalls[toolCallChunk.index];
        if (toolCallChunk.id) {
          toolCall.id = toolCallChunk.id;
        }
        if (toolCallChunk.type) {
          toolCall.type = toolCallChunk.type;
        }
        if (toolCallChunk.function?.name) {
          toolCall.function.name = toolCallChunk.function.name;
        }
        if (toolCallChunk.function?.arguments) {
          toolCall.function.arguments += toolCallChunk.function.arguments;
        }
        const counter = toolCallsCounter.get(toolCallChunk.index) || 0;
        onDeltaToolCall?.({
          index: toolCallChunk.index,
          name: toolCall.function.name,
          deltaArguments: toolCallChunk.function?.arguments || '',
          counter: counter,
        });
        toolCallsCounter.set(toolCallChunk.index, counter + 1);
      }
    }
  }

  stats.finishedAt = Date.now();
  stats.timeToFirstToken = stats.firstTokenReceivedAt - stats.startedAt;
  stats.timeToFinish = stats.finishedAt - stats.startedAt;
  if (usage) {
    stats.tokensPerSecond = usage.completionTokens / (stats.timeToFinish / 1000);
  }

  return {
    reasoningContent,
    content,
    toolCalls,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    finishReason: finishReason!,
    usage,
    stats,
  };
}
