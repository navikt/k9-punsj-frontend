# Copilot task

## Task

- Title: Phase 1 — migrate the application and Storybook builds to Vite
- Branch: `refactor/vite-build-migration`
- Suggested agent: `default Copilot coding agent`
- Prompt language: English
- Execution: local/IDE Copilot only; leave changes unstaged and uncommitted for review

## Goal

- This is phase 1 of 2: replace the application and Storybook Webpack builds with Vite while preserving browser behavior, the CDN and pod asset contract, runtime configuration, stories, and local mock flows. Phase 2 will migrate Jest to Vitest in a separate task.

## Scope

- Allowed: build and Storybook configuration, application HTML and narrow environment references, package manifest and lockfile, Docker/NAIS/deploy wiring only where needed, focused artifact checks, this task file, and a dated changelog entry.
- Keep Jest/Babel Jest working. Do not migrate tests to Vitest or remove Babel used by Jest in this task.
- Do not change production API/OBO proxy behavior, authentication, business logic, Yarn, or Node baseline.
- Do not read or reference other repositories. Follow `AGENTS.md`.
- Communicate in English. Use Norwegian for new test descriptions, the changelog and user-facing text; use Norwegian code comments where practical. Do not stage or commit changes, push, or open a PR. Stop after leaving the working tree diff for user review. Propose a few logical commit groups in `Outcome`; only the user may authorize later commits, with dry conventional Norwegian ASCII messages.

## Validation

- Run `yarn tsc --noEmit`, `yarn lint`, `yarn test --maxWorkers=2`, `yarn build`, `yarn build-storybook`, and `yarn test:e2e`. Verify the seven existing story files in Storybook dev mode. Run `yarn lint:css` if CSS changes. Report any check that cannot run.
- Inspect `dist` and built HTML: CDN URLs and `crossorigin="anonymous"`, hashed JS, extracted CSS and imported assets, sourcemaps, pod-hosted favicon and `/dist/js/nais.js`. Check both deploy workflows upload every referenced CDN file.
- Record the deployed dev GCP checks as pending if unavailable locally: login, authenticated API calls, runtime `nais.js`, Nais APM, CSS/assets, and sourcemap error stacks.

## Prompt for Copilot

Follow `copilot-tasks/vite-build-migration.md` for phase 1 of 2; Jest-to-Vitest migration is a later task. First replace the placeholder `Plan` with 3–6 concrete steps, then implement them. Keep `Progress notes` brief and finish `Outcome` with changed files, checks, remaining deployed validation and suggested logical commit groups where sensible. Communicate in English. Do not run `git add`, `git commit` or `git push`, and do not open a PR. Leave changes unstaged for user review and stop; only the user can authorize later commits.

1. Add a Vite application build and dev server. Use the existing `app` alias and PostCSS/Tailwind config, preserve relevant Moment locale behavior, and choose package versions compatible with CI Node 22.22.3 and the seven-day cooldown. Keep Jest on its current runner.
2. Give HTML an explicit Vite module entry. Preserve `dist/index.html` and `/dist/favicon.png` in the pod, and load the NAIS-generated `/dist/js/nais.js` from the app origin before APM initialization. Preserve only the browser's needed compile-time `APP_VERSION`, `NODE_ENV` and `MSW_MODE` values; keep `/envVariables` and `window.nais` at runtime. Never expose all of `process.env`.
3. Keep the current production CDN namespace. Aim to emit hashed JS, CSS, imported assets and sourcemaps under `dist/js/`, with a production CDN base. Ensure the built HTML references only files uploaded by both deploy workflows, uses anonymous CORS for CDN scripts, and keeps `nais.js` on the app origin. Add small artifact assertions. Change Docker, NAIS or workflow paths only if the verified output requires coordinated changes.
4. Reproduce the local server on port 8080: `/api/k9-punsj` proxy outside `MSW_MODE=test`, `/envVariables`, `/me`, health routes, `/mockServiceWorker.js`, the test PDF endpoint, and SPA fallback. Preserve the Cypress/MSW flow. Leave the production Express proxy and OBO config alone.
5. Move Storybook to `@storybook/react-vite`. Replace `webpackFinal` with Vite-compatible alias and CSS handling, keeping the existing stories and styles. Verify Storybook dev and static build, then remove Webpack-only tooling once neither application nor Storybook needs it. Keep Babel needed by Jest.
6. Run the listed checks, inspect each changed file's diff, add a dated `docs/CHANGELOG.md` entry, and report what still needs dev GCP smoke testing.

## Plan

1. Add `vite` and `@vitejs/plugin-react` (newest versions older than the 7 day cooldown, Node 22.22.3 compatible) and a shared `vite.config.mjs` with the `app` alias, PostCSS/Tailwind from `postcss.config.js`, compile-time `APP_VERSION`, `NODE_ENV` and `MSW_MODE` only, and `dist/` output with hashed files under `dist/js/`.
2. Give `src/app/index.html` an explicit module entry to `App.tsx`, load `/dist/js/nais.js` from the app origin, and copy `favicon.png` and `nais.js` (from `faroConfig.js`) into `dist`. In production, use the CDN base for hashed assets and `crossorigin="anonymous"` on CDN scripts and stylesheets, and add a small artifact check script.
3. Replace `start-dev.mjs` with a Vite dev server on 127.0.0.1:8080 that reproduces the proxy, `/envVariables`, `/me`, health routes, `/mockServiceWorker.js`, the mock PDF endpoint and SPA fallback. Keep `run-e2e.mjs` and the `start:e2e` flow.
4. Move Storybook to `@storybook/react-vite` with a dedicated Vite config for alias and PostCSS, then remove the Webpack-only tooling from the manifest and delete `src/build/webpack` config files that are no longer needed (keep `faroConfig.js` for the Docker copy).
5. Run the listed checks, verify the artifacts and both deploy workflows against the built HTML, and add a changelog entry.

## Progress notes

- Vite root is `src/app`. Chose `vite@8.3.0` and `@vitejs/plugin-react@6.1.1` because `vite@8.3.1` (2026-09-24) was inside the 7 day cooldown. Moment is not in the dependency graph, so there was no locale handling to migrate.
- The Vite 8 CSS minifier rejected the invalid `.calendarGrid--grid > *::before:not(:first-child)` rule in `calendarGrid.css`. Only that rule was removed; browsers already dropped it as invalid.
- CSS is now loaded from the CDN, so `https://cdn.nav.no` was added to `style-src` in `server/server.js`.
- Dev server fixes: `App.tsx` uses the named `logger` export from `redux-logger` (the default import broke through Vite CJS interop), and the dev server injects a static `mocks/browser.ts` script so `window.msw` exists at `load` for Cypress.
- E2E history: the first full run failed broadly because of the `redux-logger` import and a missing `window.msw` at page load. After both fixes, one full run had 9 failures in `fordeling/OMPAO.cy.js` (a 60 s page load timeout followed by cascading errors) while Storybook dev and a browser were running in parallel. `OMPAO.cy.js` alone passed 45/45, and a final full run with nothing else running passed 377/377.
- MSW in the production bundle: `mocks/browser` is only reached behind `process.env.NODE_ENV !== 'production'`; a search of `dist/js/*.js` for `mockServiceWorker`, `setupWorker` and `@mswjs` returns no matches after `yarn build`.
- Pre-existing, not caused by this migration and not fixed here:
    - `yarn lint:css` reports 29 `at-rule-prelude-no-invalid` errors for Tailwind `@apply`. The count is 29 on the unmodified tree (checked with `git stash`) and 29 after the migration.
    - The `OpprettJournalpost` story fails with a react-redux context error. `OpprettJournalpost.tsx` has used `useSelector` since 2026-06-11 (`a00d29bb`), the story has no redux `Provider` decorator, and neither file is changed by this task. The stale Webpack `storybook-static` (built 2026-05-28) predates that change, which is why it still rendered.

## Outcome

- Changed files: `package.json`, `yarn.lock`, `vite.config.mjs`, `src/app/index.html`, `src/app/App.tsx`, `src/app/components/calendar/calendarGrid.css` (one rule removed), `src/build/vite/*` (new), `src/build/scripts/start-dev.mjs`, `src/build/scripts/check-dist.mjs` (new), `.storybook/main.ts`, `.storybook/vite.config.mjs` (new), `server/server.js` (`style-src` only), `docs/CHANGELOG.md`. Removed: `src/build/webpack/{devserver,webpack.config.*}.mjs` and `src/build/scripts/production-build.mjs`. `src/build/webpack/faroConfig.js` stays for the Dockerfile copy. Dockerfile, NAIS files and workflows are unchanged.
- Validation, passing: `yarn tsc --noEmit`; `yarn lint`; `yarn test --maxWorkers=2` (71 suites, 484 tests); `yarn build` including `build:check` (CDN URLs with `crossorigin="anonymous"`, hashed JS and CSS in `dist/js`, sourcemaps, favicon and `nais.js` on the app origin, both deploy workflows upload `dist/js`); `yarn build-storybook`; `yarn test:e2e` (377/377 on the final full run); all seven story files load in Storybook dev, except `OpprettJournalpost` (see pre-existing failures).
- Validation, pre-existing failures: `yarn lint:css` (29 `@apply` errors) and the `OpprettJournalpost` story Provider error, both described in Progress notes.
- Not run: dev GCP checks. Pending after deploy: login, authenticated API calls, runtime `nais.js`, Nais APM, CSS and font loading under the updated CSP, CDN CORS for module scripts, and sourcemap error stacks. The CSP `style-src` change also needs to be confirmed there.
- Suggested commit groups (Norwegian ASCII conventional messages; do not create them):
    - `chore: bytt fra webpack til vite for app og storybook` (`package.json`, `yarn.lock`, `vite.config.mjs`, `src/build/**`, `src/app/index.html`, `src/app/App.tsx`, `.storybook/**`)
    - `fix: tillat cdn i style-src og fjern ugyldig css-regel` (`server/server.js`, `calendarGrid.css`)
    - `docs: oppdater changelog og oppgavefil for vite-migrering` (`docs/CHANGELOG.md`, `copilot-tasks/vite-build-migration.md`)
