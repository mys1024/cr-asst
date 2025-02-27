import { program } from 'commander';
import type { PartialCodeReviewOptions } from './types';
import { codeReview } from './code_review';
import { envOptions } from './env';
import { assertAsCodeReviewOptions } from './utils';

const cliOptions = program
  .version('0.9.0', '-v, --version', 'Show version.')
  .helpOption('-h, --help', 'Show help.')
  .option('-m, --model <model>', 'Model to use.')
  .option('-k, --api-key <key>', 'API key for authentication.')
  .option('-u, --base-url <url>', 'Base URL for the API.')
  .option('-o, --output-file <file>', 'Save output to file.')
  .option('-e, --exclude-paths <path...>', 'Exclude paths.')
  .option(
    '-p, --prompt-file <fileOrBuiltinPrompt>',
    'Custom prompt file or builtin prompts ("en", "zh-cn").',
  )
  .option('-s, --show [bool]', 'Show on stdout.', (v) => v === 'true')
  .option('--show-reasoning [bool]', 'Show reasoning.', (v) => v === 'true')
  .option('--show-debug [bool]', 'Show debug info.', (v) => v === 'true')
  .option(
    '--input-price <price>',
    'Price per million input tokens. For computing usage.',
    parseFloat,
  )
  .option(
    '--output-price <price>',
    'Price per million output tokens. For computing usage.',
    parseFloat,
  )
  .parse(process.argv)
  .opts<PartialCodeReviewOptions>();

const options: PartialCodeReviewOptions = {
  ...envOptions,
  ...cliOptions,
};

assertAsCodeReviewOptions(options);

codeReview(options);
