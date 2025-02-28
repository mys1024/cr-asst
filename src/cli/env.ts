import { env } from 'node:process';
import 'dotenv/config';
import type { PartialCodeReviewOptions } from '../types';

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
  model: env.CR_MODEL,
  apiKey: env.CR_API_KEY,
  baseUrl: env.CR_BASE_URL,
  diffsCmd: env.CR_DIFFS_CMD,
  outputFile: env.CR_OUTPUT_FILE,
  promptFile: env.CR_PROMPT_FILE,
  print: booleanEnvVar(env.CR_PRINT),
  printReasoning: booleanEnvVar(env.CR_PRINT_REASONING),
  printDebug: booleanEnvVar(env.CR_PRINT_DEBUG),
  inputPrice: floatEnvVar(env.CR_INPUT_PRICE),
  outputPrice: floatEnvVar(env.CR_OUTPUT_PRICE),
};
