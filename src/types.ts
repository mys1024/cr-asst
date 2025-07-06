import type { LanguageModelUsage } from 'ai';

export type CodeReviewOptions = {
  /**
   * AI model to use for review.
   */
  model: string;

  /**
   * API key for the AI service.
   */
  apiKey: string;

  /**
   *	Base URL for the AI service API.
   */
  baseUrl?: string;

  /**
   * Code diffs to review. If not provided, will use diffsCmd to get diffs.
   */
  diffs?: string;

  /**
   * Command to get code diffs for review.
   * @default 'git log --no-prefix -p -n 1 -- . :!package-lock.json :!pnpm-lock.yaml :!yarn.lock'
   */
  diffsCmd?: string;

  /**
   * Save review result to file.
   */
  outputFile?: string;

  /**
   * Path to a custom prompt file, or a builtin prompt (options: `en`, `zh-cn`).
   * @default 'en'
   */
  promptFile?: string;

  /**
   * Print review result to stdout.
   * @default false
   */
  print?: boolean;

  /**
   * Print reasoning to stdout (only available for models that support `reasoning_content` field).
   * @default false
   */
  printReasoning?: boolean;

  /**
   * Print debug information to stdout.
   * @default false
   */
  printDebug?: boolean;
};

export type PartialCodeReviewOptions = Partial<CodeReviewOptions>;

export type PromptReplacements = {
  $DIFFS: string;
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
    diffs: string;
    stats: CompletionStats;
    usage?: CompletionUsage;
  };
};
