import { exit } from 'node:process';
import { program } from 'commander';
import { codeReview } from './code_review';
import { envOptions } from './env';
import type { PartialCodeReviewOptions, CodeReviewOptions } from './types';

/* ------------------------------------------------ cil ------------------------------------------------ */

const options = program
  .version('0.9.0', '-v, --version', 'Show version.')
  .helpOption('-h, --help', 'Show help.')
  .requiredOption('-m, --model <model>', 'Model to use.', envOptions.model)
  .option(
    '-k, --api-key <key>',
    `API key for authentication.${envOptions.apiKey ? ' (default: retrieve from env)' : ''}`,
  )
  .option('-u, --base-url <url>', 'Base URL for the API.', envOptions.baseUrl)
  .option('-o, --output-file <file>', 'Save output to file.', envOptions.outputFile)
  .option(
    '-e, --exclude-paths <path...>',
    'Exclude paths.',
    envOptions.excludePaths || ['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock'],
  )
  .option(
    '-p, --prompt-file <fileOrBuiltinPrompt>',
    'Custom prompt file or builtin prompts (options: "en", "zh-cn", "zh-cn-nyan").',
    envOptions.promptFile || 'en',
  )
  .option(
    '-s, --show [bool]',
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
  .opts<PartialCodeReviewOptions>();

if (!options.apiKey && envOptions.apiKey) {
  options.apiKey = envOptions.apiKey;
}

assertAsCodeReviewOptions(options);

codeReview(options);

/* ------------------------------------------------ utils ------------------------------------------------ */

export function assertAsCodeReviewOptions(
  options: PartialCodeReviewOptions,
): asserts options is CodeReviewOptions {
  if (!options.model) {
    console.error("error: required option '-m, --model <model>' not specified");
    exit(1);
  }
  if (!options.apiKey) {
    console.error("error: required option '-k, --api-key <key>' not specified");
    exit(1);
  }
}
