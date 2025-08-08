import { writeFile } from 'node:fs/promises';
import chalk from 'chalk';
import { stepCountIs, streamText, type LanguageModel, type ModelMessage } from 'ai';
import type { CodeReviewOptions, CodeReviewResult } from '../types';
import {
  getReviewReportMessages,
  getApprovalCheckCommentMessages,
  getApprovalCheckStatusMessages,
} from './prompts/index';
import { runCmd } from './utils';
import { reviewReportTools } from './tools';
import { initModel, handleStreamTextResult } from './model';

export async function codeReview(options: CodeReviewOptions): Promise<CodeReviewResult> {
  // init model
  const model = initModel(options);

  // generate review report
  const reviewReport = await generateReviewReport({
    ...options,
    model,
  });

  // generate approval check comment
  const approvalCheckComment = options.approvalCheck
    ? await generateApprovalCheck({
        ...options,
        model,
        prevMessages: reviewReport.messages,
      })
    : undefined;

  // generate approval check status
  const approvalCheckStatus =
    options.approvalCheck && approvalCheckComment
      ? await generateApprovalCheckStatus({
          ...options,
          model,
          prevMessages: approvalCheckComment.messages,
        })
      : undefined;

  // return
  return {
    reviewReport,
    approvalCheck:
      approvalCheckComment && approvalCheckStatus
        ? {
            approvalCheckComment,
            approvalCheckStatus,
          }
        : undefined,
  };
}

async function generateReviewReport(
  options: Omit<CodeReviewOptions, 'model'> & {
    model: LanguageModel;
  },
) {
  // options
  const {
    model,
    baseRef = 'HEAD^',
    headRef = 'HEAD',
    include = ['.'],
    exclude = ['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock'],
    outputFile,
    promptFile = 'en',
    systemPromptFile,
    disableTools = false,
    maxSteps = 32,
    temperature,
    topP,
    topK,
    print = false,
  } = options;

  // get diffs
  const diffArgs = [
    'diff',
    '--unified=8',
    `${baseRef}...${headRef}`,
    '--',
    ...include,
    ...exclude.map((v) => `:!${v}`),
  ];
  const diffsCmd = `git ${diffArgs.join(' ')}`;
  if (print) {
    console.log(chalk.green(`[DIFFS_CMD] ${diffsCmd}\n`));
  }
  const diffs = await runCmd('git', diffArgs);

  // messages
  const messages = await getReviewReportMessages({
    systemPromptFile,
    promptFile,
    disableTools,
    diffs,
    baseRef,
    headRef,
  });

  // call model
  const result = await handleStreamTextResult({
    title: 'Review Report',
    print,
    streamTextResult: streamText({
      model,
      messages,
      tools: disableTools ? undefined : reviewReportTools,
      stopWhen: stepCountIs(maxSteps),
      temperature,
      topP,
      topK,
      onError: ({ error }) => {
        throw new Error('failed to call the model', { cause: error });
      },
    }),
  });

  // write output file
  if (outputFile) {
    await writeFile(outputFile, result.text);
  }

  // return
  return {
    ...result,
    messages: [...messages, ...result.messages],
    diffsCmd,
    diffs,
  };
}

async function generateApprovalCheck(
  options: Omit<CodeReviewOptions, 'model'> & {
    model: LanguageModel;
    prevMessages: ModelMessage[];
  },
) {
  // options
  const { model, prevMessages, approvalCheck, print, temperature, topP, topK } = options;

  // messages
  const messages = await getApprovalCheckCommentMessages({
    prevMessages,
    approvalCheck,
  });

  // call model
  const result = await handleStreamTextResult({
    title: 'Approval Check Comment',
    print,
    streamTextResult: streamText({
      model,
      messages,
      temperature,
      topP,
      topK,
      onError: ({ error }) => {
        throw new Error('failed to call the model', { cause: error });
      },
    }),
  });

  // return
  return {
    ...result,
    messages: [...messages, ...result.messages],
  };
}

async function generateApprovalCheckStatus(
  options: Omit<CodeReviewOptions, 'model'> & {
    model: LanguageModel;
    prevMessages: ModelMessage[];
  },
) {
  // options
  const { model, prevMessages, print, temperature, topP, topK } = options;

  // messages
  const messages = getApprovalCheckStatusMessages({ prevMessages });

  // call model
  const result = await handleStreamTextResult({
    title: 'Approval Check Status',
    print,
    streamTextResult: streamText({
      model,
      messages,
      temperature,
      topP,
      topK,
      onError: ({ error }) => {
        throw new Error('failed to call the model', { cause: error });
      },
    }),
  });

  // parse approved flag
  const approved = result.text.includes('true');

  // return
  return {
    ...result,
    messages: [...messages, ...result.messages],
    approved,
  };
}
