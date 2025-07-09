import type { LanguageModelUsage } from 'ai';

export type CodeReviewProvider = 'openai' | 'deepseek' | 'xai' | 'anthropic' | 'google';

export type CodeReviewOptions = {
  /**
   * AI service provider (options: "openai", "deepseek", "xai", "anthropic", "google").
   * @default 'openai'
   */
  provider?: CodeReviewProvider;

  /**
   * Base URL for the AI service API.
   * @default undefined
   */
  baseUrl?: string;

  /**
   * API key for the AI service.
   */
  apiKey: string;

  /**
   * AI model to use for review.
   */
  model: string;

  /**
   * Head ref to compare with.
   * @default 'HEAD'
   */
  headRef?: string;

  /**
   * Base ref to compare against.
   * @default 'HEAD^'
   */
  baseRef?: string;

  /**
   * Files and directories to exclude from review.
   * @default
   * ['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock']
   */
  exclude?: string[];

  /**
   * Path to a file to save review result.
   * @default undefined
   */
  outputFile?: string;

  /**
   * Path to a custom prompt file, or a builtin prompt (options: `en`, `zh-cn`).
   * @default 'en'
   */
  promptFile?: string;

  /**
   * Path to a custom system prompt file.
   * @default undefined
   */
  systemPromptFile?: string;

  /**
   * Whether to disable tools.
   * @default false
   */
  disableTools?: boolean;

  /**
   * Maximum number of AI model calls.
   * @default 32
   */
  maxSteps?: number;

  /**
   * Whether to print review result to stdout.
   * @default false
   */
  print?: boolean;
};

export type CodeReviewCliOptions = Omit<CodeReviewOptions, 'exclude'> & {
  exclude?: string;
};

export type CompletionUsage = LanguageModelUsage;

export type CompletionStats = {
  startedAt: number;
  firstTokenReceivedAt: number;
  finishedAt: number;
  timeToFirstToken: number;
  timeToFinish: number;
  tokensPerSecond?: number;
};

export type CodeReviewResult = {
  content: string;
  reasoningContent?: string;
  debug: {
    diffsCmd: string;
    diffs: string;
    stats: CompletionStats;
    usage?: CompletionUsage;
  };
};
