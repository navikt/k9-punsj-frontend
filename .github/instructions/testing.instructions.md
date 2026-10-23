---
name: Testing Standards
description: "Testprinsipper for k9-punsj-frontend: Vitest, Testing Library og Cypress."
applyTo: "**/*.{spec,test}.{ts,tsx}"
---

# Testing standards

Follow `AGENTS.md` and the [TypeScript test patterns](testing-typescript.instructions.md). Unit and component tests use Vitest and Testing Library; end to end tests use Cypress.

## Test strategy

Choose the smallest reliable test for the behavior being changed:

| What to test | Tools |
|---|---|
| Pure functions, validation, and data transformations | Vitest |
| Component behavior and form interactions | Vitest and Testing Library |
| Critical user workflows | Cypress with the existing MSW mocks |

- Keep unit and component tests in `src/test/` as `*.spec.ts` or `*.spec.tsx`, following adjacent tests.
- Use Norwegian test descriptions that explain observable behavior.
- Cover relevant success, error, and edge cases without testing implementation details.
- Keep test state isolated and restore mocks when needed.
- Use existing test helpers and fixtures before introducing new ones.
- Check keyboard flow, focus, accessible names, and error presentation when the changed behavior affects accessibility.

## Validation

- Run the narrowest relevant tests first with `yarn test <path>`.
- Use `yarn test:e2e` for headless Cypress checks or `yarn test:e2eUI` for interactive checks when the change needs end to end coverage.
- Both Cypress commands start the frontend in test mode with MSW mocks; they do not require the backend repository.
- Summarize what was checked and explain any checks that could not be run.

## Boundaries

- Do not add a test framework or dependency unless the task requires it.
- Ask before changing shared test infrastructure or disabling tests.
- Do not commit failing tests or share mutable state between tests.
