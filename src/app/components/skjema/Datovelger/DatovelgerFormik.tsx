import React from 'react';
import Datovelger, { DatovelgerProps } from './Datovelger';
import { useField } from 'formik';

type Props = Pick<DatovelgerProps, 'toDate' | 'fromDate' | 'hideLabel' | 'defaultMonth' | 'label'> & {
    name: string;
    className?: string;
    id?: string;
    visFeilmelding?: boolean;
};

const DatovelgerFormik = ({
    name,
    label,
    toDate,
    fromDate,
    hideLabel,
    defaultMonth,
    className,
    id,
    // visFeilmelding kan settes til false dersom man vil håndtere feilmelding selv
    visFeilmelding = true,
}: Props) => {
    const [field, meta, helper] = useField(name);

    const getErrorMessage = () => {
        // Vi viser feilmelding hvis visFeilmelding er true og feltet har blitt besøkt og har en feilmelding
        if (visFeilmelding) {
            return meta.touched && meta.error ? meta.error : undefined;
        }
        // Hvis vi ikke skal vise feilmelding, så må vi uansett sende inn boolean når vi har en feil
        // for å få rød border på inputfeltet
        return meta.touched && !!meta.error;
    };
    return (
        <Datovelger
            label={label}
            value={field.value}
            selectedDay={field.value}
            onChange={(value) => helper.setValue(value)}
            onBlur={() => helper.setTouched(true, true)}
            errorMessage={getErrorMessage()}
            toDate={toDate}
            fromDate={fromDate}
            hideLabel={hideLabel}
            defaultMonth={defaultMonth}
            className={className}
            id={id}
        />
    );
};

export default DatovelgerFormik;
