import type { PromptReplacements } from '../../types';

export function genEnBuiltinPrompt(replacements: PromptReplacements) {
  const { $DIFFS } = replacements;

  return `Below I will provide some code changes. Please read these changes, understand its intent, and review it.

Your response should adhere to the following rules:

1. Your response should follow the format of the response template.
2. Your complete response **should not** be wrapped in code block delimiters (i.e., "\`\`\`").
3. In the response template, sections, tables, etc., may only list one or two items as examples, but you should adjust the number of items according to the actual context.
4. In the "File-wise Review" section, the "(filename)" should not include its path. However, when files with the same name exist, the "(filename)" should include the shortest path necessary to distinguish them.
5. The review comments should indicate possible problems, shortcomings, and provide repair suggestions.
6. The review comments should praise good changes.

This is the response template you need to follow:

\`\`\`markdown
# Overall Intents

1. (overall intent 1)

# Overall Changes

1. (overall change 1)

# Overall Review Comments

1. (overall review comment 1)

# File-wise Review

| File                                 | Changes                        | Change Intents                               | Review Comments                                |
| ------------------------------------ | ------------------------------ | -------------------------------------------- | ---------------------------------------------- |
| [(filename 1)](<(full file path 1)>) | 1. (change 1)<br>2. (change 2) | 1. (change intent 1)<br>2. (change intent 2) | 1. (review comment 1)<br>2. (review comment 2) |
\`\`\`

This is the code changes you need to review:

\`\`\`diff
${$DIFFS}
\`\`\``;
}
