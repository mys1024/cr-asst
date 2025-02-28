#!/usr/bin/env node

import { exit } from 'node:process';
import { program } from 'commander';
import { version } from '../package.json';
import { codeReview } from './code_review';
import { envOptions } from './env';
import type { CodeReviewOptions } from './types';

const options = program
  .version(version, '-v, --version', 'Show version.')
  .helpOption('-h, --help', 'Show help.')
  .requiredOption('-m, --model <model>', 'Model to use.', envOptions.model)
  .option(
    '-k, --api-key <key>',
    `API key for authentication.${envOptions.apiKey ? ' (default: retrieve from env)' : ''}`,
  )
  .option('-u, --base-url <url>', 'Base URL for the API.', envOptions.baseUrl)
  .option('-s, --diff-src <blob>', 'Git diff source blob.', envOptions.diffSrc || 'HEAD^')
  .option('-d, --diff-dst <blob>', 'Git diff destination blob.', envOptions.diffDst || 'HEAD')
  .option('-o, --output-file <file>', 'Save output to file.', envOptions.outputFile)
  .option(
    '-p, --prompt-file <fileOrBuiltinPrompt>',
    'Custom prompt file or builtin prompts (options: "en", "zh-cn", "zh-cn-nyan").',
    envOptions.promptFile || 'en',
  )
  .option(
    '-e, --exclude-paths <path...>',
    'Exclude paths.',
    envOptions.excludePaths || ['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock'],
  )
  .option(
    '--show [bool]',
    'Show on stdout.',
    (val) => val !== 'false',
    typeof envOptions.show === 'boolean' ? envOptions.show : true,
  )
  .option(
    '--show-reasoning [bool]',
    'Show reasoning.',
    (val) => val !== 'false',
    typeof envOptions.showReasoning === 'boolean' ? envOptions.showReasoning : false,
  )
  .option(
    '--show-debug [bool]',
    'Show debug info.',
    (val) => val !== 'false',
    typeof envOptions.showDebug === 'boolean' ? envOptions.showDebug : false,
  )
  .option(
    '--input-price <price>',
    'Price per million input tokens. For computing cost in debug mode.',
    parseFloat,
    typeof envOptions.inputPrice === 'number' ? envOptions.inputPrice : 0,
  )
  .option(
    '--output-price <price>',
    'Price per million output tokens. For computing cost in debug mode.',
    parseFloat,
    typeof envOptions.outputPrice === 'number' ? envOptions.outputPrice : 0,
  )
  .parse(process.argv)
  .opts<CodeReviewOptions>();

if (!options.apiKey) {
  if (envOptions.apiKey) {
    options.apiKey = envOptions.apiKey;
  } else {
    console.error("error: required option '-k, --api-key <key>' not specified");
    exit(1);
  }
}

codeReview(options);
