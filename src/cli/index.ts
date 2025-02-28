#!/usr/bin/env node

import { exit, stdin, argv } from 'node:process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { program } from 'commander';
import { version } from '../../package.json';
import { codeReview } from '../code_review';
import { envOptions } from './env';
import type { CodeReviewOptions } from '../types';

export async function cli() {
  // read diffs from stdin
  const diffs = await (async () => {
    if (stdin.isTTY) {
      return;
    }
    let data = '';
    for await (const chunk of stdin) {
      data += chunk;
    }
    return data;
  })();

  // cli options
  const options = program
    .version(version, '-v, --version', 'Show version.')
    .helpOption('-h, --help', 'Show help.')
    .requiredOption('-m, --model <model>', 'Model to use.', envOptions.model)
    .option(
      '-k, --api-key <key>',
      `API key for authentication.${envOptions.apiKey ? ' (default: retrieve from env)' : ''}`,
    )
    .option('-u, --base-url <url>', 'Base URL for the API.', envOptions.baseUrl)
    .option(
      '-d, --diffs-cmd <cmd>',
      'Command to get diffs for review.',
      envOptions.diffsCmd ||
        'git log --no-prefix -p -n 1 -- . :!package-lock.json :!pnpm-lock.yaml :!yarn.lock',
    )
    .option('-o, --output-file <file>', 'Save output to file.', envOptions.outputFile)
    .option(
      '-p, --prompt-file <fileOrBuiltinPrompt>',
      'Custom prompt file or builtin prompts (options: "en", "zh-cn", "zh-cn-nyan").',
      envOptions.promptFile || 'en',
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
    .parse(argv)
    .opts<CodeReviewOptions>();

  // ensure apiKey is provided
  if (!options.apiKey) {
    if (envOptions.apiKey) {
      options.apiKey = envOptions.apiKey;
    } else {
      console.error("error: required option '-k, --api-key <key>' not specified");
      exit(1);
    }
  }

  // run code review
  codeReview({
    diffs,
    ...options,
  });
}

// run cli if this file is the entrypoint
if (fileURLToPath(import.meta.url) === resolve(argv[1])) {
  cli();
}
