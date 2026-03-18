---
applyTo: "src/**/*.{tsx,jsx}"
---

# Accessibility (UU)

> Merk: Denne instruksjonen er tilpasset `k9-punsj-frontend`.
> Kilde: `https://raw.githubusercontent.com/navikt/copilot/main/.github/instructions/accessibility.instructions.md`
> Innholdet er strammet inn for dette repoet, med vekt på Aksel, eksisterende frontend-mønstre og dagens testoppsett.
> Repoet bruker `@navikt/ds-react` v7 i dag, men planlegger oppgradering til v8. Foretrekk løsninger som ikke øker fremtidig migreringskost.
> Hvis filen gjenbrukes i et annet repo, oppdater repo-kontekst, testveiledning og komponentmønstre først.

Universell utforming er lovpålagt i Norge. Frontend-kode i dette repoet skal støtte WCAG 2.1 AA og bruke Aksel som førstevalg når det dekker behovet.

## Aksel først

Aksel-komponenter (`@navikt/ds-react`) håndterer mange tilgjengelighetskrav automatisk:

- riktige roller og `aria`-attributter
- keyboard-navigasjon
- fokus-håndtering
- fargekontrast

Bruk Aksel-komponenter før egne `<div>` eller `<button>`-løsninger når det finnes en passende komponent eller primitive.

## Semantisk HTML

```tsx
// ✅ Korrekt
<main>
  <nav aria-label="Hovednavigasjon">...</nav>
  <article>
    <Heading size="large" level="1">Tittel</Heading>
    <section aria-labelledby="seksjon-id">...</section>
  </article>
</main>

// ❌ Feil
<div className="main">
  <div className="nav">...</div>
  <div className="content">
    <div className="title">Tittel</div>
  </div>
</div>
```

- Bruk semantiske landemerker som `main`, `nav`, `section`, `article`, `aside` og `footer` når de passer.
- Ikke bygg interaktive mønstre på generiske `div`-elementer hvis semantiske elementer eller Aksel allerede løser behovet.

## Overskrifter

Overskriftsnivåer skal være logiske og uten hopp:

```tsx
// ✅ Korrekt
<Heading size="large" level="1">Sidetittel</Heading>
<Heading size="medium" level="2">Seksjon</Heading>
<Heading size="small" level="3">Underseksjon</Heading>

// ❌ Feil
<Heading size="large" level="1">Sidetittel</Heading>
<Heading size="small" level="3">Underseksjon</Heading>
```

- Velg `level` ut fra dokumentstruktur, ikke bare visuell størrelse.
- Sjekk alltid heading-hierarkiet når du endrer sideoppsett eller modaler.

## Skjemaer

```tsx
import { ErrorSummary, Select, TextField } from "@navikt/ds-react";

// ✅ Korrekt
<TextField
  label="Fødselsnummer"
  description="11 siffer"
  error={errors.fnr}
  autoComplete="off"
/>

<Select label="Tema">
  <option value="">Velg tema</option>
  <option value="dagpenger">Dagpenger</option>
</Select>

<ErrorSummary heading="Du må rette disse feilene før du kan sende inn">
  <ErrorSummary.Item href="#fnr">Fødselsnummer er påkrevd</ErrorSummary.Item>
</ErrorSummary>
```

- Bruk synlige labels. Placeholder alene er ikke nok.
- Koble feil til riktig felt og bruk `ErrorSummary` når skjemaet trenger en samlet feiloppsummering.
- Bevar eksisterende struktur for labels, hjelpetekst og feil når du refaktorerer et skjema.

## Bilder og ikoner

```tsx
// ✅ Meningsbærende bilde
<img src="/chart.png" alt="Bruksstatistikk siste 30 dager: 450 aktive brukere" />

// ✅ Dekorativt bilde eller ikon
<img src="/decoration.svg" alt="" />
<DecorativeIcon aria-hidden="true" />

// ✅ Ikonknapp med tilgjengelig navn
<Button variant="tertiary" icon={<TrashIcon title="Slett element" />} />

// ❌ Feil
<Button variant="tertiary" icon={<TrashIcon />} />
```

- Meningsbærende bilder skal ha beskrivende `alt`.
- Dekorative bilder og ikoner skal skjules for skjermleser med `alt=""` eller `aria-hidden="true"`.
- Ikonknapper skal alltid ha et tilgjengelig navn.

## Interaktive elementer

```tsx
// ✅ Korrekt
<Button variant="primary">Send inn</Button>
<Link href="/oversikt">Gå til oversikt</Link>

<Link href={`/sak/${id}`}>
  Se detaljer for sak {saksnummer}
</Link>

// ❌ Feil
<Link href={`/sak/${id}`}>Klikk her</Link>
<div onClick={handleClick}>Klikk meg</div>
```

- Interaktive elementer skal være brukbare med tastatur.
- Lenketekster skal gi mening også uten omkringliggende kontekst.
- Ikke fjern synlig fokusindikator uten en tydelig og like god erstatning.

## ARIA

Bruk ARIA når HTML-semantikk alene ikke er tilstrekkelig:

```tsx
<nav aria-label="Brødsmulesti">...</nav>

<Alert variant="success" role="status">
  Skjemaet ble sendt inn
</Alert>

<Button
  aria-expanded={isOpen}
  aria-controls="panel-id"
  onClick={() => setIsOpen(!isOpen)}
>
  Vis detaljer
</Button>
<div id="panel-id" hidden={!isOpen}>
  Detaljert innhold
</div>
```

- Foretrekk korrekt HTML og Aksel-komponenter før custom `aria`-løsninger.
- Bruk `aria-live`, `role="status"` eller tilsvarende når dynamisk innhold må annonseres.
- Vær forsiktig med custom roller og tastaturlogikk. Spør først hvis standardmønster ikke holder.

## Farge og kontrast

- Tekst skal ha minst 4.5:1 kontrast mot bakgrunn.
- Stor tekst skal ha minst 3:1.
- Ikke bruk farge alene for å formidle informasjon.
- Bruk Aksel sine semantiske farger og tokens når det er mulig.

## Tastatur og fokus

- Hele siden skal være brukbar med bare tastatur.
- `Tab` og `Shift+Tab` skal gi en logisk fokusrekkefølge.
- `Enter`, `Space` og `Escape` skal fungere der brukeren forventer det.
- Modaler, menyer og ekspanderbart innhold skal håndtere fokus på en forutsigbar måte.

```tsx
// ✅ Modal med fokusfelle
<Modal open={isOpen} onClose={() => setIsOpen(false)} header={{ heading: "Bekreft sletting" }}>
  <Modal.Body>Er du sikker?</Modal.Body>
  <Modal.Footer>
    <Button onClick={handleDelete}>Slett</Button>
    <Button variant="secondary" onClick={() => setIsOpen(false)}>Avbryt</Button>
  </Modal.Footer>
</Modal>
```

## Testing

- Bruk eksisterende Jest, Testing Library og Cypress-oppsett når tilgjengelighet bør verifiseres.
- Legg til a11y-rettet testlogikk når endringen introduserer eller endrer interaktivitet, skjemaer, modaler, tabeller eller annen UI med høy risiko.
- Test med tastatur når du endrer fokusflyt, dialoger, menyer eller ekspanderbart innhold.
- Spør først før du legger til nye tilgjengelighetsbiblioteker eller nye testavhengigheter bare for én endring.

## Sjekkliste

Før du fullfører frontend-kode, verifiser:

- [ ] Heading-nivåene er logiske.
- [ ] Alle skjemaelementer har synlige labels.
- [ ] Bilder har meningsfull `alt` eller `alt=""`.
- [ ] Interaktive elementer har tilgjengelig navn.
- [ ] Ingen viktig informasjon formidles kun med farge.
- [ ] Siden eller komponenten er brukbar med tastatur.
- [ ] Dynamisk innhold annonseres riktig når det trengs.
- [ ] Feilmeldinger er koblet til riktig felt og oppsummert når det er relevant.

## Boundaries

### Always

- Bruk Aksel-komponenter og semantisk HTML når de dekker behovet.
- Sjekk heading-hierarki, labels, fokus og tastaturflyt.
- Bevar eller forbedre tilgjengeligheten når du gjør UI-endringer.

### Ask first

- Custom ARIA-roller utover standard HTML-semantikk
- Avvik fra Aksel-mønster for tilgjengelighet
- Nye tilgjengelighetstest-biblioteker eller ekstra verktøy bare for én liten endring

### Never

- `<div onClick>` uten tilsvarende semantikk og tastaturstøtte
- Ikonknapper uten tilgjengelig navn
- Fjerne fokusindikator uten god erstatning
- Bryte tastaturnavigasjon for visuell polish
