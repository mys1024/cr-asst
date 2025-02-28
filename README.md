# cr-asst

[![license](https://img.shields.io/github/license/mys1024/cr-asst?&style=flat-square)](./LICENSE)
[![npm-version](https://img.shields.io/npm/v/cr-asst?style=flat-square&color=%23cb3837)](https://www.npmjs.com/package/cr-asst)
[![workflow-ci](https://img.shields.io/github/actions/workflow/status/mys1024/cr-asst/ci.yml?label=ci&style=flat-square)](https://github.com/mys1024/cr-asst/actions/workflows/ci.yml)
[![workflow-release](https://img.shields.io/github/actions/workflow/status/mys1024/cr-asst/release.yml?label=release&style=flat-square)](https://github.com/mys1024/cr-asst/actions/workflows/release.yml)

Review your code changes with AI assistant.

## Usage

### CLI

Show help:

```sh
npx cr-asst -h
```

Code review:

```sh
npx cr-asst --diffs-cmd "git log -p master.." --model xxx --api-key xxx
# or
git log -p master.. | npx cr-asst --model xxx --api-key xxx
```

The option `--diffs-cmd` defaults to `git log --no-prefix -p -n 1 -- . :!package-lock.json :!pnpm-lock.yaml :!yarn.lock`, which means to get the diffs of the last commit, excluding `package-lock.json`, `pnpm-lock.yaml`, and `yarn.lock`.

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

See [`CodeReviewOptions`](./src/types.ts) for more options.

## Environment Variables (Only for CLI)

| Environment Variable | Description                                                                   |
| -------------------- | ----------------------------------------------------------------------------- |
| `CR_MODEL`           | Model to use.                                                                 |
| `CR_API_KEY`         | API key for authentication.                                                   |
| `CR_BASE_URL`        | Base URL for the API.                                                         |
| `CR_DIFFS_CMD`       | Command to get diffs for review.                                              |
| `CR_PROMPT_FILE`     | Custom prompt file or builtin prompts (options: "en", "zh-cn", "zh-cn-nyan"). |
| `CR_OUTPUT_FILE`     | Save output to file.                                                          |
| `CR_SHOW`            | Show on stdout.                                                               |
| `CR_SHOW_REASONING`  | Show reasoning.                                                               |
| `CR_SHOW_DEBUG`      | Show debug info.                                                              |
| `CR_INPUT_PRICE`     | Price per million input tokens. For computing cost.                           |
| `CR_OUTPUT_PRICE`    | Price per million output tokens. For computing cost.                          |

Moreover, `cr-asst` CLI uses [`dotenv`](https://www.npmjs.com/package/dotenv) to load environment variables from `.env` file in the current working directory.

## License

[MIT](./LICENSE) License &copy; 2025-PRESENT mys1024
