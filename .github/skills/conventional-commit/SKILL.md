---
name: conventional-commit
description: Conventional commit messages for k9-punsj-frontend with dry wording, Norwegian by default, and repo specific commit rules
---

# Conventional commit skill

> Merk: Denne varianten er tilpasset `k9-punsj-frontend`.
> Kilde: `https://raw.githubusercontent.com/navikt/copilot/main/.github/skills/conventional-commit/SKILL.md`
> Innholdet er tilpasset repoets faktiske commit-praksis og reglene i `AGENTS.md`.
> Scope er valgfritt i dette repoet. Tørre conventional prefixes er viktigere enn å presse inn scope hver gang.
> Hvis skillen skal gjenbrukes i et annet repo, oppdater språkvalg, commit-regler og eksempler først.

Use this skill when you need to generate a commit message for `k9-punsj-frontend`.

## Repo rules

- Use a conventional prefix such as `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`, `build:` or `ci:`.
- Use Norwegian by default for the commit message.
- Keep the message ASCII only. Do not use `æ`, `ø` or `å`.
- Keep the wording dry and professional.
- Do not add AI attribution.
- Scope is optional. Use it only when it makes the message clearer.
- Avoid strong or promotional wording.

## Preferred format

```text
<type>: <description>
```

Scope can be used when it helps:

```text
<type>(<scope>): <description>
```

Examples:

```text
chore: legg til repo skills for copilot
docs: oppdater readme for arbeidsflyt og copilot
fix(forms): håndter tom soeknadId ved korrigering
chore(nais): oppdater deployflyt for preprod
```

## Types

| Type | Usage |
| --- | --- |
| `feat` | New functionality |
| `fix` | Bug fix |
| `docs` | Documentation only changes |
| `refactor` | Code cleanup without new behavior |
| `test` | New or updated tests |
| `build` | Build system or dependency changes |
| `ci` | CI or workflow changes |
| `chore` | Repo setup, tooling or other maintenance changes |

## Description rules

- Keep the first line short and easy to scan.
- Prefer imperative form.
- Do not end the first line with a period.
- Use the actual area of change, not a vague summary.
- If the repo uses Norwegian wording for the domain, keep it Norwegian.
- If an identifier must stay ASCII, transliterate naturally, for example `soeknad` instead of `søknad`.

## Scope guidance

Use scope only when it genuinely adds clarity:

```text
fix(auth): håndter utlop ved tokenfornyelse
docs(readme): oppdater lokal utviklingsflyt
chore(copilot): legg til repo instrukser for utvalgte filer
```

Skip scope when the change is already clear without it:

```text
chore: legg til repo skills for copilot
docs: oppdater readme for arbeidsflyt og copilot
```

## Body and footer

- Add a body only when the change needs extra context.
- Add a footer only when the task or team practice clearly needs one.
- Do not force issue references if the repo does not consistently use them.

Example with body:

```text
fix: handter manglende journalpost ved mocket e2e-kjoring

Sikrer at fallback-mock brukes nar journalpostnummeret
ikke har en egen fixture i testoppsettet.
```

## Breaking changes

Use `!` and a `BREAKING CHANGE:` footer only when the change really breaks consumers or established behavior.

```text
feat(api)!: endre format pa runtime config

BREAKING CHANGE: klienter ma lese config fra nytt feltoppsett.
```

## Analyze the staged diff

Before suggesting a commit message, inspect the staged changes:

```bash
git diff --cached --stat
git diff --cached
```

Then:

1. Identify the main type.
2. Decide whether scope adds clarity.
3. Write a short Norwegian description in dry wording.
4. Add body only if the change needs explanation.
5. Add breaking footer only if behavior or contract actually breaks.
