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

###For å kjøre opp mock i **oidc-auth-proxy**:
Oppdater "test.env" i oidc-auth-proxy:
````
CLIENT_ID=k9-punsj
PROXY_CONFIG={"apis":[{"path":"k9-punsj","url":"http://localhost:8085/api","scopes":"k9-punsj/.default"}]}
````

````
npm run start-dev-with-mocks
````

For å kjøre opp mock i **k9-punsj**, kjør *K9PunsjApplicationWithMocks*.

* Erstatt i filen MockConfiguration.kt: 
"AZURE_V2_discovery_url" to "http://localhost:8082/.well-known/openid-configuration",

## Enhetstester
Alle enhetstester er plassert i [src/test](src/test). De kan kjøres med følgende kommando:
````
npm run test
````
Testene kjører automatisk når ny kode dyttes til [master](https://github.com/navikt/k9-punsj-frontend).

## To do
* Utvide for flere søkere
* Utvide søknadsskjemaet

## Henvendelser
Spørsmål knyttet til koden eller prosjektet kan stilles som issues her på GitHub.
 
Interne henvendelser kan sendes via Slack i kanalen #sif_saksbehandling.

![k9-punsj-frontend](logo.png)
