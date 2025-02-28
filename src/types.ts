export type CodeReviewOptions = {
  model: string;
  apiKey: string;
  baseUrl?: string;
  promptFile?: string;
  outputFile?: string;
  excludePaths?: string[];
  show?: boolean;
  showReasoning?: boolean;
  showDebug?: boolean;
  inputPrice?: number;
  outputPrice?: number;
};

export type PartialCodeReviewOptions = Partial<CodeReviewOptions>;
