# Changelog

Kort logg over merkbare repo-endringer og oppsettendringer.

## Unreleased

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
