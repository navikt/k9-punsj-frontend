---
applyTo: "**/Dockerfile"
---

# Dockerfiles

> Merk: Denne instruksjonen er tilpasset `k9-punsj-frontend`.
> Kilde: `https://raw.githubusercontent.com/navikt/copilot/main/.github/instructions/docker.instructions.md`
> Innholdet er strammet inn for dette repoet, med vekt på dagens runtime-image, build-flyt i GitHub Actions og Nais deploy.
> Generiske eksempler for JVM, Go, Python, nginx og en mer normativ Chainguard-strategi er fjernet med vilje.
> Hvis filen gjenbrukes i et annet repo, oppdater base image-praksis, artifact-flyt, entrypoint og deploy-kontekst først.

Docker-endringer i dette repoet skal følge den etablerte container-flyten: applikasjonen bygges normalt utenfor Dockerfile, og Dockerfile brukes først og fremst til å pakke runtime-artifakter for deploy.

## Repo Docker context

- Repoet har én hoved-`Dockerfile`.
- Produksjonsbildet bygges i GitHub Actions med `nais/docker-build-push`.
- Dagens Dockerfile bruker en distroless Node runtime og kjører som non-root.
- Build-artifakter som `dist/`, `server.js` og runtime-filer kopieres inn i bildet etter at build er gjort utenfor Dockerfile.
- Docker er også i bruk lokalt gjennom `dev/docker-compose.yml`, men den filen er et lokalt hjelpesett, ikke produksjonscontaineren.

## Keep the current repo pattern

- Følg eksisterende repo-mønster før du foreslår en stor Docker-omlegging.
- Behandle Dockerfile som runtime packaging-lag med mindre oppgaven eksplisitt handler om container hardening eller build-flyt.
- Ikke innfør multi-stage build bare fordi det er et generelt mønster hvis oppgaven ikke ber om Docker-refaktor.
- Ikke bytt base image-strategi uten at oppgaven faktisk handler om det.

## Base image and runtime

- Behold non-root runtime.
- Følg eksisterende base image-praksis for små og mellomstore endringer.
- Hvis oppgaven eksplisitt gjelder hardening av container-bildet, kan base image-strategi vurderes som en egen bevisst endring.
- Ikke introduser full OS-images som `ubuntu`, `debian` eller lignende når runtime kan holdes slankere.

## Copy only what runtime needs

```dockerfile
# ✅ Foretrekk målrettet kopiering
COPY ./dist ./dist
COPY ./node_modules ./node_modules
COPY server ./

# ❌ Unngå brede kopier i final image
COPY . .
```

- Kopier bare det runtime faktisk trenger.
- Ikke bruk `COPY . .` i final image.
- Ikke kopier testfiler, `.git`, lokale notater eller annet som ikke trengs i runtime.
- Vær ekstra forsiktig med filer som gjør build-konteksten unødvendig stor.

## Secrets and safety

- Ikke legg secrets, tokens eller interne verdier i Dockerfile gjennom `ENV`, `ARG` eller hardkodede filer.
- Ikke bake inn miljøspesifikke hemmeligheter i containeren.
- Hold runtime-konfigurasjon og secrets i Nais eller GitHub Secrets der det allerede er repoets mønster.
- Hvis Dockerfile endres sammen med workflow eller deploy, vurder lekkasjerisiko i hele flyten samlet.

## Build and deploy coupling

- Dockerfile, `nais/docker-build-push`, Nais-manifest og deploy-workflows må sees i sammenheng.
- Når Dockerfile endres, vurder også:
  - artifact-strukturen fra build-steget
  - entrypoint og runtime-filplassering
  - `nais/**`
  - relevante workflows i `.github/workflows/`
- Ikke endre container-layout uten å sjekke hvordan workflowene forventer at bildet bygges og deployes.

## Current repo shape

Den nåværende Dockerfile-strukturen bygger på at repoet allerede har produsert runtime-artifakter før container-build:

```dockerfile
FROM gcr.io/distroless/nodejs22-debian12:nonroot

ENV TZ="Europe/Oslo"
ENV NODE_ENV=production

WORKDIR /app

COPY ./dist ./dist
COPY ./src/build/webpack/faroConfig.js ./dist/js/nais.js
COPY ./node_modules ./node_modules
COPY server ./

EXPOSE 8080
CMD ["./server.js"]
```

- Følg denne formen ved mindre justeringer.
- Hvis oppgaven krever en annen artifact-flyt eller ny entrypoint, kall det ut eksplisitt som en strukturendring.

## .dockerignore

- En `.dockerignore` er ønskelig hvis Docker-konteksten begynner å vokse eller Docker-arbeid er en del av oppgaven.
- Ikke legg til eller endre `.dockerignore` som sideeffekt av en helt annen feature uten at det gir tydelig verdi og er innenfor scope.

## Validation

- Når Dockerfile endres, vurder om `build-and-deploy-gcp.yml`, `deploy-preprod-gcp.yml` eller andre workflow-filer også må leses.
- Vurder om endringen påvirker image-innhold, startup, logging, Faro runtime-fil eller deploy-oppsett.
- Hvis Docker-endringen er sikkerhetsrelevant, vurder også workflow review og image/build review sammen.

## Boundaries

### Always

- Hold runtime-bildet så smalt som praktisk mulig
- Behold non-root runtime
- Kopier bare nødvendige runtime-filer
- Se Dockerfile, workflow og Nais i sammenheng når Docker endres

### Ask first

- Bytte base image-strategi
- Innføre multi-stage build der repoet i dag bygger utenfor Dockerfile
- Endre artifact-layout eller entrypoint
- Legge til `.dockerignore` som en del av en bredere containeropprydding

### Never

- `COPY . .` i final image
- Secrets i Dockerfile
- Root-bruker i produksjonsbilde uten eksplisitt grunn
- Store Docker-refaktorer utenfor oppgavens scope
