import 'dotenv/config';
import type { PartialCodeReviewOptions } from './types';

function booleanEnvVar(envVar: string | undefined): boolean | undefined {
  return envVar === 'true' ? true : envVar === 'false' ? false : undefined;
}

function floatEnvVar(envVar: string | undefined): number | undefined {
  if (envVar === undefined) {
    return;
  }
  const val = parseFloat(envVar);
  return isNaN(val) ? undefined : val;
}

export const envOptions: PartialCodeReviewOptions = {
  model: process.env.CR_MODEL,
  apiKey: process.env.CR_API_KEY,
  baseUrl: process.env.CR_BASE_URL,
  promptFile: process.env.CR_PROMPT_FILE,
  outputFile: process.env.CR_OUTPUT_FILE,
  excludePaths: process.env.CR_EXCLUDE_PATHS?.split(','),
  show: booleanEnvVar(process.env.CR_SHOW),
  showReasoning: booleanEnvVar(process.env.CR_SHOW_REASONING),
  showDebug: booleanEnvVar(process.env.CR_SHOW_DEBUG),
  inputPrice: floatEnvVar(process.env.CR_INPUT_PRICE),
  outputPrice: floatEnvVar(process.env.CR_OUTPUT_PRICE),
};
