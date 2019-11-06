# k9-punsj-frontend

Frontend for manuell "punching" av papirsøknader som kommer inn for ytelser i kapittel 9.

## Komme i gang
For å kjøre opp applikasjonen:
````
npm install
npm start
````

## Teststub
Applikasjonen kan kjøres uten backend ved hjelp av teststub generert av Jsonserver.

Følgende kommando installerer Jsonserver:
````
npm install -g json-server
````

Følgende kommando vil kjøre opp testdata generert av Jsonserver på port 4000:
````
npm run mock:api
````
Testdataen er plassert i `src/app/testdata`.

## To do
* Fastsette inputfelter
* Håndtere hele flyten
* Tilpasse design
* Tekster

## Henvendelser
Spørsmål knyttet til koden eller prosjektet kan stilles som issues her på GitHub.
 
Interne henvendelser kan sendes via Slack i kanalen #sif_saksbehandling.
