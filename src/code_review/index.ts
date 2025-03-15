import { stdout } from 'node:process';
import { writeFile, appendFile } from 'node:fs/promises';
import OpenAI from 'openai';
import { execa } from 'execa';
import { getPrompt } from './prompts/index';
import { usageToString, statsToString } from './utils';
import { createCompletion } from './ai/completion';
import type { CodeReviewOptions, CodeReviewResult } from '../types';

export async function codeReview(options: CodeReviewOptions): Promise<CodeReviewResult> {
  // options
  const {
    model,
    apiKey,
    baseUrl,
    diffsCmd = 'git log --no-prefix -p -n 1 -- . :!package-lock.json :!pnpm-lock.yaml :!yarn.lock',
    outputFile,
    promptFile = 'en',
    print = false,
    printReasoning = false,
    printDebug = false,
  } = options;

  // create openai client
  const client = new OpenAI({
    baseURL: baseUrl,
    apiKey,
  });

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

  // review
  const completion = await createCompletion({
    client,
    model,
    messages: [{ role: 'user', content: prompt }],
    onDeltaReasoningContent: ({ delta, counter }) => {
      if (print && printReasoning) {
        if (counter === 0) {
          stdout.write('> (Reasoning)\n> \n> ');
        }
        stdout.write(delta.replaceAll('\n', '\n> '));
      }
    },
    onDeltaContent: async ({ delta, counter }) => {
      if (counter === 0 && outputFile) {
        await writeFile(outputFile, ''); // clear output file
      }
      if (print) {
        stdout.write(delta);
      }
      if (outputFile) {
        await appendFile(outputFile, delta);
      }
    },
  });

  // print end line
  if (print) {
    console.log();
  }

  // print debug info
  if (printDebug) {
    console.log();
    console.log(usageToString(completion.usage));
    console.log(statsToString(completion.stats));
  }

  // return
  return {
    reasoningContent: completion.reasoningContent,
    content: completion.content || '',
    debug: {
      diffs,
      stats: completion.stats,
      usage: completion.usage,
    },
  };
}
