# cr-asst

[![license](https://img.shields.io/github/license/mys1024/cr-asst)](./LICENSE)
[![npm-version](https://img.shields.io/npm/v/cr-asst?color=%23cb3837)](https://www.npmjs.com/package/cr-asst)
[![workflow-ci](https://img.shields.io/github/actions/workflow/status/mys1024/cr-asst/ci.yml?label=ci)](https://github.com/mys1024/cr-asst/actions/workflows/ci.yml)
[![workflow-release](https://img.shields.io/github/actions/workflow/status/mys1024/cr-asst/release.yml?label=release)](https://github.com/mys1024/cr-asst/actions/workflows/release.yml)

[English](./README.md) | 中文

让 AI 来评审你的代码改动。

## 用法

### CLI

#### 显示帮助

```sh
npx cr-asst -h
```

#### 代码评审

```sh
npx cr-asst --head-ref branch-to-review --base-ref main --model gpt-4 --provider openai --api-key sk-xxx
```

支持的 AI 服务提供商：

- openai
- deepseek
- xai
- anthropic
- google

### API

```javascript
import { codeReview } from 'cr-asst';

const { content } = await codeReview({
  headRef: 'branch-to-review'
  baseRef: 'main',
  model: 'gpt-4',
  provider: 'openai',
  apiKey: 'sk-xxx',
  // 其他选项...
});
```

更多选项请参考 [`CodeReviewOptions`](./src/types.ts)。

## 输出示例（--prompt-file zh-cn）

<details>

<summary>展开</summary>

```markdown
# 整体改动

1. 将代码审查功能中的 `completion` 相关逻辑提取到单独的文件 `completion.ts` 中，并通过 `createCompletion` 和 `readCompletionStream` 函数进行封装。
2. 移除了 `dryRun` 选项，并简化了 `codeReview` 函数的实现。
3. 修改了 `usageToString` 和 `statsToString` 函数的实现，使其与新的 `CompletionUsage` 和 `CompletionStats` 类型兼容。
4. 更新了测试文件中的相关代码，以反映这些改动。

# 整体评审

1. 代码重构的目的是将 `completion` 相关的逻辑进行模块化，提升了代码的可读性和可维护性。通过将这部分逻辑提取到独立的文件中，`codeReview` 函数的职责更加单一，符合单一职责原则。
2. 移除了 `dryRun` 选项，简化了 `codeReview` 函数的逻辑。这一改动减少了不必要的代码分支，使得函数的行为更加清晰。
3. 在 `usageToString` 和 `statsToString` 函数中，添加了对 `undefined` 值的处理，提升了代码的健壮性。

# 按文件评审

1. `src/code_review/completion.ts`
   1. 新增了 `createCompletion` 和 `readCompletionStream` 函数，用于处理 OpenAI 的 `completion` 流式请求。这些函数的封装使得代码逻辑更加清晰，便于复用和维护。
   2. 引入了 `CompletionUsage` 和 `CompletionStats` 类型，用于记录 `completion` 的使用情况和性能统计。这些类型的定义使得数据结构更加明确。

2. `src/code_review/index.ts`
   1. 移除了 `dryRun` 选项，简化了 `codeReview` 函数的逻辑。这一改动使得函数的行为更加直接，减少了不必要的复杂性。
   2. 使用 `createCompletion` 函数替代了原有的流式处理逻辑，使得代码更加简洁，且职责更加单一。

3. `src/code_review/utils.ts`
   1. 修改了 `usageToString` 和 `statsToString` 函数，使其与新的 `CompletionUsage` 和 `CompletionStats` 类型兼容。同时，添加了对 `undefined` 值的处理，提升了代码的健壮性。

4. `src/types.ts`
   1. 移除了 `CodeReviewUsage` 和 `CodeReviewStats` 类型，改为使用 `CompletionUsage` 和 `CompletionStats` 类型。这一改动减少了重复的类型定义，提升了代码的一致性。
   2. 移除了 `dryRun` 选项，简化了 `CodeReviewOptions` 类型的定义。
```

</details>

## 环境变量（仅对 CLI 有效）

`cr-asst` 会读取以下环境变量：

| 环境变量                | 描述                                                                          |
| ----------------------- | ----------------------------------------------------------------------------- |
| `CR_PROVIDER`           | AI 服务提供商（可选值: "openai", "deepseek", "xai", "anthropic", "google"）。 |
| `CR_BASE_URL`           | AI 服务的 API 基础 URL。                                                      |
| `CR_API_KEY`            | AI 服务的 API 密钥。                                                          |
| `CR_MODEL`              | 要用于代码评审的 AI 模型。                                                    |
| `CR_HEAD_REF`           | 要进行比较的头引用。                                                          |
| `CR_BASE_REF`           | 要进行比较的基引用。                                                          |
| `CR_EXCLUDE`            | 要排除的目录和文件，逗号分隔。                                                |
| `CR_OUTPUT_FILE`        | 要保存评审结果的文件。                                                        |
| `CR_PROMPT_FILE`        | 自定义提示词文件的路径，或内置的提示词（可选值: "en", "zh-cn"）。             |
| `CR_SYSTEM_PROMPT_FILE` | 自定义系统提示词文件的路径。                                                  |
| `CR_DISABLE_TOOLS`      | 是否禁用工具调用。                                                            |
| `CR_MAX_STEPS`          | 最大 AI 模型调用次数。                                                        |
| `CR_PRINT`              | 是否在标准输出中显示评审结果。                                                |

另外，`cr-asst` CLI 还会使用 [`dotenv`](https://www.npmjs.com/package/dotenv) 从当前工作目录的 `.env` 文件加载环境变量。

## 与 Github Actions 集成

你可以用 [`cr-asst-action`](https://github.com/mys1024/cr-asst-action) 来将 `cr-asst` 和 Github Actions 集成。

如果你在国内使用与 Github Actions 兼容的自托管 CI/CD 系统（如 Gitea Actions），为了避免网络问题，可以引用在 Gitee 上的这个[镜像仓库](https://gitee.com/mys1024/cr-asst-action)。

## License

[MIT](./LICENSE) License &copy; 2025-PRESENT mys1024
