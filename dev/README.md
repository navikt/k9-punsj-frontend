# Kjøre lokalt

## Prerequisite
* Starter `k9-punsj-frontend `lokalt på port `8103`(ellers må `APPLICATION_BASE_URL` endres i `*.env`-fil)
* Starter `k9-punsj` lokalt på port `8085` via klassen `K9PunsjApplicationWithMocks` og peke de tre konfigverdiene `AZURE_V1_discovery_url`, `AZURE_V2_discovery_url` og `AZURE_token_endpoint` til å peke mot `azure-mock` som starter opp som en del av `docker-compose`.

# Startup
1. `docker-compose up`
2. Starte k9-punsj
3. Starte k9-punsj-frontend