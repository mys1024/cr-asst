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
npx cr-asst --head-ref branch-to-review --base-ref main --model gpt-4 --provider openai --api-key sk-xxx
```

Supported AI service providers:

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
  // other options...
});
```

See [`CodeReviewOptions`](./src/types.ts) for more details.

## Output Example

<details>

<summary>expand</summary>

```markdown
# Overall Changes

1. Extracted the completion logic into a separate file (`completion.ts`) to improve modularity and reusability.
2. Removed the `dryRun` option from `CodeReviewOptions` and updated related code.
3. Renamed `inputTokens` and `outputTokens` to `promptTokens` and `completionTokens` respectively to align with OpenAI's terminology.
4. Updated test files and snapshots to reflect the changes in token naming and the removal of the `dryRun` option.

# Overall Review Comments

1. The refactoring improves code organization by separating concerns, making the codebase easier to maintain and extend.
2. The removal of the `dryRun` option simplifies the API, though it may impact testing. Ensure that alternative testing strategies are in place.

# File-wise Review

1. `src/code_review/completion.ts`
   1. Added a new file to handle the creation and reading of completion streams. This improves modularity by encapsulating the completion logic in a single place.

2. `src/code_review/index.ts`
   1. Updated the `codeReview` function to use the new `createCompletion` function, simplifying the main logic and removing redundant code.
   2. Removed the `dryRun` option and related logic, making the function more straightforward.

3. `src/code_review/test/__snapshots__/utils.test.ts.snap`
   1. Updated the snapshot to reflect the renaming of `inputTokens` and `outputTokens` to `promptTokens` and `completionTokens`.

4. `src/code_review/test/index.test.ts`
   1. Deleted the test file since it was specific to the `dryRun` option, which has been removed.

5. `src/code_review/test/utils.test.ts`
   1. Updated the test cases to use the new token naming conventions (`promptTokens` and `completionTokens`).

6. `src/code_review/utils.ts`
   1. Updated the utility functions to use the new `CompletionUsage` and `CompletionStats` types, aligning with the changes in the completion logic.

7. `src/types.ts`
   1. Removed the `dryRun` option from `CodeReviewOptions`.
   2. Updated the `CodeReviewResult` type to use `CompletionStats` and `CompletionUsage` from the new `completion.ts` file, ensuring type consistency across the codebase.
```

</details>

## Environment Variables (CLI Only)

`cr-asst` reads the following environment variables:

| Environment Variable    | Description                                                                        |
| ----------------------- | ---------------------------------------------------------------------------------- |
| `CR_PROVIDER`           | AI service provider (options: "openai", "deepseek", "xai", "anthropic", "google"). |
| `CR_BASE_URL`           | Base URL for the AI service API.                                                   |
| `CR_API_KEY`            | API key for the AI service.                                                        |
| `CR_MODEL`              | AI model to use for review.                                                        |
| `CR_HEAD_REF`           | Head ref to compare with.                                                          |
| `CR_BASE_REF`           | Base ref to compare against.                                                       |
| `CR_EXCLUDE`            | Files and directories to exclude from review, separated by commas.                 |
| `CR_OUTPUT_FILE`        | Path to a file to save review result.                                              |
| `CR_PROMPT_FILE`        | Path to a custom prompt file, or a builtin prompt (options: "en", "zh-cn").        |
| `CR_SYSTEM_PROMPT_FILE` | Path to a custom system prompt file.                                               |
| `CR_DISABLE_TOOLS`      | Whether to disable tools.                                                          |
| `CR_MAX_STEPS`          | Maximum number of AI model calls.                                                  |
| `CR_PRINT`              | Whether to print review result to stdout.                                          |

Moreover, `cr-asst` CLI uses [`dotenv`](https://www.npmjs.com/package/dotenv) to load environment variables from `.env` file in the current working directory.

## Integrating with GitHub Actions

You can use [`cr-asst-action`](https://github.com/mys1024/cr-asst-action) to integrate `cr-asst` with Github Actions.

## License

[MIT](./LICENSE) License &copy; 2025-PRESENT mys1024
