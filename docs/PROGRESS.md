# PROGRESS

## 13.02.2026
- Migrerte en første pakke med enkle stilfiler fra `*.less` til `*.css` og oppdaterte importer i berørte komponenter (`241da039`).
- Migrerte `src/app/fordeling/fordeling.less` til `src/app/fordeling/fordeling.css` og oppdaterte import i `src/app/fordeling/Fordeling.tsx` (`7b9e6723`).
- Migrerte `src/app/søknader/opplæringspenger/containers/kvittering/soknadKvittering.less` til `src/app/søknader/opplæringspenger/containers/kvittering/soknadKvittering.css` og oppdaterte import i `src/app/søknader/opplæringspenger/containers/kvittering/OLPSoknadKvittering.tsx`.
- Migrerte `src/app/components/pdf/pdfVisning.less` til `src/app/components/pdf/pdfVisning.css` og oppdaterte import i `src/app/components/pdf/PdfVisning.tsx`.
- Migrerte `src/app/components/soknadKvittering/visningAvPerioderSoknadKvittering.less` til `src/app/components/soknadKvittering/visningAvPerioderSoknadKvittering.css`, oppdaterte importer i kvitteringskomponentene og rettet `lessClassForAdjustment` slik at justeringsklassen faktisk brukes i `classNames`.
