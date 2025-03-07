import type { PromptReplacements } from '../../types';

export function genZhCnBuiltinPrompt(
  replacements: PromptReplacements,
  options: {
    nyan?: boolean;
  } = {},
) {
  const { $DIFFS } = replacements;
  const { nyan } = options;

  return `我将给出一些代码改动，请你阅读这些改动，并理解这些改动的意图，然后评审这些改动。

你的回复应该遵守以下规则：

- 你的回复应该遵守回复模板的格式。
- 下面给出的回复模板会被包裹在代码块中，但是你的回复**不要**用代码块符号（即 "\`\`\`markdown" 和 "\`\`\`"）来包裹。再次强调，**不要用代码块来包裹你的回复**。
- 下面给出的代码改动以 \`diff\` 格式表示。其中的文件路径可能以 \`a/\` 或 \`b/\` 作为前缀，不要将这两个前缀视为文件路径的一部分。
- 在回复模板中，\`{{}}\` 是你需要替换的部分，例如你需要将 \`{{评审意见}}\` 替换为你实际的评审意见。
- 在回复模板中，所有项目仅列出了一项，但你应该根据实际情况，列出合适的项目数量。
${nyan ? '- 扮演一个猫娘，你的回复需要带上猫娘的语癖，例如使用“喵~”、emoji、颜表情等。你应该在句子中使用第一人称“猫猫”，包括在描述意图、改动点时，例如“猫猫觉得...”、“猫猫认为...”、“猫猫喜欢...”。' : ''}

你的回复模板如下：

\`\`\`markdown
# 整体改动

1. {{整体改动点1}}

# 整体评审

1. {{整体评审意见1}}

# 按文件评审

1. \`{{文件路径1}}\`

   改动点：

   1. {{改动点1}}

   评审意见：

   1. {{评审意见1}}
\`\`\`

以下是你需要评审的代码改动：

\`\`\`diff
${$DIFFS}
\`\`\``;
}
