import React, { createContext, useContext, useMemo } from 'react';
import { beregnMinMaxDato, lagDisabledDatoerFunksjon } from 'app/utils/date/periodUtils';
import { IPeriode } from 'app/models/types';
import { DatePickerProps } from '@navikt/ds-react';

interface TillattePeriodeContextValue {
    tillattePerioder: IPeriode[];
}

const TillattePeriodeContext = createContext<TillattePeriodeContextValue>({
    tillattePerioder: [],
});

interface TillattePeriodeProviderProps {
    tillattePerioder: IPeriode[];
    children: React.ReactNode;
}

/**
 * Provider som gir tilgang til tillatte perioder for datovelgere.
 * Hver form er ansvarlig for å beregne hvilke perioder som er tillatt.
 */
export const TillattePeriodeProvider: React.FC<TillattePeriodeProviderProps> = ({
    tillattePerioder,
    children,
}) => {
    const value = useMemo(
        () => ({ tillattePerioder: tillattePerioder.filter((p) => p?.fom && p?.tom) }),
        [tillattePerioder],
    );
    return <TillattePeriodeContext.Provider value={value}>{children}</TillattePeriodeContext.Provider>;
};

/**
 * Hook som returnerer alle tillatte perioder
 */
export const useTillattePerioder = (): IPeriode[] => {
    const { tillattePerioder } = useContext(TillattePeriodeContext);
    return tillattePerioder;
};

interface DatoRestriksjonerResult {
    fromDate?: Date;
    toDate?: Date;
    disabled?: DatePickerProps['disabled'];
}

/**
 * Hook som returnerer datobegrensninger basert på tillatte perioder.
 * Returnerer fromDate, toDate og disabled-array for bruk i Periodevelger og DatovelgerFormik.
 */
export const useDatoRestriksjoner = (): DatoRestriksjonerResult => {
    const tillattePerioder = useTillattePerioder();

    return useMemo(() => {
        const { fromDate, toDate } = beregnMinMaxDato(tillattePerioder);
        const disabledFn = lagDisabledDatoerFunksjon(tillattePerioder);

        // DatePicker krever Matcher[] - wrapp funksjonen i en array
        const disabled: DatePickerProps['disabled'] = disabledFn ? [disabledFn] : undefined;

        return { fromDate, toDate, disabled };
    }, [tillattePerioder]);
};
