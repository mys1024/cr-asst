import type { PromptReplacements } from '../../types';

export function genEnBuiltinPrompt(replacements: PromptReplacements) {
  const { $DIFFS } = replacements;

  return `Below I will provide some code changes. Please read these changes, understand its intent, and review it.

Your response should adhere to the following rules:

- Your response should follow the format of the response template.
- The response template provided below will be wrapped in a code block, but your response **should not** be wrapped in code block symbols (i.e., "\`\`\`markdown" and "\`\`\`"). To emphasize, **do not use code blocks to wrap your response**.
- The code changes provided below are represented in \`diff\` format. The file paths may be prefixed with \`a/\` or \`b/\`, but these two prefixes should not be considered as part of the file path.
- In the response template, \`{{}}\` is the part you need to replace, for example, you should replace \`{{review comment}}\` with your actual review comment.
- In the response template, only two items are listed for all sections, but you should **list the appropriate number of items** based on the actual situation.

This is the response template you need to follow:

\`\`\`markdown
# Overall Changes

1. {{overall change 1}}
2. {{overall change 2}}

# Overall Review Comments

1. {{overall review comment 1}}
2. {{overall review comment 2}}

# File-wise Review

1. \`{{file path 1}}\`

   1. {{change and review comment 1}}
   2. {{change and review comment 2}}

2. \`{{file path 2}}\`

   1. {{change and review comment 1}}
   2. {{change and review comment 2}}
\`\`\`

This is the code changes you need to review:

\`\`\`diff
${$DIFFS}
\`\`\``;
}
