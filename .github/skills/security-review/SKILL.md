---
name: security-review
description: Pre commit and pre PR security review for k9-punsj-frontend with focus on secrets, workflows, auth, telemetry, and frontend data exposure
---

# Security review skill

> Merk: Denne varianten er tilpasset `k9-punsj-frontend`.
> Backend tunge eksempler for Kotlin, SQL og generiske tjenestemonstrer er fjernet med vilje.
> Hvis skillen skal gjenbrukes i et annet repo, oppdater hotspots, auth flyt, deploy kontekst og sikkerhetsregler forst.

Use this skill before commit, pull request, or merge when the change affects frontend data flow, auth, workflows, dependencies, runtime config, or logging.

For broader threat modeling or architecture decisions, use `@frontend-security-agent`.

## Automated checks

Run relevant checks from repo root:

```bash
# Repo level vulnerability and secret scan
trivy repo .

# GitHub Actions workflow review
zizmor .github/workflows/

# Quick history scan for obvious secret patterns in frontend and workflow files
git log -p --all -S 'secret' -- '*.ts' '*.tsx' '*.js' '*.yml' '*.yaml' | head -100
git log -p --all -S 'token' -- '*.ts' '*.tsx' '*.js' '*.yml' '*.yaml' | head -100
```

## Repo specific hotspots

Review these areas together when they are touched:

- `server/server.js`
- `server/src/reverse-proxy.js`
- `nais/**`
- `.github/workflows/**`
- `src/app/App.tsx`
- `src/app/index.html`
- `src/build/scripts/sentry-release.js`

## What to look for

### Secrets and sensitive data

- No hardcoded tokens, credentials, or internal secrets.
- No personopplysninger or sensitive values in logs, prompts, fixtures, screenshots, or telemetry payloads.
- No secrets copied into generated config or browser visible runtime state.

### Auth and access boundaries

- Auth flow changes keep Azure and Wonderwall behavior intentional.
- OBO forwarding in `server/src/reverse-proxy.js` is not loosened accidentally.
- Nais `accessPolicy` stays minimal and task driven.

### Workflows and supply chain

- Workflow permissions stay minimal.
- New external actions or scripts are justified and pinned appropriately.
- Dependency changes do not introduce obvious risk without need.

### Telemetry and observability

- Sentry and Faro setup do not expose user sensitive data.
- Errors, tags, or custom metadata avoid personopplysninger.
- Release or deploy scripts do not leak secrets into logs.

## Review checklist

- [ ] No hardcoded secrets or credentials
- [ ] No personopplysninger in logs, telemetry, prompts, or screenshots
- [ ] Auth and proxy behavior remain intentional
- [ ] Nais access policy remains minimal
- [ ] Workflow permissions are still least privilege
- [ ] `trivy repo .` reviewed
- [ ] `zizmor .github/workflows/` reviewed when workflows changed
- [ ] Security sensitive changes have a matching test or explicit manual verification note
