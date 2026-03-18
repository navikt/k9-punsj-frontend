# AGENTS.md

These instructions apply to agents working in this repository.

## Repository overview

- This repository contains the frontend for `k9-punsj`.
- Related backend context often lives in the companion repository `navikt/k9-punsj`: `https://github.com/navikt/k9-punsj`.
- Main stack: React 18, TypeScript, Redux Toolkit, React Query, Yarn 4 and Webpack.
- Use Aksel components, typography and design tokens by default.
- Keep personal notes, machine specific paths and editor specific workflow outside the repository.

## Workflow

- Use a risk based approach tied to production impact, data, security or architecture.
- Small low risk tasks can move ahead without questions. Ask before major architecture, data model or unclear product changes.
- For local or IDE Copilot work, do not change `master` by default. Ask the user to create or switch to a feature branch first unless the user explicitly wants `master`. Branch creation and switching belong to the user in local or IDE sessions.
- Use `copilot-tasks/` for concrete repo task files and `.github/prompts/` for stable reusable prompts.
- When following `copilot-tasks/*.md`, update `Plan` first, keep `Progress notes` and `Outcome` short and factual, and do not move, rename or delete task files unless the user explicitly asks.
- Prefer the smallest change that solves the actual problem.
- State uncertainty instead of guessing, challenge issues directly and think through edge cases before implementing.
- When decisions matter, present options with clear pros and cons.
- After finishing a task, report notable issues, tradeoffs and alternatives.

## Boundaries

- Keep changes scoped to the user request and prefer existing code paths over parallel implementations.
- Do not add new dependencies, frameworks or build tooling unless the task requires it.
- Do not change CI workflows, deployment configuration or environment setup unless the task explicitly calls for it.
- Preserve existing user facing behavior, data flow and API expectations unless a behavior change is requested.
- Keep logic close to the feature unless extraction clearly improves reuse or clarity.
- When extracting helper logic, prefer specific module names over broad catch all files like `utils.ts`.
- Preserve existing architecture and patterns unless the task explicitly calls for a structural change.

## Development commands

- Install dependencies with `yarn install --immutable`.
- Start local development with `yarn dev`.
- Run unit tests with `yarn test`.
- Run lint with `yarn lint`.
- Run CSS lint with `yarn lint:css`.
- Run TypeScript checks with `yarn tsc --noEmit`.
- Run Cypress end to end tests with `yarn test:e2e` when end to end coverage is needed.

## Testing and validation

- Assess whether each code change needs a test or test update.
- Prefer the smallest reliable test for the changed behavior or regression risk.
- Use Jest or Testing Library for localized logic and Cypress for end to end behavior.
- Run the most relevant checks before completion. If local checks cannot be run, state that clearly and explain why.
- If a non trivial change ships without a new or updated test, call that out explicitly.
- Summarize changed files and likely impact when handing work back.

## Frontend conventions

- Aksel is the default source for components, icons, typography and design tokens.
- Preferred styling order for new or refactored UI is `Aksel props`, `Tailwind utilities`, `local component CSS`, then `global CSS`.
- Prefer Aksel layout primitives and spacing tokens. Use Tailwind only when Aksel props or primitives are not a good fit.
- Keep CSS colocated when practical and treat `src/app/styles/globals.css` as restricted scope.
- Outside `src/app/components/legacy-form-compat/**`, do not add new selectors that depend on internal `.navds-*` class names.
- Use `!important` only as a last resort, with a short comment that explains why it is needed.
- Keep visual behavior unchanged during style refactors unless a design change is explicitly requested.
- Use Norwegian names for established domain concepts, including `æ`, `ø` and `å` when that reflects real terminology.
- Use English names for generic technical helpers and other cross cutting code.

## Writing and safety

- Use Norwegian for code comments by default. English is acceptable when it is clearer or more idiomatic for the code.
- Use Norwegian for commit messages by default, but keep them ASCII only and avoid `æ`, `ø` and `å`.
- Repository documentation may be Norwegian. Use English for new agent authored technical documentation and prompts unless the task explicitly requires another language, and do not change the language of existing docs unless asked.
- Use sentence case for headings and keep language plain and factual.
- Never hardcode or expose tokens, credentials, secrets, personopplysninger or internal-only URLs that are not already intended to live in the repository.
- Keep security sensitive behavior unchanged unless the task explicitly requires a security related change.

## Git and review

- Review diffs per changed file before committing.
- Use dry conventional commit prefixes such as `feat:`, `fix:`, `docs:`, `chore:` and `refactor:`.
- Do not add AI attribution in commit messages.
- Never push directly in local or IDE sessions unless the user explicitly asks.
- In GitHub coding agent sessions, creating or updating the Copilot pull request counts as explicit permission to commit and push to that pull request branch.
- When useful, propose pull request text that follows `.github/pull_request_template.md`. Keep it short, factual and scoped to the actual change.
- Do not include local workflow details, private filesystem paths or AI attribution in pull request text.
- Update `docs/CHANGELOG.md` for noticeable repo changes, setup changes or workflow changes that are useful for future contributors.
- Keep changelog entries short, factual and grouped under the current `Unreleased` section.
- Skip tiny edits or purely local changes unless the task explicitly calls for a changelog update.
