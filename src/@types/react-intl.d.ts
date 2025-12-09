import 'react';
import type { FormattedMessage as OriginalFormattedMessage } from 'react-intl';

declare module 'react-intl' {
    /**
     * TODO: Midlertidig løsning for inkompatibilitet mellom react-intl@7.x og TypeScript 5.9.3
     *
     * PROBLEM:
     * TypeScript 5.9.3 har strengere type-sjekking for JSX-komponenter. react-intl@7.x definerer
     * FormattedMessage som React.ComponentType<Props>, men TypeScript 5.9.3 krever at ComponentType
     * skal ha 'refs'-egenskapen som mangler i type-definisjonen. Dette fører til feil:
     * "Property 'refs' is missing in type 'Component<...>' but required in type 'Component<any, any, any>'"
     *
     * LØSNING:
     * Vi overstyrer FormattedMessage-typen til å bruke React.FunctionComponent i stedet for
     * React.ComponentType. Dette løser kompatibilitetsproblemet uten å endre funksjonaliteten.
     *
     * NÅR FJERNE:
     * Denne deklarasjonen kan fjernes når react-intl oppdaterer sine type-definisjoner for å være
     * kompatible med TypeScript 5.9+, eller når TypeScript blir mindre streng i type-sjekkingen.
     * Følg GitHub issue: https://github.com/formatjs/formatjs/issues/4917
     *
     * SE OGSÅ:
     * - react-intl versjon: 7.1.13 (eller nyere)
     * - TypeScript versjon: 5.9.3
     * - @types/react versjon: 18.3.26
     */
    export const FormattedMessage: React.FunctionComponent<React.ComponentProps<typeof OriginalFormattedMessage>>;
}
