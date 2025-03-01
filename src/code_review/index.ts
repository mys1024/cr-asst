import { stdout } from 'node:process';
import { writeFile, appendFile } from 'node:fs/promises';
import OpenAI from 'openai';
import { execa } from 'execa';
import { getPrompt } from './prompts/index';
import type { CodeReviewOptions } from '../types';

export async function codeReview(options: CodeReviewOptions) {
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
    inputPrice = 0,
    outputPrice = 0,
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

  // clear output file
  if (outputFile) {
    await writeFile(outputFile, '');
  }

  // init variables
  let reasoningContent = '';
  let content = '';
  let usage = {
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    inputCost: 0,
    outputCost: 0,
    totalCost: 0,
  };

  // create completion stream
  const stream = await client.chat.completions.create({
    stream: true,
    model,
    messages: [{ role: 'user', content: prompt }],
  });

  // read completion stream
  for await (const chunk of stream) {
    // read reasoning content
    const reasoningContentChunk = (chunk.choices[0]?.delta as { reasoning_content?: string })
      ?.reasoning_content;
    if (reasoningContentChunk) {
      if (print && printReasoning && !reasoningContent) {
        stdout.write('> (Reasoning)\n> \n> ');
      }
      reasoningContent += reasoningContentChunk;
      if (print && printReasoning) {
        stdout.write(reasoningContentChunk.replaceAll('\n', '\n> '));
      }
    }

    // read content
    const contentChunk = chunk.choices[0]?.delta?.content;
    if (contentChunk) {
      content += contentChunk;
      if (print) {
        stdout.write(contentChunk);
      }
      if (outputFile) {
        await appendFile(outputFile, contentChunk);
      }
    }

    // update usage
    if (chunk.usage) {
      usage = {
        inputTokens: chunk.usage.prompt_tokens,
        outputTokens: chunk.usage.completion_tokens,
        totalTokens: chunk.usage.total_tokens,
        inputCost: (inputPrice * usage.inputTokens) / 1_000_000,
        outputCost: (outputPrice * usage.outputTokens) / 1_000_000,
        totalCost:
          (inputPrice * usage.inputTokens) / 1_000_000 +
          (outputPrice * usage.outputTokens) / 1_000_000,
      };
    }
  }

  // print end line
  if (print) {
    console.log();
  }

  // print debug info
  if (printDebug) {
    console.log();
    console.log(
      '[USAGE]',
      Object.entries(usage)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', '),
    );
  }

  // return
  return {
    reasoningContent,
    content,
    usage,
    diffs,
  };
}
