# cr-asst

[![license](https://img.shields.io/github/license/mys1024/cr-asst)](./LICENSE)
[![npm-version](https://img.shields.io/npm/v/cr-asst?color=%23cb3837)](https://www.npmjs.com/package/cr-asst)
[![workflow-ci](https://img.shields.io/github/actions/workflow/status/mys1024/cr-asst/ci.yml?label=ci)](https://github.com/mys1024/cr-asst/actions/workflows/ci.yml)
[![workflow-release](https://img.shields.io/github/actions/workflow/status/mys1024/cr-asst/release.yml?label=release)](https://github.com/mys1024/cr-asst/actions/workflows/release.yml)

English | [中文](./README.zh.md)

Review your code changes with AI assistants.

## Usage

### CLI

#### Print Help

```sh
npx cr-asst -h
```

#### Code Review

```sh
COMMAND_TO_GET_CODE_DIFFS | npx cr-asst --model gpt-4 --api-key sk-xxx
# for example:
git log -p master.. | npx cr-asst --model gpt-4 --api-key sk-xxx
```

If `cr-asst` is executed directly, it defaults to get code diffs from the latest git commit, except for `package-lock.json`, `pnpm-lock.yaml` and `yarn.lock`.

### API

```javascript
import { codeReview } from 'cr-asst';

const { content } = await codeReview({
  diffs: 'CODE_DIFFS', // or `diffsCmd: 'COMMAND_TO_GET_CODE_DIFFS'`
  model: 'gpt-4',
  apiKey: 'sk-xxx',
  // other options...
});
```

See [`CodeReviewOptions`](./src/types.ts) for more details.

## Custom Prompt File

You can use your custom prompt file by specifying the `--prompt-file` option.

Your custom prompt file should include `$DIFFS`, which `cr-asst` will replace with the actual code diffs during execution.

Here is a simple example of a custom prompt file:

````markdown
Please review the following code changes and provide your review comments:

```diff
$DIFFS
```
````

## Environment Variables (CLI Only)

| Environment Variable | Description                                                                                   |
| -------------------- | --------------------------------------------------------------------------------------------- |
| `CR_MODEL`           | AI Model to use for review.                                                                   |
| `CR_API_KEY`         | API key for the AI service.                                                                   |
| `CR_BASE_URL`        | Base URL for the AI service API.                                                              |
| `CR_DIFFS_CMD`       | Command to get code diffs for review.                                                         |
| `CR_OUTPUT_FILE`     | Save review result to file.                                                                   |
| `CR_PROMPT_FILE`     | Path to a custom prompt file, or a builtin prompt (options: `en`, `zh-cn`, `zh-cn-nyan`).     |
| `CR_PRINT`           | Print review result to stdout.                                                                |
| `CR_PRINT_REASONING` | Print reasoning to stdout (only available for models that support `reasoning_content` field). |
| `CR_PRINT_DEBUG`     | Print debug information to stdout.                                                            |

Moreover, `cr-asst` CLI uses [`dotenv`](https://www.npmjs.com/package/dotenv) to load environment variables from `.env` file in the current working directory.

## License

[MIT](./LICENSE) License &copy; 2025-PRESENT mys1024
