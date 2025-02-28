# cr-asst

[![license](https://img.shields.io/github/license/mys1024/cr-asst?&style=flat-square)](./LICENSE)
[![npm-version](https://img.shields.io/npm/v/cr-asst?style=flat-square&color=%23cb3837)](https://www.npmjs.com/package/cr-asst)
[![workflow-ci](https://img.shields.io/github/actions/workflow/status/mys1024/cr-asst/ci.yml?label=ci&style=flat-square)](https://github.com/mys1024/cr-asst/actions/workflows/ci.yml)
[![workflow-release](https://img.shields.io/github/actions/workflow/status/mys1024/cr-asst/release.yml?label=release&style=flat-square)](https://github.com/mys1024/cr-asst/actions/workflows/release.yml)

English | [中文](./README.zh.md)

Review your code changes with AI assistant.

## Usage

### CLI

#### Print help

```sh
npx cr-asst -h
```

#### Code review

```sh
npx cr-asst --diffs-cmd "git log -p master.." --model xxx --api-key xxx
# or
git log -p master.. | npx cr-asst --model xxx --api-key xxx
```

The option `--diffs-cmd` defaults to `git log --no-prefix -p -n 1 -- . :!package-lock.json :!pnpm-lock.yaml :!yarn.lock`, which means to get the code diffs of the last commit, excluding `package-lock.json`, `pnpm-lock.yaml` and `yarn.lock`.

### API

```javascript
import { codeReview } from 'cr-asst';

codeReview({
  diffs: 'DIFFS_TO_REVIEW', // or `diffsCmd: 'COMMAND_TO_GET_DIFFS'`
  model: 'xxx',
  apiKey: 'xxx',
  // other options...
});
```

See [`CodeReviewOptions`](./src/types.ts) for more details.

## Environment Variables (CLI Only)

| Environment Variable | Description                                                                   |
| -------------------- | ----------------------------------------------------------------------------- |
| `CR_MODEL`           | AI Model to use for review.                                                   |
| `CR_API_KEY`         | API key for the AI service.                                                   |
| `CR_BASE_URL`        | Base URL for the AI service API.                                              |
| `CR_DIFFS_CMD`       | Command to get code diffs for review.                                         |
| `CR_OUTPUT_FILE`     | Save review result to file.                                                   |
| `CR_PROMPT_FILE`     | Custom prompt file or builtin prompt (options: `en`, `zh-cn`, `zh-cn-nyan`).  |
| `CR_PRINT`           | Print review result to stdout.                                                |
| `CR_PRINT_REASONING` | Print reasoning to stdout (only available for models that support reasoning). |
| `CR_PRINT_DEBUG`     | Print debug information to stdout.                                            |
| `CR_INPUT_PRICE`     | Price per million input tokens. For computing cost.                           |
| `CR_OUTPUT_PRICE`    | Price per million output tokens. For computing cost.                          |

Moreover, `cr-asst` CLI uses [`dotenv`](https://www.npmjs.com/package/dotenv) to load environment variables from `.env` file in the current working directory.

## License

[MIT](./LICENSE) License &copy; 2025-PRESENT mys1024
