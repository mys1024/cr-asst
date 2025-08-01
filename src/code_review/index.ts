import { writeFile } from 'node:fs/promises';
import { stepCountIs, type LanguageModel, type ModelMessage } from 'ai';
import type { CodeReviewOptions, CodeReviewResult } from '../types';
import { getUserPrompt, getSystemPrompt, getApprovalCheckPrompt } from './prompts/index';
import { runCmd } from './utils';
import { reviewReportTools, createApprovalCheckTools } from './tools';
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
  const approvalCheck = await generateApprovalCheck({
    ...options,
    model,
    prevMessages: reviewReport.messages,
  });

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
    approvalCheck: approvalCheck
      ? {
          content: approvalCheck.text,
          reasoningContent: approvalCheck.reasoning,
          approved: approvalCheck.approved,
          debug: {
            stats: approvalCheck.stats,
            usage: approvalCheck.usage,
          },
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

  // print title
  if (print) {
    console.log(
      `================================================ Review Report ================================================\n`,
    );
  }

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
    console.log(`[DIFFS_CMD] ${diffsCmd}\n`);
  }
  const diffs = await runCmd('git', diffArgs);

  // generate review report
  const result = await callModel({
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

  // return undefined if approval check is not enabled
  if (!approvalCheck) {
    return;
  }

  // print title
  if (print) {
    console.log(
      `\n================================================ Approval Check ================================================\n`,
    );
  }

  // generate approval check
  let approved = true;
  const result = await callModel({
    model,
    messages: [
      ...prevMessages,
      {
        role: 'user',
        content: await getApprovalCheckPrompt(approvalCheck),
      },
    ],
    tools: createApprovalCheckTools((result) => {
      approved = result.approved;
    }),
    stopWhen: stepCountIs(2),
    prepareStep: ({ stepNumber }) => {
      return {
        toolChoice: stepNumber === 0 ? 'required' : 'none',
      };
    },
    print,
    temperature,
    topP,
    topK,
  });

  // return
  return {
    ...result,
    approved,
  };
}
