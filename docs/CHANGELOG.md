# Changelog

Kort logg over merkbare repo-endringer og oppsettendringer.

### Patch remediation for postcss og ip-address (2026-05-11)

- Løftet `postcss` til `8.5.13` og la inn targeted resolutions for `postcss` og `ip-address@npm:^10.0.1` for å lukke den tillatte patch-delen av package security-oppfølgingen.
- Oppdaterte `yarn.lock` slik at lokal audit ikke lenger viser `postcss` eller `ip-address`, mens `fast-uri` og Babel-sporet fortsatt venter på at 7 dagers cooldown skal passere.

### Tillatte patch updates for direkte dependencies (2026-05-11)

- Løftet `@tanstack/react-query` til `5.100.9`, `@babel/preset-env` til `7.29.3`, `@eslint/js` til `10.0.1` og `@types/react` til `19.2.14`, fordi disse patch-versjonene allerede var utenfor repoets 7 dagers cooldown.
- Ryddet samtidig tre `no-useless-assignment`-feil i `src/app/api/api.ts` som ble synlige etter `@eslint/js`-oppdateringen, uten å endre feilflyten funksjonelt.

### Nærmeste tillatte minor updates (2026-05-11)

- Løftet `react-hook-form` til `7.75.0`, `msw` til `2.14.2` og `stylelint` til `17.10.0`, fordi dette var de nærmeste minor-versjonene som allerede lå utenfor repoets 7 dagers cooldown.
- Oppdaterte `yarn.lock` med den tilhørende transitive halen, særlig rundt `msw`, uten å blande inn andre minor- eller major-løft fra backloggen.

### Copilot task archive folder (2026-05-07)

- Opprettet `copilot-tasks/completed/` for ferdige repo-taskfiler.
- La til en arkivplassering for ferdige Copilot-taskfiler i `copilot-tasks/completed/`, mens `template-task.md` fortsatt ligger i roten sammen med øvrige taskfiler.

### Package cooldown guidance (2026-05-07)

- Presiserte i `AGENTS.md` at repoets 7 dagers cooldown for npm-oppdateringer skal respekteres under package maintenance.
- Presiserte at en tilsynelatende manglende fersk versjon i Yarn under cooldown ikke skal tolkes som at pakken mangler, og at man i stedet skal velge nyeste eldre stabile versjon som allerede er utenfor cooldown-vinduet.

### Punsj submit analytics for alle flyter (2026-05-07)

- Sender nå et trygt `Faro` volume-event for hver fullførte punsj-innsending, med `source=opprett_journalpost` eller `source=other` og `sakstype`.
- Beholder detaljerte snapshot- og feltgruppe-events bare for manuelt opprettede journalposter.

### README-grenser oppdatert (2026-05-06)

- Rot-README er gjort kortere og tydeligere som contributor-entrypoint.
- Detaljert lokal dev-oppsett (docker-oppsett, journalpost-tabeller, mock-scenarioliste) er flyttet til `dev/README.md`.
- Mock-scenariotabellen i `dev/README.md` utvidet med spesifikke sakstyper og scenario-beskrivelser fra fixtures.
- PAT-scope-ordlyd harmonisert til `read:packages` i begge filer.
- Overflødig ekstern bilde-URL fjernet fra rot-README; `logo.png` beholdt.

### K9 saksnummer for create requests (2026-05-04)

- Stopper create søknad-kall når `k9saksnummer` mangler eller er blankt, i stedet for å sende en request som backend ikke kan decode.
- Leser `k9saksnummer` fra `fordelingState.fagsak` først og bruker `journalpost.sak` som fallback etter journalføring eller reload.
- Prioriterer `journalpost.sak` når journalposten er ferdigstilt, og bruker `søknad.k9saksnummer` som fallback i OLP og PSB punch ved reload.
- Bruker samme resolver i OLP kursperiodeoppslag og i eksisterende-søknad-tabellenes fagsak-sammenligning.

### OMPAO manual journalpost analytics (2026-04-24)

- Sender nå `Faro` start- og submit-måling for `OMPAO` når flyten kommer fra manuelt opprettet journalpost.
- Mapper `OMPAO` submit-kvitteringen til trygge feltgrupper for `barn` og `periode`.

### OMPUT manual journalpost analytics (2026-04-24)

- Sender nå `Faro` start- og submit-måling for `OMPUT` når flyten kommer fra manuelt opprettet journalpost.
- Mapper `OMPUT` submit-kvitteringen til trygge feltgrupper for `arbeidstaker`, `frilanser` og `selvstendig`.

### OLP manual journalpost analytics (2026-04-24)

- Sender nå `Faro` start- og submit-måling for `OLP` når flyten kommer fra manuelt opprettet journalpost.
- Mapper `OLP` submit-kvitteringen til trygge feltgrupper for `arbeidstid`, `trekk_av_periode`, `periode`, `kurs`, `reise`, `ferie`, `utenlandsopphold`, `bosted`, `uttak`, `omsorg` og `opptjening`.

### OMPMA manual journalpost analytics (2026-04-24)

- Sender nå `Faro` start- og submit-måling for `OMPMA` når flyten kommer fra manuelt opprettet journalpost.
- Mapper `OMPMA` submit-kvitteringen til trygge feltgrupper for `barn` og `annen_forelder`.

### OMPKS manual journalpost analytics (2026-04-24)

- Sender nå `Faro` start- og submit-måling for `OMPKS` når flyten kommer fra manuelt opprettet journalpost.
- Mapper `OMPKS` submit-kvitteringen til den trygge feltgruppen `kronisk_eller_funksjonshemming`.

### PLS manual journalpost analytics (2026-04-24)

- Sender nå samme type `Faro` start- og submit-måling for `PLS` når flyten kommer fra manuelt opprettet journalpost.
- Mapper `PLS` submit-kvitteringen til trygge feltgrupper for `arbeidstid`, `trekk_av_periode`, `periode`, `ferie`, `utenlandsopphold`, `bosted` og `opptjening`.

### PSB manual journalpost analytics field groups (2026-04-24)

- Deler nå `PSB` submit-analytics for manuelt opprettede journalposter i flere trygge feltgrupper, blant annet `tilsyn`, `beredskap`, `nattevaak`, `ferie`, `utenlandsopphold`, `bosted`, `uttak`, `omsorg` og `opptjening`.
- Beholder samme `Faro` eventmodell og source-gating mot manuell `Opprett journalpost`.

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
