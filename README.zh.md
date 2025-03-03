# cr-asst

[![license](https://img.shields.io/github/license/mys1024/cr-asst?&style=flat-square)](./LICENSE)
[![npm-version](https://img.shields.io/npm/v/cr-asst?style=flat-square&color=%23cb3837)](https://www.npmjs.com/package/cr-asst)
[![workflow-ci](https://img.shields.io/github/actions/workflow/status/mys1024/cr-asst/ci.yml?label=ci&style=flat-square)](https://github.com/mys1024/cr-asst/actions/workflows/ci.yml)
[![workflow-release](https://img.shields.io/github/actions/workflow/status/mys1024/cr-asst/release.yml?label=release&style=flat-square)](https://github.com/mys1024/cr-asst/actions/workflows/release.yml)

[English](./README.md) | 中文

使用 AI 对你的代码改动进行评审。

## 用法

### CLI

#### 显示帮助

```sh
npx cr-asst -h
```

#### 代码评审

```sh
获取代码改动的命令 | npx cr-asst --model gpt-4 --api-key sk-xxx
# 例如：
git log -p master.. | npx cr-asst --model gpt-4 --api-key sk-xxx
```

如果直接执行 `cr-asst`，则默认从最近的 Git 提交获取除了 `package-lock.json`、`pnpm-lock.yaml` 和 `yarn.lock` 之外的代码改动。

### API

```javascript
import { codeReview } from 'cr-asst';

const { content } = await codeReview({
  diffs: '代码改动', // 或 `diffsCmd: '获取代码改动的命令'`
  model: 'gpt-4',
  apiKey: 'sk-xxx',
  // 其他选项...
});
```

更多选项请参考 [`CodeReviewOptions`](./src/types.ts)。

## 自定义提示词文件

你可以通过指定 `--prompt-file` 选项来使用自定义的提示词文件。

你的自定义提示词文件应该包含 `$DIFFS`，`cr-asst` 在执行时会将其替换为实际的代码改动。

以下是一个简单的自定义提示词文件的示例：

````markdown
请评审以下的代码改动并给出评审意见：

```diff
$DIFFS
```
````

## 环境变量 (仅对 CLI 有效)

| 环境变量             | 描述                                                                              |
| -------------------- | --------------------------------------------------------------------------------- |
| `CR_MODEL`           | 要用于代码评审的 AI 模型。                                                        |
| `CR_API_KEY`         | AI 服务的 API 密钥。                                                              |
| `CR_BASE_URL`        | AI 服务的 API 基础 URL。                                                          |
| `CR_DIFFS_CMD`       | 获取要评审的代码改动的命令。                                                      |
| `CR_OUTPUT_FILE`     | 要保存评审结果的文件。                                                            |
| `CR_PROMPT_FILE`     | 自定义提示词文件的路径，或内置的提示词（选项: "en", "zh-cn", "zh-cn-nyan"）。     |
| `CR_PRINT`           | 是否在标准输出中显示评审结果。                                                    |
| `CR_PRINT_REASONING` | 是否在标准输出中显示推理内容（仅对支持返回 `reasoning_content` 字段的模型有效）。 |
| `CR_PRINT_DEBUG`     | 是否在标准输出中显示调试信息。                                                    |
| `CR_INPUT_PRICE`     | 每百万输入 token 的价格。用于计算费用。                                           |
| `CR_OUTPUT_PRICE`    | 每百万输出 token 的价格。用于计算费用。                                           |

此外，`cr-asst` CLI 还会使用 [`dotenv`](https://www.npmjs.com/package/dotenv) 从当前工作目录的 `.env` 文件加载环境变量。

## License

[MIT](./LICENSE) License &copy; 2025-PRESENT mys1024
