---
applyTo: ".github/workflows/*.{yml,yaml}"
---

# GitHub Actions workflows

> Merk: Denne instruksjonen er tilpasset `k9-punsj-frontend`.
> Kilde: `https://raw.githubusercontent.com/navikt/copilot/main/.github/instructions/github-actions.instructions.md`
> Innholdet er strammet inn for dette repoet, med vekt på dagens Node, Yarn, Nais og reusable workflow-oppsett.
> Generiske eksempler for Gradle, pnpm, Go og et annet deploy-lop er fjernet med vilje.
> Hvis filen gjenbrukes i et annet repo, oppdater workflow-mønstre, deployflyt, secrets og verktøyvalg først.

Workflow-filer i dette repoet skal følge eksisterende mønstre for Node 20, Yarn 4, GitHub Packages, reusable workflows og Nais deploy.

## Repo workflow context

- Flere workflows er reusable workflows med `workflow_call`, blant annet `lint.yml`, `test.yml`, `build.yml` og `cypress-tester.yml`.
- Pull requests valideres gjennom `valid-pull-request.yml`.
- Preprod deploy kjøres manuelt gjennom `deploy-preprod-gcp.yml`.
- Produksjonsdeploy trigges av push til `master` gjennom `build-and-deploy-gcp.yml`.
- Node settes opp med `actions/setup-node@v6`.
- Dependencies installeres med `yarn install --immutable`.
- GitHub Packages for `@navikt` settes opp eksplisitt i workflowene.
- `zizmor .github/workflows/` er et relevant review-verktøy når workflows endres.

## Keep existing repo patterns

- Følg etablerte repo-mønstre før du introduserer nye workflow-strukturer.
- Behold reusable workflows når de allerede dekker behovet.
- Ikke refaktorer workflow-struktur bredt når oppgaven bare gjelder et lite behavior eller en liten deploy-endring.
- Hvis oppgaven ikke er workflow-relatert, ikke endre workflows bare for å "rydde opp".

## Permissions

Sett eksplisitte `permissions` og hold dem så små som mulig.

```yaml
permissions:
  contents: read
```

For deploy-jobber på Nais er `id-token: write` vanlig når workload identity brukes:

```yaml
permissions:
  contents: read
  id-token: write
```

Bruk bare ekstra rettigheter når jobben faktisk trenger dem.

## Dependencies and setup

Bruk repoets etablerte Node og Yarn-oppsett:

```yaml
- name: Sette opp Node
  uses: actions/setup-node@v6
  with:
    node-version: 20.x
    registry-url: https://npm.pkg.github.com/
    scope: '@navikt'

- name: Installere moduler
  run: yarn install --immutable
```

- Behold GitHub Packages-oppsett for `@navikt` når workflowen trenger dependencies.
- Ikke bytt til `npm` eller `pnpm` i workflowene for dette repoet.
- Når artefakter bygges i én jobb og brukes i en annen, følg eksisterende artifact-mønstre i repoet.

## Deploy and Nais

- Hold deploy-logikk i tråd med dagens repo-flyt:
  - validering på pull request
  - manuell preprod deploy
  - automatisk produksjonsdeploy på push til `master`
- Behold koblingen mellom workflow, `nais/k9-punsj-frontend.yml` og riktig `nais/*.yml` vars-fil.
- Når deploy-workflows endres, vurder alltid manifest, vars-fil, image-build og deploy-steg samlet.
- Ikke endre deploy-rekkefølge eller miljøflyt uten at oppgaven faktisk krever det.

## Secrets and safety

```yaml
env:
  API_KEY: ${{ secrets.MY_API_KEY }}
```

- Bruk GitHub Secrets eller repo/environment vars der det er etablert mønster.
- Ikke hardkod hemmeligheter, tokens eller interne verdier.
- Ikke logg secrets eller token-lignende verdier i workflow-output.
- Vær forsiktig med shell-kommandoer som kan ekkoe miljøvariabler utilsiktet.

## Security review

- Sjekk `permissions`, secrets, artifact-flyt og deploy-steg når workflows endres.
- Sjekk nye actions og scripts kritisk før de tas inn.
- Bruk `zizmor .github/workflows/` når workflows er endret eller gjennomgås.
- Behandle workflow-endringer som sikkerhetsrelevante, ikke bare som CI-opprydding.

## Action versions

- Følg etablert repo-praksis for action-versjoner når du gjør små eller mellomstore workflow-endringer.
- Hvis oppgaven eksplisitt handler om workflow-hardening eller action-pinning, gjennomfør det som en egen bevisst endring i stedet for å blande det inn i en tilfeldig feature-endring.
- Ikke oppgrader flere actions samtidig uten en klar grunn og en tydelig reviewflate.

## Reusable workflows

```yaml
jobs:
  test:
    uses: ./.github/workflows/test.yml
    secrets:
      READER_TOKEN: ${{ secrets.READER_TOKEN }}
```

- Foretrekk eksisterende reusable workflows når du trenger lint, test, build eller Cypress i en ny workflow.
- Hold input, secrets og artifact-forventninger konsistente mellom kallende workflow og reusable workflow.
- Spør først før du introduserer en ny reusable workflow bare for en liten variasjon.

## Boundaries

### Always

- Sett eksplisitte `permissions`
- Følg repoets Node, Yarn og GitHub Packages-mønster
- Hold deploy-workflows i tråd med faktisk Nais-flyt i repoet
- Sjekk secrets, shell-bruk og artifact-flyt ved workflow-endringer
- Kjør eller vurder `zizmor` når workflows endres

### Ask first

- Nye secrets eller environment variables
- Endringer i deploy-rekkefølge eller miljøflyt
- Nye reusable workflows
- Store workflow-refaktorer eller bred action-hardening

### Never

- `permissions: write-all`
- Hardkodede secrets eller logging av secrets
- `pull_request_target` med checkout av PR-branch
- Tilfeldig bytte av package manager eller CI-mønster i workflowene
- Brede workflow-endringer utenfor oppgavens scope
