---
name: package-maintenance
description: Update dependencies in k9-punsj-frontend with registry publish-date checks and a recursive security review. Use for routine patch/minor maintenance and targeted transitive dependency fixes; leave major migrations to separate tasks.
---

# Package maintenance

Follow `AGENTS.md`. Use `copilot-tasks/weekly-package-maintenance.md` for local run notes. Keep filled Plan, Progress notes, and Outcome out of commits, but leave them in the working tree for review and continuation. Clear them only when the user explicitly asks.

## Discover once

1. Read the task's existing notes, `.yarnrc.yml`, root and server manifests, existing resolutions, and the latest dependency changelog entry. Continue an active run from its pending step, reusing its discovery and validation results where still applicable; an intermediate commit does not start a new run. Recheck previously deferred updates and blockers against current metadata when starting a new maintenance run. Update the task's Plan without discarding existing notes.
2. For a new run, execute this command from the repository root. When continuing, reuse its existing result unless changed inputs or stale metadata require a recheck:

   ```sh
   node .github/skills/package-maintenance/scripts/select-updates.mjs
   ```

   This read-only script queries each unique direct dependency once through Yarn, reusing configured registry routing and authentication. It reads cooldown and exemptions from Yarn configuration, computes one UTC cutoff, and selects the highest eligible stable version in the current major. An eligible newer minor wins over a patch in an older minor. It does not install packages or decide compatibility.
3. Reuse the result throughout this run. Investigate errors, rows marked `manualReview`, unsupported exemption patterns, or missing publish dates rather than treating them as up-to-date packages. Local workspace/file references are intentionally skipped. For a focused recheck, repeat `--package NAME` as needed. Do not restart a full discovery for one failed package. List major candidates separately without researching migrations.
4. Before updates, run `yarn npm audit --all --recursive --json`. Through GitHub MCP or another available authenticated interface, read Dependabot alerts, relevant library findings from code scanning, and open dependency PRs. If the available tools lack security endpoints or permissions, record that limitation. Issue/PR search does not search security alerts; their numeric IDs belong to separate namespaces.

## Apply eligible updates

- Make one compact target list for root and server, then use explicit `yarn up package@version` arguments. Do not use `@latest`, broad globs, a separate patch-then-minor pass, cooldown bypasses, or downgrades. If Yarn rejects a target, investigate once and adjust or defer it.
- Keep related package families aligned, such as Aksel, React/React DOM, and Storybook. Check peer requirements and affected resolutions against updated packages' declared dependencies. Exact pins matter: inspect FormatJS for React Intl and the full Faro/OpenTelemetry graph for APM updates. Do not retain incompatible overrides merely because install and tests pass.
- For audit findings, use `yarn why` and advisory affected/patched ranges to inspect every vulnerable path. Query publish dates once per additional transitive package and apply the same cooldown rules. Prefer targeted lockfile updates within each parent's declared range. Add a narrow resolution only when necessary and justified; keep incompatible major lines separate. Do not suppress alerts to make the audit pass.
- Keep source/test/config edits limited to compatibility required by selected updates. Use one dated dependency changelog entry for the branch, extending that entry for follow-ups. Record significant unresolved problems and deferred updates with package/current version, candidate or advisory where relevant, and the reason (cooldown, no fix, major migration, or compatibility). Do not list every unchanged package or rewrite historical entries from earlier maintenance runs.

## Validate and report

- After the final dependency changes, run `yarn install --immutable`, `yarn lint`, `yarn tsc --noEmit`, `yarn test --maxWorkers=2`, and `yarn build`. Inspect relevant peer warnings; use CSS lint or Storybook validation when affected. Ask before E2E unless already authorized. Rerun checks only when later changes or failures justify it.
- Run `yarn npm audit --all --recursive --json` again. Compare with the baseline and available GitHub findings. Separate actual vulnerabilities from deprecation notices. Report no-fix, cooldown-blocked, major-only, and compatibility-blocked findings instead of expanding the task into a migration.
- Review every changed-file diff. Keep Progress notes short. Record in Outcome: updated versions and affected resolutions; fixed advisory IDs; skipped updates and reasons; remaining findings and dependency paths; checks passed/failed/skipped; GitHub access limitations. Preserve these notes through review and intermediate commits until the user asks to clear them.
- A fixed lockfile is not proof that a GitHub alert is closed. Dependabot needs to rescan the default branch; image findings need a rebuilt image and a fresh scan. Never infer closure from issue search.
- Do not commit or push unless requested. Before a requested commit, ensure durable results and blockers are in the branch's changelog entry. Exclude the task file if only run notes changed, leaving those notes in the working tree. If reusable instructions also changed, stage only those instruction changes while preserving the filled notes locally. Do not reset notes to make the working tree clean. Do not move or archive the task file.

## Check the selector

```sh
node --test .github/skills/package-maintenance/scripts/select-updates.test.mjs
```

The tests cover candidate selection without network access. A full real maintenance run remains the acceptance check for the skill.
