export type CodeReviewOptions = {
  /**
   * Model to use.
   */
  model: string;

  /**
   * API key for authentication.
   */
  apiKey: string;

  /**
   * Base URL for the API.
   */
  baseUrl?: string;

  /**
   * Command to get diffs for review.
   * @default 'git log --no-prefix -p -n 1'
   */
  diffsCmd?: string;

  /**
   * Save output to file.
   */
  outputFile?: string;

  /**
   * 	Custom prompt file or builtin prompts (options: "en", "zh-cn", "zh-cn-nyan").
   * @default 'en'
   */
  promptFile?: string;

  /**
   * Show on stdout.
   * @default false
   */
  show?: boolean;

  /**
   * Show reasoning.
   * @default false
   */
  showReasoning?: boolean;

  /**
   * Show debug info.
   * @default false
   */
  showDebug?: boolean;

  /**
   * Price per million input tokens. For computing cost in debug mode.
   * @default 0
   */
  inputPrice?: number;

  /**
   * Price per million output tokens. For computing cost in debug mode.
   * @default 0
   */
  outputPrice?: number;
};

export type PartialCodeReviewOptions = Partial<CodeReviewOptions>;

export type PromptReplacements = {
  $DIFFS: string;
};
