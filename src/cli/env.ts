import { env } from 'node:process';
import 'dotenv/config';
import type { CodeReviewCliOptions, CodeReviewProvider } from '../types';

export function booleanEnvVar(envVar: string | undefined): boolean | undefined {
  return envVar === 'true' ? true : envVar === 'false' ? false : undefined;
}

export function numberEnvVar(
  envVar: string | undefined,
  type: 'int' | 'float',
): number | undefined {
  if (envVar === undefined) {
    return;
  }
  const val = type === 'int' ? parseInt(envVar) : parseFloat(envVar);
  return isNaN(val) ? undefined : val;
}

export const envOptions: Partial<CodeReviewCliOptions> = {
  provider: env.CR_PROVIDER as CodeReviewProvider | undefined,
  baseUrl: env.CR_BASE_URL,
  apiKey: env.CR_API_KEY,
  model: env.CR_MODEL,
  headRef: env.CR_HEAD_REF,
  baseRef: env.CR_BASE_REF,
  exclude: env.CR_EXCLUDE,
  outputFile: env.CR_OUTPUT_FILE,
  promptFile: env.CR_PROMPT_FILE,
  systemPromptFile: env.CR_SYSTEM_PROMPT_FILE,
  disableTools: booleanEnvVar(env.CR_DISABLE_TOOLS),
  maxSteps: numberEnvVar(env.CR_MAX_STEPS, 'int'),
  print: booleanEnvVar(env.CR_PRINT),
};
