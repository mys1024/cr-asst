import { stdout } from 'node:process';
import { inspect } from 'node:util';
import { writeFile } from 'node:fs/promises';
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { createXai } from '@ai-sdk/xai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import type { CodeReviewOptions, CodeReviewResult, CompletionStats } from '../types';
import { getUserPrompt, getSystemPrompt } from './prompts/index';
import { usageToString, statsToString, runCmd } from './utils';
import { tools } from './tools';

export async function codeReview(options: CodeReviewOptions): Promise<CodeReviewResult> {
  // options
  const {
    provider = 'openai',
    baseUrl,
    model,
    apiKey,
    baseRef = 'HEAD^',
    headRef = 'HEAD',
    exclude = ['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock'],
    outputFile,
    promptFile = 'en',
    systemPromptFile,
    disableTools = false,
    maxSteps = 32,
    print = false,
  } = options;

  // get diffs
  const diffArgs = ['diff', `${baseRef}...${headRef}`, '--', '.', ...exclude.map((v) => `:!${v}`)];
  const diffsCmd = `git ${diffArgs.join(' ')}`;
  if (print) {
    console.log(`[DIFFS_CMD] ${diffsCmd}\n`);
  }
  const diffs = await runCmd('git', diffArgs);

  // init stats
  const stats: CompletionStats = {
    startedAt: Date.now(),
    firstTokenReceivedAt: 0,
    finishedAt: 0,
    timeToFirstToken: 0,
    timeToFinish: 0,
  };

  // init provider
  const providerInst = (
    provider === 'openai'
      ? createOpenAI
      : provider === 'deepseek'
        ? createDeepSeek
        : provider === 'xai'
          ? createXai
          : provider === 'anthropic'
            ? createAnthropic
            : provider === 'google'
              ? createGoogleGenerativeAI
              : createOpenAI
  )({
    apiKey,
    baseURL: baseUrl,
  });

  // generate review result
  const result = streamText({
    model: providerInst(model),
    tools: disableTools ? undefined : tools,
    messages: [
      {
        role: 'system',
        content: await getSystemPrompt({
          systemPromptFile,
          disableTools,
          diffs,
          baseRef,
          headRef,
        }),
      },
      { role: 'user', content: await getUserPrompt(promptFile) },
    ],
    maxSteps: disableTools ? 1 : maxSteps,
    onError: ({ error }) => {
      throw new Error('code review failed', { cause: error });
    },
  });

  // print review result stream
  let stepCnt = 0;
  let textPartCnt = 0;
  let reasoningPartCnt = 0;
  for await (const streamPart of result.fullStream) {
    if (!stats.firstTokenReceivedAt) {
      stats.firstTokenReceivedAt = Date.now();
    }
    if (streamPart.type === 'step-start') {
      if (print) {
        console.log(
          `------------------------------------------------ step ${stepCnt} ------------------------------------------------\n`,
        );
      }
      textPartCnt = 0;
      reasoningPartCnt = 0;
      stepCnt++;
    } else if (streamPart.type === 'step-finish') {
      if (print) {
        console.log();
      }
    } else if (streamPart.type === 'text-delta') {
      if (print) {
        if (textPartCnt === 0 && reasoningPartCnt > 0) {
          stdout.write('\n');
        }
        stdout.write(streamPart.textDelta);
      }
      textPartCnt++;
    } else if (streamPart.type === 'reasoning') {
      if (print) {
        if (reasoningPartCnt === 0) {
          stdout.write('> (Reasoning)\n> \n> ');
        }
        stdout.write(streamPart.textDelta.replaceAll('\n', '\n> '));
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

  // destructure result and update stats
  const steps = await result.steps;
  const lastStep = steps[steps.length - 1];
  const text = lastStep.text;
  const reasoning = lastStep.reasoning;
  const usage = await result.usage;
  stats.finishedAt = Date.now();
  stats.timeToFirstToken = stats.firstTokenReceivedAt - stats.startedAt;
  stats.timeToFinish = stats.finishedAt - stats.startedAt;
  if (usage) {
    stats.tokensPerSecond = usage.completionTokens / (stats.timeToFinish / 1000);
  }

  // print debug info
  if (print) {
    console.log();
    console.log(usageToString(usage));
    console.log(statsToString(stats));
  }

  // write output file
  if (outputFile) {
    await writeFile(outputFile, text);
  }

  // return
  return {
    content: text,
    reasoningContent: reasoning,
    debug: {
      diffsCmd,
      diffs,
      stats,
      usage,
    },
  };
}
