import 'dotenv/config';
import type { PartialCodeReviewOptions } from './types';

export const envOptions: PartialCodeReviewOptions = {
  model: process.env.CR_MODEL,
  apiKey: process.env.CR_API_KEY,
  baseUrl: process.env.CR_BASE_URL,
  outputFile: process.env.CR_OUTPUT_FILE,
  excludePaths: process.env.CR_EXCLUDE_PATHS?.split(','),
  promptFile: process.env.CR_PROMPT_FILE,
  showReasoning:
    process.env.CR_SHOW_REASONING === 'true'
      ? true
      : process.env.CR_SHOW_REASONING === 'false'
        ? false
        : undefined,
  showDebug:
    process.env.CR_SHOW_DEBUG === 'true'
      ? true
      : process.env.CR_SHOW_DEBUG === 'false'
        ? false
        : undefined,
  inputPrice: !process.env.CR_INPUT_PRICE
    ? undefined
    : isNaN(parseFloat(process.env.CR_INPUT_PRICE))
      ? undefined
      : parseFloat(process.env.CR_INPUT_PRICE),
  outputPrice: !process.env.CR_OUTPUT_PRICE
    ? undefined
    : isNaN(parseFloat(process.env.CR_OUTPUT_PRICE))
      ? undefined
      : parseFloat(process.env.CR_OUTPUT_PRICE),
};
