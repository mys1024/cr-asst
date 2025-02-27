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
  inputPrice?: number;
  outputPrice?: number;
};

export type PartialCodeReviewOptions = Partial<CodeReviewOptions>;
