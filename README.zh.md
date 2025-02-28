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
npx cr-asst --diffs-cmd "git log -p master.." --model xxx --api-key xxx
# 或
git log -p master.. | npx cr-asst --model xxx --api-key xxx
```

选项 `--diffs-cmd` 的默认值是 `git log --no-prefix -p -n 1 -- . :!package-lock.json :!pnpm-lock.yaml :!yarn.lock`，这行命令的作用是从最近的一个提交获取除了 `package-lock.json`、`pnpm-lock.yaml` 和 `yarn.lock` 之外的代码改动。

### API

```javascript
import { codeReview } from 'cr-asst';

codeReview({
  diffs: 'DIFFS_TO_REVIEW', // 或 `diffsCmd: 'COMMAND_TO_GET_DIFFS'`
  model: 'xxx',
  apiKey: 'xxx',
  // 其他选项...
});
```

更多选项请参考 [`CodeReviewOptions`](./src/types.ts)。

## 环境变量 (仅对 CLI 有效)

| 环境变量            | 描述                                                                      |
| ------------------- | ------------------------------------------------------------------------- |
| `CR_MODEL`          | 要用于代码评审的 AI 模型。                                                |
| `CR_API_KEY`        | AI 服务的 API 密钥。                                                      |
| `CR_BASE_URL`       | AI 服务的 API 基础 URL。                                                  |
| `CR_DIFFS_CMD`      | 获取要评审的代码改动的命令。                                              |
| `CR_OUTPUT_FILE`    | 要保存评审结果的文件。                                                    |
| `CR_PROMPT_FILE`    | 自定义的提示词文件，或内置的提示词（选项: "en", "zh-cn", "zh-cn-nyan"）。 |
| `CR_SHOW`           | 是否在标准输出中显示评审结果。                                            |
| `CR_SHOW_REASONING` | 是否在标准输出中显示推理内容（仅对支持推理的模型有效）。                  |
| `CR_SHOW_DEBUG`     | 是否在标准输出中显示调试信息。                                            |
| `CR_INPUT_PRICE`    | 每百万输入 token 的价格。用于计算费用。                                   |
| `CR_OUTPUT_PRICE`   | 每百万输出 token 的价格。用于计算费用。                                   |

此外，`cr-asst` 命令行使用 [`dotenv`](https://www.npmjs.com/package/dotenv) 从当前工作目录的 `.env` 文件加载环境变量。

## License

[MIT](./LICENSE) License &copy; 2025-PRESENT mys1024
