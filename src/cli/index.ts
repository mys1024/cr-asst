#!/usr/bin/env node

import { exit, stdin, argv } from 'node:process';
import { fileURLToPath } from 'node:url';
import { program } from 'commander';
import { version } from '../../package.json';
import { play } from '../code_review/play';
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
    .name('cr-asst')
    .requiredOption('-m, --model <model>', 'AI Model to use for review.', envOptions.model)
    .option(
      '-k, --api-key <key>',
      `API key for the AI service.${envOptions.apiKey ? ' (default: retrieve from env)' : ''}`,
    )
    .option('-u, --base-url <url>', 'Base URL for the AI service API.', envOptions.baseUrl)
    .option(
      '-d, --diffs-cmd <cmd>',
      'Command to get code diffs for review.',
      envOptions.diffsCmd ||
        'git log --no-prefix -p -n 1 -- . :!package-lock.json :!pnpm-lock.yaml :!yarn.lock',
    )
    .option('-o, --output-file <file>', 'Save review result to file.', envOptions.outputFile)
    .option(
      '-p, --prompt-file <fileOrBuiltinPrompt>',
      'Path to a custom prompt file, or a builtin prompt (options: "en", "zh-cn", "zh-cn-nyan").',
      envOptions.promptFile || 'en',
    )
    .option(
      '--print [bool]',
      'Print review result to stdout.',
      (val) => val !== 'false',
      typeof envOptions.print === 'boolean' ? envOptions.print : true,
    )
    .option(
      '--print-reasoning [bool]',
      'Print reasoning to stdout (only available for models that support "reasoning_content" field).',
      (val) => val !== 'false',
      typeof envOptions.printReasoning === 'boolean' ? envOptions.printReasoning : false,
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
  play({
    diffs,
    ...options,
  });
}

if (argv[1] === fileURLToPath(import.meta.url)) {
  cli();
}
