# Copilot task

## Task

- Title: Weekly package maintenance
- Branch: the current feature branch; do not work on `master`
- Suggested agent: default coding agent
- Prompt language: English

## Goal

Update root and server dependencies to eligible stable patch/minor versions and fix eligible transitive security findings. Keep major migrations separate.

## Scope

Follow the [package-maintenance skill](../.github/skills/package-maintenance/SKILL.md). Change manifests, lockfile, and one dated changelog entry; edit source, tests, or config only for required compatibility. Keep unrelated refactors, registry/cooldown configuration changes, and new dependencies out of scope.

## Validation

Use the skill's validation, including `yarn npm audit --all --recursive --json`. Record results and limitations in the local Outcome. Keep significant deferred updates and their reasons in the branch's existing changelog entry. Leave filled run notes uncommitted and preserve them through intermediate commits; clear them only when the user asks. Commit only reusable instruction changes from this file.

## Prompt for Copilot

Use the package-maintenance skill at `.github/skills/package-maintenance/SKILL.md` and follow this task. Read existing notes and update Plan first; continue an active run from its pending step instead of starting over after an intermediate commit. For a new run, run the read-only version selector once. Apply eligible direct and transitive updates, validate, and finish Outcome with updated versions, fixed/remaining advisories, skips, and check results. Keep Progress notes short. Add significant skipped updates and reasons to the existing changelog entry. Do not commit or push unless requested. Leave filled run notes uncommitted; clear them only when the user asks. Commit only reusable instruction changes from this file.

## Plan

- [ ] Discover eligible updates and security findings.
- [ ] Apply compatible direct/transitive updates and review resolutions.
- [ ] Validate and record results.

## Progress notes

- Record selected versions, exceptions, and blockers only.

## Outcome

- Updated packages and resolutions:
- Fixed advisories:
- Remaining findings and skipped updates:
- Validation and GitHub access limitations:
