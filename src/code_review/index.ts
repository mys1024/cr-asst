import { stdout } from 'node:process';
import { writeFile } from 'node:fs/promises';
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { createXai } from '@ai-sdk/xai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { execa } from 'execa';
import { getPrompt } from './prompts/index';
import { usageToString, statsToString } from './utils';
import type { CodeReviewOptions, CodeReviewResult, CompletionStats } from '../types';

export async function codeReview(options: CodeReviewOptions): Promise<CodeReviewResult> {
  // options
  const {
    provider = 'openai',
    baseUrl,
    model,
    apiKey,
    diffsCmd = 'git log --no-prefix -p -n 1 -- . :!package-lock.json :!pnpm-lock.yaml :!yarn.lock',
    outputFile,
    promptFile = 'en',
    print = false,
    printReasoning = false,
    printDebug = false,
  } = options;

  // get diffs
  const diffs = options.diffs
    ? options.diffs
    : await (async () => {
        const cmdArr = diffsCmd.split(' ').filter((v) => !!v);
        const { stdout } = await execa(cmdArr[0], cmdArr.slice(1));
        return stdout;
      })();

  // get prompt
  const prompt = await getPrompt(promptFile, {
    $DIFFS: diffs,
  });

  // init stats
  const stats: CompletionStats = {
    startedAt: Date.now(),
    firstTokenReceivedAt: 0,
    finishedAt: 0,
    timeToFirstToken: 0,
    timeToFinish: 0,
  };

  // get review result
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
  const result = streamText({
    model: providerInst(model),
    prompt,
  });

  // print review delta and update stats
  let textPartCnt = 0;
  let reasoningPartCnt = 0;
  for await (const streamPart of result.fullStream) {
    if (!stats.firstTokenReceivedAt) {
      stats.firstTokenReceivedAt = Date.now();
    }
    if (streamPart.type === 'text-delta') {
      if (print) {
        if (textPartCnt === 0 && reasoningPartCnt > 0 && printReasoning) {
          stdout.write('\n');
        }
        stdout.write(streamPart.textDelta);
      }
      textPartCnt++;
    } else if (streamPart.type === 'reasoning' && printReasoning) {
      if (print) {
        if (reasoningPartCnt === 0) {
          stdout.write('> (Reasoning)\n> \n> ');
        }
        stdout.write(streamPart.textDelta.replaceAll('\n', '\n> '));
      }
      reasoningPartCnt++;
    }
  }
  if (print && (textPartCnt > 0 || reasoningPartCnt > 0)) {
    stdout.write('\n');
  }
  stats.finishedAt = Date.now();
  stats.timeToFirstToken = stats.firstTokenReceivedAt - stats.startedAt;
  stats.timeToFinish = stats.finishedAt - stats.startedAt;
  if (await result.usage) {
    stats.tokensPerSecond = (await result.usage).completionTokens / (stats.timeToFinish / 1000);
  }

  // extract data from result
  const text = await result.text;
  const reasoning = await result.reasoning;
  const usage = await result.usage;

  // print debug info
  if (printDebug) {
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
      diffs,
      stats,
      usage,
    },
  };
}
