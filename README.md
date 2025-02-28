# cr-asst

[![license](https://img.shields.io/github/license/mys1024/cr-asst?&style=flat-square)](./LICENSE)
[![npm-version](https://img.shields.io/npm/v/cr-asst?style=flat-square&color=%23cb3837)](https://www.npmjs.com/package/cr-asst)
[![workflow-ci](https://img.shields.io/github/actions/workflow/status/mys1024/cr-asst/ci.yml?label=ci&style=flat-square)](https://github.com/mys1024/cr-asst/actions/workflows/ci.yml)
[![workflow-release](https://img.shields.io/github/actions/workflow/status/mys1024/cr-asst/release.yml?label=release&style=flat-square)](https://github.com/mys1024/cr-asst/actions/workflows/release.yml)

Review your code changes with AI assistant.

## Usage

### CLI

Help:

```sh
npx cr-asst -h
```

Code review:

```sh
npx cr-asst --diff-src master --model xxx --api-key xxx
```

### API

```javascript
import { codeReview } from 'cr-asst';

codeReview({
  diffSrc: 'master',
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
| `CR_DIFF_SRC`        | Git diff source blob.                                                         |
| `CR_DIFF_DST`        | Git diff destination blob.                                                    |
| `CR_PROMPT_FILE`     | Custom prompt file or builtin prompts (options: "en", "zh-cn", "zh-cn-nyan"). |
| `CR_OUTPUT_FILE`     | Save output to file.                                                          |
| `CR_EXCLUDE_PATHS`   | Exclude paths (comma-separated).                                              |
| `CR_SHOW`            | Show on stdout.                                                               |
| `CR_SHOW_REASONING`  | Show reasoning.                                                               |
| `CR_SHOW_DEBUG`      | Show debug info.                                                              |
| `CR_INPUT_PRICE`     | Price per million input tokens. For computing cost in debug mode.             |
| `CR_OUTPUT_PRICE`    | Price per million output tokens. For computing cost in debug mode.            |

## License

[MIT](./LICENSE) License &copy; 2025-PRESENT mys1024
