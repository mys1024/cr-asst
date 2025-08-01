#!/usr/bin/env node

import { argv } from 'node:process';
import { fileURLToPath } from 'node:url';
import { realpath } from 'node:fs/promises';
import { program } from 'commander';
import { version } from '../../package.json';
import { codeReview } from '../code_review';
import { envOptions } from './env';
import type { CodeReviewOptions, CodeReviewCliOptions } from '../types';

export async function cli() {
  // cli options
  const cliOptions = program
    .name('cr-asst')
    .option(
      '-P, --provider <provider>',
      'AI service provider (options: "openai", "deepseek", "xai", "anthropic", "google").',
      envOptions.provider || 'openai',
    )
    .option('-u, --base-url <url>', 'Base URL for the AI service API.', envOptions.baseUrl)
    .requiredOption('-k, --api-key <key>', 'API key for the AI service.', envOptions.apiKey)
    .requiredOption('-m, --model <model>', 'AI model to use for review.', envOptions.model)
    .option('-H, --head-ref <ref>', 'Head ref to compare with.', envOptions.headRef || 'HEAD')
    .option('-b, --base-ref <ref>', 'Base ref to compare against.', envOptions.baseRef || 'HEAD^')
    .option(
      '-i, --include <paths>',
      'Files and directories to include in review, separated by commas.',
      envOptions.include || '.',
    )
    .option(
      '-e, --exclude <paths>',
      'Files and directories to exclude from review, separated by commas.',
      envOptions.exclude || 'package-lock.json,pnpm-lock.yaml,yarn.lock',
    )
    .option(
      '-o, --output-file <path>',
      'Path to a file to save review result.',
      envOptions.outputFile,
    )
    .option(
      '-p, --prompt-file <path_or_builtin_prompt>',
      'Path to a custom prompt file, or a builtin prompt (options: "en", "zh-cn").',
      envOptions.promptFile || 'en',
    )
    .option(
      '--system-prompt-file <path>',
      'Path to a custom system prompt file.',
      envOptions.systemPromptFile,
    )
    .option(
      '--disable-tools [bool]',
      'Whether to disable tools.',
      (val) => val !== 'false',
      typeof envOptions.disableTools === 'boolean' ? envOptions.disableTools : false,
    )
    .option(
      '--max-steps <int>',
      'Maximum number of AI model calls.',
      (val) => parseInt(val),
      typeof envOptions.maxSteps === 'number' ? envOptions.maxSteps : 32,
    )
    .option(
      '--temperature <float>',
      'Temperature for the AI model.',
      (val) => parseInt(val),
      typeof envOptions.temperature === 'number' ? envOptions.temperature : undefined,
    )
    .option(
      '--top-p <float>',
      'Top P for the AI model.',
      (val) => parseInt(val),
      typeof envOptions.topP === 'number' ? envOptions.topP : undefined,
    )
    .option(
      '--top-k <int>',
      'Top K for the AI model.',
      (val) => parseInt(val),
      typeof envOptions.topK === 'number' ? envOptions.topK : undefined,
    )
    .option(
      '--print [bool]',
      'Whether to print review result to stdout.',
      (val) => val !== 'false',
      typeof envOptions.print === 'boolean' ? envOptions.print : true,
    )
    .option(
      '--approval-check [bool]',
      'Experimental. Whether to enable approval check.',
      (val) => val !== 'false',
      typeof envOptions.approvalCheck === 'boolean' ? envOptions.approvalCheck : false,
    )
    .option(
      '--approval-check-prompt <prompt>',
      'Experimental. Custom approval check prompt.',
      envOptions.approvalCheckPrompt,
    )
    .option(
      '--approval-check-prompt-file <path>',
      'Experimental. Path to a custom approval check prompt file.',
      envOptions.approvalCheckPromptFile,
    )
    .version(version, '-v, --version', 'Print version.')
    .helpOption('-h, --help', 'Print help.')
    .parse(argv)
    .opts<CodeReviewCliOptions>();

  // convert cli options to code review options
  const {
    include,
    exclude,
    approvalCheck,
    approvalCheckPrompt,
    approvalCheckPromptFile,
    ...cliOptionsRest
  } = cliOptions;
  const options: CodeReviewOptions = {
    ...cliOptionsRest,
    include: include?.split(','),
    exclude: exclude?.split(','),
    approvalCheck: !approvalCheck
      ? false
      : approvalCheckPrompt || approvalCheckPromptFile
        ? {
            prompt: approvalCheckPrompt,
            promptFile: approvalCheckPromptFile,
          }
        : true,
  };

  // run code review
  codeReview(options);
}

(async () => {
  if ((await realpath(argv[1])) === fileURLToPath(import.meta.url)) {
    cli();
  }
})();
