# Task: store ProblemDetail directly in frontend state

## context

Frontend currently maps API `ProblemDetail` to legacy `IError` through `convertProblemDetailToError`.
This solved an immediate parsing issue, but it keeps a translation layer that loses structure and forces mixed patterns across forms.

## why this change

- `IError` hides parts of the API contract (`type`, `title`, `status`, `detail`, `instance`, `correlationId`, `properties`).
- Validation, conflict and generic failures are represented differently in different forms.
- More endpoints are being migrated to `ProblemDetail`, so frontend should align with backend contract.
- Removing conversion reduces duplicate mapping logic and accidental fallback behavior.

## goal

Store raw `ProblemDetail` in Redux state for submit and validate flows, starting with PSB, then migrate other forms.

## scope

- Introduce a shared frontend `ProblemDetail` type used in actions, reducers and containers.
- Replace `IError` usage in PSB submit and validate state with `ProblemDetail`.
- Update UI rendering in PSB containers to read text from `detail` and fallback to `title`.
- Keep validation list handling from `properties.feil`.
- Define a migration pattern for other forms that still use `IError`.

Out of scope:
- Backend contract changes.
- Global redesign of all error banners in one step.
- Removing all `IError` usage in one PR.

## proposed implementation

1. Add shared type
- Add `ApiProblemDetail` (or `ProblemDetailDto`) in frontend models.
- Include optional fields for top level keys and `properties`.

2. PSB state and actions
- Update PSB action payloads from `IError` to `ApiProblemDetail` where API errors are stored.
- Update `PunchPSBFormState` fields (`submitSoknadError`, `submitSoknadConflict`, `validateSoknadError`) to `ApiProblemDetail`.
- In `submitSoknad`, stop converting to `IError`, dispatch parsed `ProblemDetail` directly.

3. PSB UI rendering
- Read banner text from `detail`, fallback to `title`, then generic i18n key.
- Keep validation errors from `properties.feil` for 400 validation responses.
- Ensure conflict alert uses the same text source.

4. Transitional compatibility
- Keep `convertProblemDetailToError` only where non migrated modules still require `IError`.
- Mark helper as transitional and avoid new usages.

5. Follow up migration
- Migrate PLS, OMPMA, OMPKS and other submit and validate flows to the same state model.
- Remove `convertProblemDetailToError` after last consumer is migrated.

## acceptance criteria

- PSB submit and validate store API errors as `ProblemDetail`, not `IError`.
- PSB banners show correct backend message from `detail` or `title`.
- PSB validation list still works from `properties.feil`.
- No usage of `convertProblemDetailToError` in PSB actions.
- Existing PSB submit behavior for 202, 400, 409 and 500 remains correct.
- Unit tests cover parsing and rendering for 400 with validation errors.
- Unit tests cover parsing and rendering for 409 conflict.
- Unit tests cover parsing and rendering for 500 generic error.
- Unit tests cover fallback when `detail` is missing.

## risks and mitigations

- Risk: mixed state models during migration create confusion.
- Mitigation: migrate one domain at a time and keep clear type names.

- Risk: UI regressions where components expect `IError.message`.
- Mitigation: update PSB container methods to use `ProblemDetail` fields explicitly and add tests.

- Risk: non PSB forms keep using legacy behavior.
- Mitigation: track remaining modules and migrate in planned follow up tasks.

## definition of done

- PSB frontend flow uses `ProblemDetail` end to end in state.
- Migration notes for remaining forms are documented in a follow up ticket list.
- Legacy conversion helper is no longer used in PSB code paths.
