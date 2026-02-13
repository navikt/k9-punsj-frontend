# PROGRESS

## 13.02.2026
- Migrerte en første pakke med enkle stilfiler fra `*.less` til `*.css` og oppdaterte importer i berørte komponenter (`241da039`).
- Migrerte `src/app/fordeling/fordeling.less` til `src/app/fordeling/fordeling.css` og oppdaterte import i `src/app/fordeling/Fordeling.tsx` (`7b9e6723`).
- Migrerte `src/app/søknader/opplæringspenger/containers/kvittering/soknadKvittering.less` til `src/app/søknader/opplæringspenger/containers/kvittering/soknadKvittering.css` og oppdaterte import i `src/app/søknader/opplæringspenger/containers/kvittering/OLPSoknadKvittering.tsx`.
- Migrerte `src/app/components/pdf/pdfVisning.less` til `src/app/components/pdf/pdfVisning.css` og oppdaterte import i `src/app/components/pdf/PdfVisning.tsx`.
- Migrerte `src/app/components/soknadKvittering/visningAvPerioderSoknadKvittering.less` til `src/app/components/soknadKvittering/visningAvPerioderSoknadKvittering.css`, oppdaterte importer i kvitteringskomponentene og rettet `lessClassForAdjustment` slik at justeringsklassen faktisk brukes i `classNames`.
- Migrerte `src/app/components/calendar/calendarGrid.less` til `src/app/components/calendar/calendarGrid.css` og oppdaterte import i `src/app/components/calendar/CalendarGrid.tsx`.
- Migrerte `src/app/components/punchPage.less` til `src/app/components/punchPage.css` og oppdaterte import i `src/app/components/JournalpostOgPdfVisning.tsx`.
- Forenklet dupliserte regler i `src/app/components/punchPage.css` uten å endre visuell oppførsel (`5d0aa8a1`).
- Dedupliserte `endringAvSøknadsperioder.css` i pleiepenger-flytene ved å importere én felles kilde (`cc5aefd6`).
- Dedupliserte registreringsvalg-stiler ved å la PLS-varianten importere PSB-varianten (`cdd6cd57`).
- Fjernet duplisert `.punch_pdf_wrapper`-regel fra `src/app/components/punchPage.css`, beholdt kilde i `src/app/components/pdf/pdfVisning.css` (`5913ae93`).
- Trakk ut felles `soknadsperioder`-stiler til `src/app/søknader/shared/styles/soknadsperioderBase.css` og koblet pleiepenger-variantene til felles fil (`0ce1cc07`).
- Fjernet ubrukte css-selektorer i `brevComponent.css`, `okGåTilLosModal.css`, `virksomhetPanel.css`, `pSBRegistreringsValg.css`, `soknadsperioderBase.css`, `globals.css`, `calendarGrid.css` og `fordeling.css` (`9cbcfec0`).
