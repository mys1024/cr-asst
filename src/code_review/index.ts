import { stdout } from 'node:process';
import { writeFile, appendFile } from 'node:fs/promises';
import OpenAI from 'openai';
import { execa } from 'execa';
import { getPrompt } from './prompts/index';
import type { CodeReviewOptions } from '../types';

/* ------------------------------------------------ code review ------------------------------------------------ */

export async function codeReview(options: CodeReviewOptions) {
  // options
  const {
    model,
    apiKey,
    baseUrl,
    diffsCmd = 'git log --no-prefix -p -n 1 -- . :!package-lock.json :!pnpm-lock.yaml :!yarn.lock',
    outputFile,
    promptFile = 'en',
    show = false,
    showReasoning = false,
    showDebug = false,
    inputPrice = 0,
    outputPrice = 0,
  } = options;

  // openai client
  const client = new OpenAI({
    baseURL: baseUrl,
    apiKey,
  });

  // get diffs
  const cmdArr = diffsCmd.split(' ').filter((v) => !!v);
  const { stdout: diffs } = await execa(cmdArr[0], cmdArr.slice(1));

  // get prompt
  const prompt = await getPrompt(promptFile, {
    $DIFFS: diffs,
  });

  // clear the output file
  if (outputFile) {
    await writeFile(outputFile, '');
  }

  // call completions api
  const stream = await client.chat.completions.create({
    stream: true,
    model,
    messages: [{ role: 'user', content: prompt }],
  });

  // read completions api response stream
  let content = '';
  let reasoningContent = '';
  let hasReasoning = false;
  let usage = {
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    inputCost: 0,
    outputCost: 0,
    totalCost: 0,
  };
  for await (const chunk of stream) {
    // reasoning content
    let reasoningContentChunk = (chunk.choices[0]?.delta as { reasoning_content?: string })
      ?.reasoning_content;
    if (showReasoning && reasoningContentChunk) {
      if (!hasReasoning) {
        hasReasoning = true;
        if (show) {
          stdout.write('> (Reasoning)\n> \n> ');
        }
        if (outputFile) {
          await appendFile(outputFile, '> (Reasoning)\n> \n> ');
        }
      }
      reasoningContentChunk = reasoningContentChunk.replaceAll('\n', '\n> ');
      reasoningContent += reasoningContentChunk;
      if (show) {
        stdout.write(reasoningContentChunk);
      }
      if (outputFile) {
        await appendFile(outputFile, reasoningContentChunk);
      }
    }
    // content
    const contentChunk = chunk.choices[0]?.delta?.content;
    if (contentChunk) {
      content += contentChunk;
      if (show) {
        stdout.write(contentChunk);
      }
      if (outputFile) {
        await appendFile(outputFile, contentChunk);
      }
    }
    // usage
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

  // print the end line
  if (show) {
    stdout.write('\n');
  }
  if (outputFile) {
    await appendFile(outputFile, '\n');
  }

  // print debug info
  if (showDebug) {
    console.log();
    console.log('DEBUG INFO:');
    console.log();
    console.log('usage:', usage);
  }

  // return
  return {
    reasoningContent,
    content,
    usage,
  };
}
