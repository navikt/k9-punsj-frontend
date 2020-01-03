# k9-punsj-frontend

Frontend for manuell "punching" av papirsøknader som kommer inn for ytelser i kapittel 9.

## Komme i gang
For å kjøre opp applikasjonen:
````
npm install
npm start
````

## Backend-mock
Applikasjonen er avhengig av [oidc-auth-proxy](https://github.com/navikt/oidc-auth-proxy) og [k9-punsj](https://github.com/navikt/k9-punsj). Disse har innebygget mocking.

For å kjøre opp mock i **oidc-auth-proxy**:
````
npm run start-dev-with-mocks
````

For å kjøre opp mock i **k9-punsj**, kjør *K9PunsjApplicationWithMocks*.

## To do
* Utvide for flere søkere
* Utvide søknadsskjemaet

## Henvendelser
Spørsmål knyttet til koden eller prosjektet kan stilles som issues her på GitHub.
 
Interne henvendelser kan sendes via Slack i kanalen #sif_saksbehandling.
