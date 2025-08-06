import { writeFile } from 'node:fs/promises';
import chalk from 'chalk';
import { stepCountIs, type LanguageModel, type ModelMessage } from 'ai';
import type { CodeReviewOptions, CodeReviewResult } from '../types';
import {
  getUserPrompt,
  getSystemPrompt,
  getApprovalCheckPrompt,
  getApprovalCheckStatusPrompt,
} from './prompts/index';
import { runCmd } from './utils';
import { reviewReportTools } from './tools';
import { initModel, callModel } from './model';

export async function codeReview(options: CodeReviewOptions): Promise<CodeReviewResult> {
  // init model
  const model = initModel(options);

  // generate review report
  const reviewReport = await generateReviewReport({
    ...options,
    model,
  });

  // generate approval check
  const approvalCheck = options.approvalCheck
    ? await generateApprovalCheck({
        ...options,
        model,
        prevMessages: reviewReport.messages,
      })
    : undefined;

  // generate approval check status
  const approvalCheckStatus =
    options.approvalCheck && approvalCheck
      ? await generateApprovalCheckStatus({
          ...options,
          model,
          prevMessages: approvalCheck.messages,
        })
      : undefined;

  // return
  return {
    content: reviewReport.text,
    reasoningContent: reviewReport.reasoning,
    debug: {
      diffsCmd: reviewReport.diffsCmd,
      diffs: reviewReport.diffs,
      stats: reviewReport.stats,
      usage: reviewReport.usage,
    },
    approvalCheck:
      approvalCheck && approvalCheckStatus
        ? {
            content: approvalCheck.text,
            reasoningContent: approvalCheck.reasoning,
            approved: approvalCheckStatus.approved,
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
    console.log(chalk.gray(`[DIFFS_CMD] ${diffsCmd}\n`));
  }
  const diffs = await runCmd('git', diffArgs);

  // generate review report
  const result = await callModel({
    title: 'Review Report',
    model,
    tools: disableTools ? undefined : reviewReportTools,
    stopWhen: stepCountIs(maxSteps),
    messages: [
      {
        role: 'system',
        content: await getSystemPrompt({
          systemPromptFile,
          disableTools,
          diffs,
          baseRef,
          headRef,
        }),
      },
      { role: 'user', content: await getUserPrompt(promptFile) },
    ],
    print,
    temperature,
    topP,
    topK,
  });

  // write output file
  if (outputFile) {
    await writeFile(outputFile, result.text);
  }

  // return
  return {
    ...result,
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

  // generate approval check
  const result = await callModel({
    title: 'Approval Check',
    model,
    messages: [
      ...prevMessages,
      {
        role: 'user',
        content: await getApprovalCheckPrompt(approvalCheck),
      },
    ],
    print,
    temperature,
    topP,
    topK,
  });

  // return
  return {
    ...result,
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

  // generate approval check
  const result = await callModel({
    title: 'Approval Check Status',
    model,
    messages: [
      ...prevMessages,
      {
        role: 'user',
        content: await getApprovalCheckStatusPrompt(),
      },
    ],
    print,
    temperature,
    topP,
    topK,
  });

  // parse approved flag
  const approved = result.text.includes('true');

  // return
  return {
    ...result,
    approved,
  };
}
