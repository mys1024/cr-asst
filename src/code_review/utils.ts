import { CodeReviewStats, CodeReviewUsage } from '../types';

export function usageToString(usage: CodeReviewUsage) {
  return [
    '[USAGE]',
    [
      `inputTokens: ${usage.inputTokens}`,
      `outputTokens: ${usage.outputTokens}`,
      `totalTokens: ${usage.totalTokens}`,
    ].join(', '),
  ].join(' ');
}

export function statsToString(stats: CodeReviewStats) {
  return [
    '[STATS]',
    [
      `timeToFirstToken: ${(stats.timeToFirstToken / 1000).toFixed(2)}s`,
      `timeToFinish: ${(stats.timeToFinish / 1000).toFixed(2)}s`,
      `tokensPerSecond: ${stats.tokensPerSecond.toFixed(2)} tokens/s`,
    ].join(', '),
  ].join(' ');
}
