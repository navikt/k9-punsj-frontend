# Copilot workflow

Kort guide for praktisk bruk av Copilot i dette repoet.

## Velg riktig arbeidsform

### 1. Taskfil først

Bruk dette for de fleste mellomstore og store oppgaver.

1. Lag en taskfil i `copilot-tasks/` fra `copilot-tasks/template-task.md`.
2. Velg passende agent hvis oppgaven er spesialisert.
3. Be Copilot følge taskfilen.

Anbefalt startprompt:

```text
Follow copilot-tasks/<task-file>.md. First update the Plan section, then implement the task, keep Progress notes short, and finish by updating Outcome.
```

Dette er standardmåten å jobbe på i GitHub cloud.

### 2. Skriv taskfilen selv og la Copilot utføre den

Bruk dette når oppgaven allerede er tydelig og avgrenset.

Dette gir fortsatt god styring på scope, relevante filer og validering, men er raskere enn å bruke tid på ekstra planlegging først.

### 3. La Copilot lage et første utkast til taskfil

Bruk dette når oppgaven fortsatt er litt uklar.

Anbefalt flyt:

1. Be Copilot lage et første utkast til taskfil basert på malen.
2. Gå gjennom og juster taskfilen.
3. Kjør deretter et nytt pass der Copilot faktisk utfører taskfilen.

Ikke bruk dette som en ukontrollert ett-trinns flyt for planlegging og implementasjon samtidig.

### 4. Skriv direkte i chatten

Bruk dette bare for små og lavrisiko endringer.

Passer for:

- små tekstendringer
- enkle UI-justeringer
- raske inspeksjoner
- helt lokale endringer i én eller to filer

Ikke bruk dette for:

- auth
- security
- deploy
- workflows
- brede refactors

## Taskfiler

Taskfiler i `copilot-tasks/` er den anbefalte arbeidsformen når oppgaven ikke er helt liten.

En god taskfil bør minst inneholde:

- mål
- scope
- relevante filer
- constraints
- validering
- prompt
- plan
- korte progresjonsnotater
- utfall

Copilot skal:

1. først oppdatere `Plan`
2. deretter utføre oppgaven
3. til slutt oppdatere `Outcome`

Copilot skal ikke flytte, slette eller rydde taskfiler automatisk. Det håndteres manuelt.

## Agenter

Bruk custom agents når oppgaven er tydelig knyttet til et område som:

- UI og Aksel
- tilgjengelighet
- auth
- Nais og workflows
- observability
- security

For brede oppgaver er det ofte bedre å bruke én implementasjonsagent først og eventuelt en smalere review-agent etterpå.

## GitHub cloud

I cloud jobber Copilot som en autonom PR-worker:

- den lager sin egen arbeidsbranch fra valgt base branch
- den gjør endringer selv
- den committer og pusher selv til sin Copilot-PR
- du vurderer resultatet i PR-en etterpå

Cloud er derfor best egnet når oppgaven allerede er godt formulert i en taskfil.

## Kort anbefaling

- liten endring: skriv direkte i chatten
- tydelig mellomstor oppgave: bruk taskfil
- uklar oppgave: la Copilot hjelpe med første taskutkast, juster det, og kjør så oppgaven
- cloud: foretrekk taskfil når oppgaven ikke er helt liten
