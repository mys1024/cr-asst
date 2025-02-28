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
   * Git diff source blob.
   * @default 'HEAD^'
   */
  diffSrc?: string;

  /**
   * Git diff destination blob.
   * @default 'HEAD'
   */
  diffDst?: string;

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
   * @default
   * ['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock']
   */
  excludePaths?: string[];

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
