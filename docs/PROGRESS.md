# Progress

## 18.02.2026

- La til midlertidig PSB-workaround for legacy `Feil{...}` i `feilkode` når `feilmelding` er tom, inkludert parsing av melding og mapping fra `valideringRegistrertUtlandet` til konkret `landkode`-felt.
- Knyttet `ErrorSummary`-lenke for denne feilen til `#sn-registrert-land` og viste feilen direkte på feltet for registrert land i SN-panelet.
- Fjernet duplikat av samme legacy-feil i SN sin generelle ubehandlede feilliste når den allerede er håndtert på `landkode`-felt.
- La til tester for parsing, feltmapping og `ErrorSummary`-lenking for legacy-kaset.

## 17.02.2026

- Erstattet nederste valideringsliste i PSB med `ErrorSummary` fra Aksel for konsistent feilvisning.
- Fjernet separat `Alert` for `inputErrors` i PSB for å unngå dobbel feilkommunikasjon.
- La inn fallback i PSB slik at `validateSoknadError.message` vises i `ErrorSummary` når backend ikke returnerer feltlisten `feil`.
- La til `href` i PSB `ErrorSummary` der feilsti kan mappes til konkret felt.
- Innførte stabile input-id-er for periodefelt og landfelt i PSB slik at feillenker peker til riktig kontroll.
- Endret PSB `ErrorSummary` til å vise hele backend-listen av valideringsfeil i stedet for kun `unhandled` feil.
- La til `href`-mapping for valideringsstier med listeelementformat (`ytelse.søknadsperiode[0].<list element>` og `ytelse.trekkKravPerioder[0].<list element>`).
- Normaliserte PSB `ErrorSummary`-tekst for generiske periodefeil med feltkontekst og fjernet duplikat av periodemelding i `medlemskap`-blokken.
- La til indekskontekst i PSB `ErrorSummary` for listeelementfeil (`periode N`) og verifiserte lenking for `ytelse.trekkKravPerioder[1].<list element>`.
- Rettet PSB path-matching for valideringsfeil slik at riktig arrayelement velges for både indeksbaserte stier (`[1]`) og periodebaserte nøkler (`perioder['fom/tom']`) i feltfeil.
- Normaliserte åpen sluttperiode i PSB-feilstier (`9999-12-31` -> `..`) slik at feltfeil og `ErrorSummary`-lenker treffer riktig input, inkludert `ytelse.utenlandsopphold.perioder[...] .land`.
- Rettet PSB feltvisning for `lovbestemtFerie` når backend sender periodesti med nøkkel (`perioder['../dato']`) ved å mappe indekssti til faktisk periodenøkkel før oppslag av feltfeil.
- Rettet PSB mapping for `ytelse.opptjeningAktivitet.selvstendigNæringsdrivende[0].okOrganisasjonsnummer` slik at feltfeil vises under organisasjonsnummer-feltet og `ErrorSummary`-lenken peker til riktig input.
- Oppdaterte PSB formtester for ny `ErrorSummary` visning og fallback-scenario.

## 12.02.2026

- Oppdaterte PSB `valider` handling til `ProblemDetail` i frontend action, fjernet `X-Nav-NorskIdent` header og lot ikke-`400` gå via `convertProblemDetailToError`.
- Innførte delt API-type `ApiProblemDetail` for feilhåndtering.
- Ekstraherte PSB feilparsing til `psbErrorUtils`.
- La til og oppdaterte tester for `apiUtils`, `PSBPunchFormActions`, `psbErrorUtils` og `PSBPunchForm`.

## 10.02.2026

- Oppdaterte PSB `submit` til å håndtere `ProblemDetail` for `400`, `409` og `500`.
- Fjernet bruk av `convertResponseToErrorNew` i PSB flyten og tok i bruk felles helper `convertProblemDetailToError`.
- Leste `400` valideringsfeil fra `ProblemDetail` (`feil`) og lot `409` og øvrige feil gå i generell submit error flow.
- Oppdaterte reducer og container-visning for konflikt og generell submit-feil.
- La til og oppdaterte tester i `apiUtils` for `ProblemDetail` parsing og fallback.

## 05.01.2026

- Oppgraderte `react-intl` fra v7 til v8.
- Oppdaterte Jest-konfigurasjon for ESM-transform av `react-intl`, `@formatjs` og `intl-messageformat`.
- Fjernet midlertidig type-workaround `src/@types/react-intl.d.ts`.
- Oppdaterte `TestIntlProvider` til `React.PropsWithChildren`.
- Endret Sentry CLI import til named export (`{ SentryCli }`) etter pakkeendring.

## 17.12.2025

- Fjernet `checkPeriodsWithinSoknadsperioder`.
- Tok i bruk `validatePeriodsWithinSoknadsperioder` for periodevalidering mot søknadsperioder.
- Oppdaterte `ArbeidstidPeriodeListe` og `TilsynPeriodeListe` til ny validering.
- Utvidet `periodUtils` tester med scenario for ugyldige søknadsperioder.
