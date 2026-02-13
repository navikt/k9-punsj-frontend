# Progress

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
