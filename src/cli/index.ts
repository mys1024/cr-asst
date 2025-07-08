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
      '-e, --exclude <files_or_dirs>',
      'Files and directories to exclude from review, separated by commas.',
      envOptions.exclude || 'package-lock.json,pnpm-lock.yaml,yarn.lock',
    )
    .option('-o, --output-file <file>', 'Save review result to file.', envOptions.outputFile)
    .option(
      '-p, --prompt-file <fileOrBuiltinPrompt>',
      'Path to a custom prompt file, or a builtin prompt (options: "en", "zh-cn").',
      envOptions.promptFile || 'en',
    )
    .option(
      '--print [bool]',
      'Print review result to stdout.',
      (val) => val !== 'false',
      typeof envOptions.print === 'boolean' ? envOptions.print : true,
    )
    .option(
      '--print-debug [bool]',
      'Print debug information to stdout.',
      (val) => val !== 'false',
      typeof envOptions.printDebug === 'boolean' ? envOptions.printDebug : false,
    )
    .version(version, '-v, --version', 'Print version.')
    .helpOption('-h, --help', 'Print help.')
    .parse(argv)
    .opts<CodeReviewCliOptions>();

  // convert cli options to code review options
  const { exclude, ...cliOptionsRest } = cliOptions;
  const options: CodeReviewOptions = {
    ...cliOptionsRest,
    exclude: exclude?.split(','),
  };

  // run code review
  codeReview(options);
}

(async () => {
  if ((await realpath(argv[1])) === fileURLToPath(import.meta.url)) {
    cli();
  }
})();
