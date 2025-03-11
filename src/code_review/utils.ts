import { CodeReviewStats, CodeReviewUsage } from '../types';

export function usageToString(usage: CodeReviewUsage) {
  return [
    '[USAGE]',
    `inputTokens: ${usage.inputTokens}`,
    `outputTokens: ${usage.outputTokens}`,
    `totalTokens: ${usage.totalTokens}`,
    `inputCost: ${usage.inputCost.toFixed(6)}`,
    `outputCost: ${usage.outputCost.toFixed(6)}`,
    `totalCost: ${usage.totalCost.toFixed(6)}`,
  ].join(', ');
}

export function statsToString(stats: CodeReviewStats) {
  return [
    '[STATS]',
    `timeToFirstToken: ${(stats.timeToFirstToken / 1000).toFixed(2)}s`,
    `timeToFinish: ${(stats.timeToFinish / 1000).toFixed(2)}s`,
    `tokensPerSecond: ${stats.tokensPerSecond.toFixed(2)} tokens/s`,
  ].join(', ');
}
