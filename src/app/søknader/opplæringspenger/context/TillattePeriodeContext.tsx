import React, { createContext, useContext, useMemo } from 'react';
import { useFormikContext } from 'formik';
import { Periode } from 'app/models/types/Periode';
import { OLPSoknad } from 'app/models/types/OLPSoknad';
import { beregnMinMaxDato, lagDisabledDatoerFunksjon } from 'app/rules/yup';
import { IPeriode } from 'app/models/types';
import { DatePickerProps } from '@navikt/ds-react';

interface TillattePeriodeContextValue {
    eksisterendePerioder: Periode[];
}

const TillattePeriodeContext = createContext<TillattePeriodeContextValue>({
    eksisterendePerioder: [],
});

interface TillattePeriodeProviderProps {
    eksisterendePerioder: Periode[];
    children: React.ReactNode;
}

export const TillattePeriodeProvider: React.FC<TillattePeriodeProviderProps> = ({
    eksisterendePerioder,
    children,
}) => {
    const value = useMemo(() => ({ eksisterendePerioder }), [eksisterendePerioder]);
    return <TillattePeriodeContext.Provider value={value}>{children}</TillattePeriodeContext.Provider>;
};

/**
 * Hook som returnerer alle tillatte perioder (eksisterende + kursperioder)
 */
export const useTillattePerioder = (): IPeriode[] => {
    const { eksisterendePerioder } = useContext(TillattePeriodeContext);
    const { values } = useFormikContext<OLPSoknad>();

    return useMemo(() => {
        const kursperioder = values.kurs?.kursperioder?.map((k) => k.periode) || [];
        return [...eksisterendePerioder, ...kursperioder].filter((p) => p?.fom && p?.tom);
    }, [eksisterendePerioder, values.kurs?.kursperioder]);
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
