export type CodeReviewOptions = {
  model: string;
  apiKey?: string;
  baseUrl?: string;
  outputFile?: string;
  excludePaths?: string[];
  promptFile?: string;
  show?: boolean;
  showReasoning?: boolean;
  showDebug?: boolean;
  inputFee?: number;
  outputFee?: number;
};

export type PartialCodeReviewOptions = Partial<CodeReviewOptions>;
