import { writeFile, appendFile } from 'node:fs/promises';
import OpenAI from 'openai';
import { gitShow, readPromptFile } from './utils';
import type { CodeReviewOptions } from './types';

/* ------------------------------------------------ code review ------------------------------------------------ */

export async function codeReview(options: CodeReviewOptions) {
  // options
  const {
    model,
    apiKey,
    baseUrl,
    outputFile,
    excludePaths = ['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock'],
    promptFile = 'en',
    show = true,
    showReasoning,
    showDebug,
    inputFee = 0,
    outputFee = 0,
  } = options;

  // client
  const client = new OpenAI({
    baseURL: baseUrl,
    apiKey,
  });

  // read the latest commit
  const gitShowOutput = await gitShow(excludePaths);

  // generate prompt
  const prompt = await readPromptFile(promptFile, {
    $GIT_SHOW: gitShowOutput,
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
    inputFee: 0,
    outputFee: 0,
    totalFee: 0,
  };
  for await (const chunk of stream) {
    // reasoning content
    let reasoningContentChunk = (chunk.choices[0]?.delta as { reasoning_content?: string })
      ?.reasoning_content;
    if (showReasoning && reasoningContentChunk) {
      if (!hasReasoning) {
        hasReasoning = true;
        if (show) {
          process.stdout.write('> (Reasoning)\n> \n> ');
        }
        if (outputFile) {
          await appendFile(outputFile, '> (Reasoning)\n> \n> ');
        }
      }
      reasoningContentChunk = reasoningContentChunk.replaceAll('\n', '\n> ');
      reasoningContent += reasoningContentChunk;
      if (show) {
        process.stdout.write(reasoningContentChunk);
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
        process.stdout.write(contentChunk);
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
        inputFee: (inputFee * usage.inputTokens) / 1_000_000,
        outputFee: (outputFee * usage.outputTokens) / 1_000_000,
        totalFee:
          (inputFee * usage.inputTokens) / 1_000_000 + (outputFee * usage.outputTokens) / 1_000_000,
      };
    }
  }

  // print the end line
  if (show) {
    process.stdout.write('\n');
  }
  if (outputFile) {
    await appendFile(outputFile, '\n');
  }

  // print debug info
  if (showDebug) {
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
