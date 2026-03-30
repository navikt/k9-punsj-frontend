# Changelog

Kort logg over merkbare repo-endringer og oppsettendringer.

## Unreleased

### Workflow action pinning (2026-03-30)

- Pinned eksterne GitHub Actions og reusable workflows i `.github/workflows/**` til konkrete commit SHA-er, blant annet `actions/*`, `cypress-io/github-action`, `nais/*` og `navikt/sif-gha-workflows` sin `trivy`-workflow.
- Fjernet flytende referanser som `@main` og brede versjonstaggar fra workflowene, slik at CI-oppsettet ikke automatisk følger nye upstream-endringer.

### Dependency remediation (2026-03-30)

- La til målrettede `resolutions` for `ajv`, `minimatch`, `path-to-regexp`, `picomatch`, `serialize-javascript`, `svgo`, `terser-webpack-plugin` og `yaml`, slik at dagens security alerts kan ryddes uten major-løft for React eller Aksel.
- Fjernet stale eller overflødige manifest-oppføringer, blant annet gamle router- og logger-typer, `baseline-browser-mapping`, `jest-extended` og `eject`-scriptet. `redux-logger` ble beholdt kun for ikke-produksjonsmiljøer.
- Byttet legacy form compat-komponentene fra udeklarert `clsx` til eksisterende `classnames`, og verifiserte endringen med grønn `yarn lint`, grønn `yarn test --maxWorkers=2`, grønn `yarn build` og grønn `yarn build-storybook`.
- Løftet `eslint` og `@eslint/js` videre innenfor `9.x`, fra `9.39.2` til `9.39.4`, som en trygg oppfølging mens `ESLint 10` fortsatt er blokkert av plugin-økosystemet.

### Package cleanup (2026-03-30)

- Fjernet ni ubrukte eller redundante devDependencies fra rotmanifestet, blant annet gamle typepakker og ubrukt Jest, Babel og webpack-relatert tooling.
- Verifiserte cleanupen med grønn `yarn lint` og grønn `yarn test --maxWorkers=2`.

### Opprett journalpost (2026-03-30)

- Viser `behandlingsår` i fagsak-valgene på `Opprett journalpost` når verdien finnes på fagsaken.
- Bruker `behandlingsår` fra API som kilde i stedet for å utlede år i frontend.
- Oppdaterte mocken for `api/k9-punsj/saker/hent` slik at feltet samsvarer med frontend-kontrakten.

### Copilot setup (2026-03-16 to 2026-03-18)

- La til repo-oppsett med `AGENTS.md` og `.github/copilot-instructions.md`.
- La til repo-tilpassede agents, skills, prompts og file-specific instructions.
- La til `.vscode/mcp.json` og oppdaterte `copilot-setup-steps.yml` for GitHub coding agent.
- La til `copilot-tasks/template-task.md` og etablerte et tydelig task file protocol med `Plan`, `Progress notes` og `Outcome`.
- La til `docs/copilot-workflow.md` og oppdaterte README med kort guide til arbeidsformer, taskfiler, agents og GitHub cloud-flyt.
- Presiserte regler for lokal bruk versus GitHub cloud, inkludert branch, PR og push-flyt.
- Strammet inn Copilot-guidance og reduserte overlapp mellom `AGENTS.md` og `.github/copilot-instructions.md`.
- Ryddet opp i etterfolgende review-tilbakemeldinger for språkregler, taskfil-scope og dokumentasjonskonsistens.
- Presiserte at ASCII-regelen bare gjelder commit-meldinger, mens norsk dokumentasjon, prompts og taskfiler skal bruke vanlig skrivemåte.
- La til kort testkontekst i `AGENTS.md` om mock-basert e2e-flyt versus backend-integrert lokal validering.
- La til `docs/CHANGELOG.md` som logg for merkbare repo- og oppsettendringer.
