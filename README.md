# cr-asst

[![npm-version](https://img.shields.io/npm/v/cr-asst?style=flat-square&color=%23cb3837)](https://www.npmjs.com/package/cr-asst)
[![npm-minzip](https://img.shields.io/bundlephobia/minzip/cr-asst?style=flat-square&label=minzip)](https://bundlephobia.com/package/cr-asst)
[![license](https://img.shields.io/github/license/mys1024/cr-asst?&style=flat-square)](./LICENSE)
[![workflow-ci](https://img.shields.io/github/actions/workflow/status/mys1024/cr-asst/ci.yml?label=ci&style=flat-square)](https://github.com/mys1024/cr-asst/actions/workflows/ci.yml)
[![workflow-release](https://img.shields.io/github/actions/workflow/status/mys1024/cr-asst/release.yml?label=release&style=flat-square)](https://github.com/mys1024/cr-asst/actions/workflows/release.yml)

Review your code changes with AI assistant.

## Usage

```sh
npx cr-asst -h
```

## Environment Variables

| Environment Variable | Required/Optional | Default                                      | Description                                            |
| -------------------- | ----------------- | -------------------------------------------- | ------------------------------------------------------ |
| `CR_MODEL`           | Required          | -                                            | Model to use.                                          |
| `CR_API_KEY`         | Required          | -                                            | API key for authentication.                            |
| `CR_BASE_URL`        | Optional          | OpenAI developer platform                    | Base URL for the API.                                  |
| `CR_OUTPUT_FILE`     | Optional          | No output file                               | Save output to file.                                   |
| `CR_EXCLUDE_PATHS`   | Optional          | `package-lock.json,pnpm-lock.yaml,yarn.lock` | Exclude paths (comma-separated).                       |
| `CR_PROMPT_FILE`     | Optional          | `en`                                         | Custom prompt file or builtin prompts ("en", "zh-cn"). |
| `CR_SHOW`            | Optional          | `true`                                       | Show on stdout.                                        |
| `CR_SHOW_REASONING`  | Optional          | `false`                                      | Show reasoning.                                        |
| `CR_SHOW_DEBUG`      | Optional          | `false`                                      | Show debug info.                                       |
| `CR_INPUT_FEE`       | Optional          | `0`                                          | Fee per million input tokens. For debugging.           |
| `CR_OUTPUT_FEE`      | Optional          | `0`                                          | Fee per million output tokens. For debugging.          |

## License

[MIT](./LICENSE) License &copy; 2025-PRESENT mys1024
