# Copilot instructions for k9-punsj-frontend

This file supplements the repository `AGENTS.md`.

- Follow both this file and `AGENTS.md` when they are available in the current Copilot surface.
- If `AGENTS.md` is not applied in the current surface, treat the rules below as the minimum repository baseline.

## Scope

- Keep suggestions and code changes concise and scoped to the task.
- Avoid unrelated refactors or broad cleanup outside the requested scope.
- Reuse existing domain concepts, naming and code paths before introducing new abstractions.
- For local or IDE Copilot work, do not start code changes on `master` by default. Ask the user to create or switch to a feature branch first unless the user explicitly wants to work on `master`.
- When following a `copilot-tasks/*.md` file, first update its `Plan` section, then implement the task, and finish by updating `Outcome`.
- Do not add new dependencies, frameworks or build tooling unless the task requires it.
- Do not change CI workflows, deployment configuration or environment setup unless the task explicitly calls for it.

## Frontend conventions

- Prefer Aksel components, layout primitives and spacing tokens for UI work.
- Use Tailwind utilities selectively when Aksel props or primitives are not a good fit.
- Use Norwegian names for domain specific identifiers, including `æ`, `ø` and `å` when that reflects real domain terminology.
- Use English names for generic non domain helpers and other cross-cutting technical code.

## Safety and validation

- Add or update the smallest relevant test when a code change affects behavior or regression risk.
- Run the most relevant checks for the changed area when possible, and say clearly if they were not run.
- When asked for a pull request summary or description, follow `.github/pull_request_template.md` and keep the text short and factual.
- For noticeable repo or setup changes, add a short factual entry to `docs/CHANGELOG.md` under the current `Unreleased` section when relevant.
- Do not include personopplysninger, secrets, tokens or sensitive internal data in prompts, examples, fixtures or screenshots.
- In GitHub coding agent sessions, creating or updating the Copilot pull request counts as explicit permission to commit and push to that pull request branch.

## Writing

- Use Norwegian for code comments by default. English is acceptable when it is clearer or more idiomatic for the code.
- Use Norwegian for commit messages by default, but keep them ASCII only and avoid `æ`, `ø` and `å`.
- Repository documentation may be Norwegian. Use English for new agent authored technical documentation and prompts unless the task explicitly requires another language, and do not change the language of existing docs unless asked.
