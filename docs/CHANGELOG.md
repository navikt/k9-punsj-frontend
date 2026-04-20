# Changelog

Kort logg over merkbare repo-endringer og oppsettendringer.

### Faro analytics skips SDK dedupe for manual punsj events (2026-04-20)

- Lar nå manuelle `Faro`-events for `Opprett journalpost` og `PSB`-submit gå med `skipDedupe`, slik at gjentatte men legitime analytics-hendelser ikke lettere faller bort i frontend-SDK-et.
- Holder custom analytics-sporet smalt, men gjør det tryggere å sammenligne flere manuelle journalpost-innsendinger over tid i Grafana.

### Faro initialization waits for nais config (2026-04-20)

- Venter nå eksplisitt på at `nais.js` skal lastes ferdig før `initializeFaro(...)` kjøres i frontend.
- Gjør frontend-observability mer stabil ved direkte inngang i appen, der `window.nais` tidligere kunne være utilgjengelig akkurat når appen startet.

### Faro custom events for manual journalpost flow (2026-04-13)

- La til en liten `Faro` helper for manuelle frontend-events, som første steg mot produktmåling i stedet for bare teknisk observability.
- Sender nå et første trygt custom `Faro` event når brukeren åpner `Opprett journalpost`, slik at vi kan verifisere at custom `Faro` events er synlige i dev og kan brukes i egne Grafana-panels senere.
- Lagrer nå hvilke journalposter som blir opprettet manuelt i sesjonen, slik at videre punsjflyt kan kobles tilbake til `Opprett journalpost` uten å sende persondata eller interne payload-verdier til analytics.
- Sender nå `Faro` submit-events for `PSB` basert på kvitteringen fra backend, men med bevisst smal taksonomi. Foreløpig måles bare `arbeidstid`, `trekk_av_periode`, `periode` og samlet `annet`, slik at vi kan teste hypotesen uten å sende unødvendig detaljgrad til analytics.
- La til en smal enhetstest for helperen, inkludert guard når `telemetryCollectorURL` mangler og verifisering av forventet payload for det første eventet.

### Package maintenance follow up (2026-04-10)

- Lot `axios@1.15.0` vente foreløpig, fordi repoets `npmMinimalAgeGate: 7d` i `.yarnrc.yml` blokkerer den versjonen frem til minst 2026-04-15, og vi ønsket ikke å omgå den policyen i samme pass.
- Løftet direkte `lodash` og pinned `lodash-es` fra `4.17.23` til `4.18.1` etter at begge versjonene var eldre enn repoets `npmMinimalAgeGate: 7d`, slik at de kjente advisories for `_.template`, `_.unset` og `_.omit` ikke lenger treffer repoets manifest.
- Løftet `react-hook-form` fra `7.72.0` til `7.72.1` som et lite patch-pass etter at versjonen hadde passert repoets `npmMinimalAgeGate: 7d`.
- Løftet `react-router` og `react-router-dom` fra `7.13.2` til `7.14.0` som et lite maintenance-pass etter at minor-versjonen hadde passert repoets `npmMinimalAgeGate: 7d`.
- Fjernet ubrukt direkte `axios` fra `server/package.json` etter at gjennomgang av repoet og git-historikken ikke viste noen faktisk bruk i `server/**` eller `src/**`. Dermed forsvinner den direkte server-avhengigheten i stedet for å bli bumpet uten grunn.
- Fjernet også ubrukte direkte server-avhengigheter `@sentry/cli`, `node-cache` og `openid-client`, siden de ikke brukes i dagens serverkode eller scripts.
- Fjernet stale `eslintConfig` med `plugin:storybook/recommended`, fjernet `eslint-plugin-storybook` og den redundante direkte `@typescript-eslint/eslint-plugin`-avhengigheten, siden repoet nå styres av `eslint.config.js` og `typescript-eslint`.
- Erstattet `start-server-and-test` for lokale `test:e2e` og `test:e2eUI` med et lite repo-lokalt Node-script som starter `start:e2e`, venter på `/health/isReady`, kjører Cypress og stopper dev-serveren etterpå.
- La tilbake `@sentry/cli` i `server/package.json` etter at prod-deploy viste at `yarn sentry-release` fortsatt kjøres etter `yarn workspaces focus @k9-punsj-frontend/server --production`. Avhengigheten er dermed fortsatt nødvendig i dagens deployflyt, selv om den ikke brukes av serverkoden direkte.

### TypeScript config and Tailwind cleanup (2026-04-10)

- Fjernet deprecated `baseUrl` fra `tsconfig.json` og lot aliasen `app/*` peke eksplisitt til `./src/app/*`, slik at TypeScript 5.9 ikke varsler om oppsett som slutter å fungere i TypeScript 7.
- La tilbake en Cypress-spesifikk `baseUrl` i `cypress/tsconfig.json`, slik at e2e-spesifikasjonene fortsatt kan løse `app/*` uten å reintrodusere deprecated oppsett i hovedkonfigurasjonen.
- Byttet `max-w-[28.125rem]` til kanonisk Tailwind klasse `max-w-112.5` i `TidsbrukKalender`.
- Fulgte opp reviewfunn med guard for tomme kalenderperioder, stabil `useOnClickOutside`-listener, tryggere immutability rundt `lodash/set` i skjemaoppdateringer og mer typesikker oppbygging av test-store i `src/test/testUtils.tsx`.

### Send brev for handled journalpost (2026-04-08)

- Strammet inn `Send brev` for ferdig håndterte journalposter med uavklart `sakstype`, slik at brukeren må velge en konkret ytelsestype før brevflyten kan åpnes videre.
- Viser nå tydelig warning når journalposten mangler avklart ytelsestype, og stopper direkte navigasjon til brevflyten når verken journalpost eller valgt dokumenttype gir en gyldig `sakstype`.
- La til egen mock-journalpost og målrettet Cypress-dekning for handled journalpost med `sakstype = '-'`, slik at scenariet kan verifiseres visuelt i testmodus.
- Finjusterte oppfølgingen med mer presis warning-tekst, flyttet warning nærmere handlingene på skjermen, rettet spacing i kopieringsvelgeren og gjorde mock-journalposten mer konsistent ved å sette `erFerdigstilt = true` for handled-scenariet.

### Workflow action pinning (2026-03-30)

- Pinned eksterne GitHub Actions og reusable workflows i `.github/workflows/**` til konkrete commit SHA-er, blant annet `actions/*`, `cypress-io/github-action`, `nais/*` og `navikt/sif-gha-workflows` sin `trivy`-workflow.
- Fjernet flytende referanser som `@main` og brede versjonstaggar fra workflowene, slik at CI-oppsettet ikke automatisk følger nye upstream-endringer.
- Justerte `trivy`-workflowen til SHA for daværende `main` i `navikt/sif-gha-workflows`, slik at pinningen beholder samme oppførsel som før og ikke låser repoet til en eldre `v1`-variant.

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
