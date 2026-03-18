# Copilot task template

Use this folder for concrete task files that Copilot should execute in the current branch.

Use `.github/prompts/` for stable reusable prompts that should stay as shared repo assets.

## Task

- Title:
- Branch:
- Suggested agent: `@k9-punsj-front-...`
- Prompt language: `English` or `Norwegian`

## Goal

- Describe the expected outcome in one or two short sentences.

## Context

- Briefly explain why this task exists.
- Add only the context Copilot actually needs.

## Scope

- Allowed files or areas:
- Out of scope:

## Relevant files

- `path/to/file`
- `path/to/file`

## Constraints

- Keep the change scoped to this task.
- Reuse existing repo patterns before adding abstractions.
- Follow `AGENTS.md`, `.github/copilot-instructions.md`, and any relevant file specific instructions in `.github/instructions/`.
- Do not include secrets, personopplysninger, or sensitive case data in prompts or examples.
- Stay consistent with the touched area for naming, styling, accessibility, workflows, auth, and security.

## Validation

- Commands to run:
- If checks are not needed, say why.
- If checks cannot be run, say why.

## Execution protocol

- First update the `Plan` section in this file with a short numbered plan before changing code.
- Keep the plan short and practical, normally `3` to `6` steps.
- Implement the task according to that plan and keep the change scoped to this file.
- Keep `Progress notes` short and factual while working.
- Before finishing, update `Outcome` with changed files, validation result, and any remaining risks or follow ups.
- Do not move, rename, or delete this task file as part of execution. The user handles task lifecycle manually.

## Prompt for Copilot

Write the actual task prompt here.

Keep it practical:

- state the goal clearly
- define the allowed scope
- point to the most relevant files
- list the non negotiable constraints
- ask for a short summary of changes and validation result

Suggested starter prompt for chat:

- `Follow this task file. First update the Plan section, then implement the task, keep Progress notes short, and finish by updating Outcome.`

## Plan

- To be filled in before implementation starts.

## Progress notes

- Keep short factual notes while working.

## Outcome

- Changed files:
- Validation:
- Remaining risks or follow ups:
