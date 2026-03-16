# AGENTS.md

These instructions apply to agents working in this repository.

## Repository overview

- This repository contains the frontend for `k9-punsj`.
- Main stack: React 18, TypeScript, Redux Toolkit, React Query, Yarn 4 and Webpack.
- UI work should use Aksel components, typography and design tokens by default.
- Keep personal notes, machine specific paths and editor specific workflow outside the repository.

## Collaboration style

- Challenge ideas directly when you see issues.
- State uncertainty instead of guessing.
- Think through edge cases before proposing or implementing changes.
- When decisions matter, present options with clear pros and cons.

## Workflow

- Use a risk based approach tied to production impact, data, security or architecture.
- Small and low risk tasks can move ahead without questions.
- Ask before major architectural changes, data model changes or changes with unclear product impact.
- Prefer the smallest change that solves the actual problem.
- After finishing a task, report notable issues, tradeoffs and alternatives.
- Use `copilot-tasks/` for concrete repo local Copilot task files.
- Use `.github/prompts/` for stable reusable prompts that should stay as shared repo assets.

## Agent boundaries

- Keep changes scoped to the user request.
- Prefer modifying existing code paths instead of adding parallel implementations.
- Do not add new dependencies, frameworks or build tooling unless the task requires it.
- Do not change CI workflows, deployment configuration or environment setup unless the task explicitly calls for it.
- Preserve existing user facing behavior, data flow and API expectations unless a behavior change is requested.

## Development commands

- Install dependencies with `yarn install --immutable`.
- Start local development with `yarn dev`.
- Run unit tests with `yarn test`.
- Run lint with `yarn lint`.
- Run CSS lint with `yarn lint:css`.
- Run TypeScript checks with `yarn tsc --noEmit`.
- Run Cypress headless tests with `yarn cypress:headless` when end to end coverage is needed.

## Testing expectations

- Explicitly assess whether each code change needs a test or a test update.
- Prefer the smallest reliable test that covers the changed behavior or regression risk.
- Use Jest or Testing Library for localized logic, reducers, adapters and component behavior.
- Use Cypress for end to end behavior that is hard to cover at a lower level.
- If a non trivial change ships without a new or updated test, call that out explicitly.

## Validation before completion

- Run the most relevant checks for the changed files or behavior before completion.
- If local checks cannot be run, state that clearly and explain why.
- Summarize changed files and likely impact when handing work back.

## Code and architecture

- Balance pragmatism with quality.
- Keep logic close to the feature unless extraction clearly improves reuse or clarity.
- When extracting helper logic, prefer specific module names over broad catch all files such as `utils.ts`.
- For non trivial utilities, add a short JSDoc block that explains purpose, inputs, return value and important assumptions.
- Preserve existing architecture and patterns unless the task explicitly calls for a structural change.

## Naming

- Use Norwegian names for domain specific functions, variables and types when they represent established business concepts in this codebase.
- Norwegian identifiers may use `æ`, `ø` and `å` when that reflects the actual domain terminology.
- Use English names for generic technical helpers, shared utilities, standard library style helpers, formatting, parsing and other cross-cutting code that is not domain specific.

## Styling and UI

- Aksel is the default source for components, typography, icons and design tokens.
- Preferred styling order for new or refactored UI is `Aksel props`, `Tailwind utilities`, `local component CSS` and then `global CSS`.
- Prefer Aksel layout primitives and Aksel spacing tokens for layout and spacing.
- Use Tailwind utilities selectively when Aksel props or primitives are not a good fit.
- Keep CSS colocated with the component when practical.
- Treat `src/app/styles/globals.css` as restricted scope.
- Outside `src/app/components/legacy-form-compat/**`, do not add new selectors that depend on internal `.navds-*` class names.
- Use `!important` only as a last resort, with a short comment that explains why it is needed.
- Keep visual behavior unchanged during style refactors unless a design change is explicitly requested.

## Writing conventions

- Use Norwegian for code comments by default. English is acceptable when it is clearer or more idiomatic for the code.
- Use Norwegian for commit messages by default, but keep them ASCII only and avoid `æ`, `ø` and `å`.
- Use English for agent authored technical documentation unless the task explicitly requires another language.
- Use sentence case for headings.
- Prefer plain, factual language.
- Avoid promotional tone and exaggerated wording.

## Security and secrets

- Never hardcode tokens, credentials, secrets or internal-only URLs that are not already intended to live in the repository.
- Do not include personopplysninger, sensitive case data or secrets in prompts, examples, fixtures or screenshots.
- Keep security sensitive behavior unchanged unless the task explicitly requires a security related change.

## Git and review

- Review diffs per changed file before committing.
- Use dry conventional commit prefixes such as `feat:`, `fix:`, `docs:`, `chore:` and `refactor:`.
- Do not add AI attribution in commit messages.
- Never push directly unless the user explicitly asks.
