import type { CompletionUsage, CompletionStats } from './completion';

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
