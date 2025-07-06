import { execa, ExecaError } from 'execa';
import type { CompletionUsage, CompletionStats } from '../types';

export function usageToString(usage?: CompletionUsage) {
  return [
    '[USAGE]',
    [
      `promptTokens: ${usage?.promptTokens ? usage.promptTokens : 'N/A'}`,
      `completionTokens: ${usage?.completionTokens ? usage.completionTokens : 'N/A'}`,
      `totalTokens: ${usage?.totalTokens ? usage.totalTokens : 'N/A'}`,
    ].join(', '),
  ].join(' ');
}

export function statsToString(stats: CompletionStats) {
  return [
    '[STATS]',
    [
      `timeToFirstToken: ${(stats.timeToFirstToken / 1000).toFixed(2)}s`,
      `timeToFinish: ${(stats.timeToFinish / 1000).toFixed(2)}s`,
      `tokensPerSecond: ${stats.tokensPerSecond ? `${stats.tokensPerSecond.toFixed(2)} tokens/s` : 'N/A'}`,
    ].join(', '),
  ].join(' ');
}

export async function to<T>(
  promiseOrFn: Promise<T> | (() => T | Promise<T>),
): Promise<[Error, undefined] | [undefined, T]> {
  try {
    const maybePromise = typeof promiseOrFn === 'function' ? promiseOrFn() : promiseOrFn;
    return [undefined, await maybePromise];
  } catch (err) {
    return [err instanceof Error ? err : new Error(String(err)), undefined];
  }
}

export async function toToolResult<T>(
  promiseOrFn: Promise<T> | (() => T | Promise<T>),
): Promise<{ ok: false; error: string } | { ok: true; result: T }> {
  const [err, result] = await to(promiseOrFn);
  return err ? { ok: false, error: err.message } : { ok: true, result };
}

export async function runCmd(file: string, args: string[]) {
  try {
    const { stdout } = await execa(file, args);
    return stdout;
  } catch (err) {
    if (err instanceof ExecaError) {
      throw new Error(err.stderr);
    } else if (err instanceof Error) {
      throw err;
    } else {
      throw new Error(String(err));
    }
  }
}
