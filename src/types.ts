export type CodeReviewOptions = {
  /**
   * AI Model to use for review.
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
   * Custom prompt file or builtin prompt (options: `en`, `zh-cn`, `zh-cn-nyan`).
   * @default 'en'
   */
  promptFile?: string;

  /**
   * Print review result to stdout.
   * @default false
   */
  print?: boolean;

  /**
   * Print reasoning to stdout (only available for models that support reasoning).
   * @default false
   */
  printReasoning?: boolean;

  /**
   * Print debug information to stdout.
   * @default false
   */
  printDebug?: boolean;

  /**
   * Price per million input tokens. For computing cost.
   * @default 0
   */
  inputPrice?: number;

  /**
   * Price per million output tokens. For computing cost.
   * @default 0
   */
  outputPrice?: number;
};

export type PartialCodeReviewOptions = Partial<CodeReviewOptions>;

export type PromptReplacements = {
  $DIFFS: string;
};
