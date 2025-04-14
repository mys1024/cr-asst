import type { PromptReplacements } from '../../types';

export function genEnBuiltinPrompt(replacements: PromptReplacements) {
  const { $DIFFS } = replacements;

  return `Below I will provide some code changes. Please read these changes, understand its intent, and review it.

Your response should adhere to the following rules:

- Your response should follow the format of the response template.
- The response template provided below will be wrapped in a code block, but your response **should not** be wrapped in code block symbols (i.e., "\`\`\`markdown" and "\`\`\`"). To emphasize, **do not use code blocks to wrap your response**.
- In the response template, \`{{}}\` is the part you need to replace, for example, you should replace \`{{review comment}}\` with your actual review comment.
- In the response template, as an example, only one item item is listed in every sections. You should **list the appropriate number of items** based on the actual situation.
- The code changes provided below are represented in \`diff\` format. The file paths may be prefixed with \`a/\` or \`b/\`, but these two prefixes should not be considered as part of the file path.
- Review comments should point out potential improvements in the code, but there's no need to be overly nitpicky.
- Review comments should point out syntax issues in the code, such as incorrect syntax usage, unclosed brackets, etc.
- Review comments should point out logical issues in the code, such as infinite loops, incorrect conditions, wrong expressions, etc.
- Review comments should **especially point out** security issues in the code, which refer to vulnerabilities that could lead to attacks, such as SQL injection, XSS, CSRF, etc.
- In the section "Issues and Potential Improvements", **only** point out the issues and potential improvements in the code, and do not provide review comments for reasonable code.

This is the response template you need to follow:

\`\`\`markdown
# Overall Changes

1. {{overall change}}

# Overall Review Comments

1. {{overall review comment}}

# Issues and Potential Improvements

1. \`{{path of the file with issue or potential improvement}}\`

   1. {{issue or potential improvement}}
\`\`\`

This is the code changes you need to review:

\`\`\`diff
${$DIFFS}
\`\`\``;
}
