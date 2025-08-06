import { stdout } from 'node:process';
import { inspect } from 'node:util';
import { fetch, ProxyAgent } from 'undici';
import {
  streamText,
  type LanguageModel,
  type ToolSet,
  type ToolChoice,
  type ModelMessage,
} from 'ai';
import { createOpenAI, type OpenAIProviderSettings } from '@ai-sdk/openai';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { createXai } from '@ai-sdk/xai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import type { CodeReviewOptions, CompletionStats, CompletionUsage } from '../types';
import { usageToString, statsToString, getHttpProxyUrl } from './utils';

export function initModel(options: CodeReviewOptions): LanguageModel {
  // options
  const { provider = 'openai', baseUrl, model: modelId, apiKey } = options;

  // provider options
  const httpProxyUrl = getHttpProxyUrl();
  const providerOptions: OpenAIProviderSettings = {
    apiKey,
    baseURL: baseUrl,
    fetch: (req, options) =>
      fetch(req as string, {
        ...options,
        dispatcher: httpProxyUrl ? new ProxyAgent(httpProxyUrl) : undefined, // support system proxy
      }),
  };

  // init model
  const model = (() => {
    switch (provider) {
      case 'openai':
        return createOpenAI(providerOptions)(modelId);
      case 'openai-chat':
        return createOpenAI(providerOptions).chat(modelId);
      case 'deepseek':
        return createDeepSeek(providerOptions)(modelId);
      case 'xai':
        return createXai(providerOptions)(modelId);
      case 'anthropic':
        return createAnthropic(providerOptions)(modelId);
      case 'google':
        return createGoogleGenerativeAI(providerOptions)(modelId);
      default:
        return createOpenAI(providerOptions)(modelId);
    }
  })();

  // return
  return model;
}

export async function callModel<TOOLS extends ToolSet>(options: {
  model: LanguageModel;
  messages: ModelMessage[];
  print?: boolean;
  tools?: TOOLS;
  toolChoice?: ToolChoice<TOOLS>;
  prepareStep?: Parameters<typeof streamText<TOOLS>>[0]['prepareStep'];
  stopWhen?: Parameters<typeof streamText<TOOLS>>[0]['stopWhen'];
  temperature?: number;
  topP?: number;
  topK?: number;
}) {
  // options
  const {
    model,
    messages,
    print,
    tools,
    toolChoice,
    prepareStep,
    stopWhen,
    temperature,
    topP,
    topK,
  } = options;

  // call model
  const result = streamText({
    model,
    messages,
    tools,
    toolChoice,
    prepareStep,
    stopWhen,
    temperature,
    topP,
    topK,
    onError: ({ error }) => {
      throw new Error('failed to call the model', { cause: error });
    },
  });

  // init stats
  const stats: CompletionStats = {
    startedAt: Date.now(),
    firstTokenReceivedAt: 0,
    finishedAt: 0,
    timeToFirstToken: 0,
    timeToFinish: 0,
  };

  // print review result stream
  let stepCnt = 0;
  let textPartCnt = 0;
  let reasoningPartCnt = 0;
  for await (const streamPart of result.fullStream) {
    if (streamPart.type === 'start-step') {
      if (print) {
        console.log(
          `------------------------------------------------ step ${stepCnt} ------------------------------------------------\n`,
        );
      }
      if (!stats.firstTokenReceivedAt) {
        stats.firstTokenReceivedAt = Date.now();
      }
      textPartCnt = 0;
      reasoningPartCnt = 0;
      stepCnt++;
    } else if (streamPart.type === 'finish-step') {
      if (print) {
        console.log();
      }
    } else if (streamPart.type === 'text-delta') {
      if (print) {
        if (textPartCnt === 0 && reasoningPartCnt > 0) {
          stdout.write('\n');
        }
        stdout.write(streamPart.text);
      }
      textPartCnt++;
    } else if (streamPart.type === 'reasoning-delta') {
      if (print) {
        if (reasoningPartCnt === 0) {
          stdout.write('> (Reasoning)\n> \n> ');
        }
        stdout.write(streamPart.text.replaceAll('\n', '\n> '));
      }
      reasoningPartCnt++;
    } else if (streamPart.type === 'tool-call' && print) {
      if (textPartCnt > 0 || reasoningPartCnt > 0) {
        console.log();
      }
      console.log(inspect(streamPart, { depth: Infinity, maxStringLength: 256, colors: true }));
    } else if (streamPart.type === 'tool-result' && print) {
      console.log(inspect(streamPart, { depth: Infinity, maxStringLength: 256, colors: true }));
    }
  }

  // destructure result
  const steps = await result.steps;
  const lastStep = steps[steps.length - 1];
  const text = lastStep.text;
  const reasoning = lastStep.reasoning;
  const usage: CompletionUsage = await result.usage;

  // update usage
  if (typeof usage.inputTokens === 'number' && typeof usage.cachedInputTokens === 'number') {
    usage.uncachedInputTokens = usage.inputTokens - usage.cachedInputTokens;
  }

  // update stats
  stats.finishedAt = Date.now();
  stats.timeToFirstToken = stats.firstTokenReceivedAt - stats.startedAt;
  stats.timeToFinish = stats.finishedAt - stats.startedAt;
  if (usage.outputTokens) {
    stats.tokensPerSecond = usage.outputTokens / (stats.timeToFinish / 1000);
  }

  // print debug info
  if (print) {
    console.log();
    console.log(usageToString(usage));
    console.log(statsToString(stats));
  }

  // get all messages
  const allMessages: ModelMessage[] = [...messages, ...(await result.response).messages];

  // return
  return {
    text,
    reasoning: reasoning.map((r) => r.text).join('\n'),
    messages: allMessages,
    usage,
    stats,
  };
}
