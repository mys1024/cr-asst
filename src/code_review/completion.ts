import { OpenAI } from 'openai';

type Delta = OpenAI.Chat.Completions.ChatCompletionChunk.Choice.Delta & {
  reasoning_content?: string;
};

export async function createCompletion(
  client: OpenAI,
  options: {
    model: string;
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  },
) {
  const { model, messages } = options;

  const stream = await client.chat.completions.create({
    stream: true,
    model,
    tool_choice: 'auto',
    tools: [
      {
        type: 'function',
        function: {
          name: 'get_weather',
          description: 'get weather info',
          parameters: {
            type: 'object',
            properties: { cities: { type: 'string[]', description: 'city names' } },
          },
        },
      },
    ],
    messages,
  });

  const totalDelta: Delta = {};

  // read completion stream
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta;

    if (!delta) {
      continue;
    }

    applyDelta(totalDelta, delta);
  }

  return totalDelta;
}

function applyDelta(dst: Delta, src: Delta) {
  if (src.role) {
    dst.role = src.role;
  }

  if (src.refusal) {
    dst.refusal = src.refusal;
  }

  if (src.content) {
    dst.content = (dst.content || '') + src.content;
  }

  if (src.reasoning_content) {
    dst.reasoning_content = (dst.reasoning_content || '') + src.reasoning_content;
  }

  if (src.tool_calls) {
    dst.tool_calls = dst.tool_calls || [];
    for (const srcToolCall of src.tool_calls) {
      const dstToolCall = dst.tool_calls[srcToolCall.index] || {
        index: srcToolCall.index,
      };
      dst.tool_calls[srcToolCall.index] = dstToolCall;

      if (srcToolCall.id) {
        dstToolCall.id = srcToolCall.id;
      }

      if (srcToolCall.type) {
        dstToolCall.type = srcToolCall.type;
      }

      if (srcToolCall.function) {
        const srcFunction = srcToolCall.function;
        const dstFunction = dstToolCall.function || {};
        dstToolCall.function = dstFunction;
        if (srcFunction.name) {
          dstFunction.name = srcFunction.name;
        }
        if (srcFunction.arguments) {
          dstFunction.arguments = (dstFunction.arguments || '') + srcFunction.arguments;
        }
      }
    }
  }
}
