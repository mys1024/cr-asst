import { env } from 'node:process';
import 'dotenv/config';
import type { PartialCodeReviewOptions, CodeReviewProvider } from '../types';

export function booleanEnvVar(envVar: string | undefined): boolean | undefined {
  return envVar === 'true' ? true : envVar === 'false' ? false : undefined;
}

export function floatEnvVar(envVar: string | undefined): number | undefined {
  if (envVar === undefined) {
    return;
  }
  const val = parseFloat(envVar);
  return isNaN(val) ? undefined : val;
}

export const envOptions: PartialCodeReviewOptions = {
  provider: env.CR_PROVIDER as CodeReviewProvider | undefined,
  baseUrl: env.CR_BASE_URL,
  apiKey: env.CR_API_KEY,
  model: env.CR_MODEL,
  diffsCmd: env.CR_DIFFS_CMD,
  outputFile: env.CR_OUTPUT_FILE,
  promptFile: env.CR_PROMPT_FILE,
  print: booleanEnvVar(env.CR_PRINT),
  printReasoning: booleanEnvVar(env.CR_PRINT_REASONING),
  printDebug: booleanEnvVar(env.CR_PRINT_DEBUG),
};
