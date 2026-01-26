import React from 'react';
import { ErrorMessage, DatePickerProps} from '@navikt/ds-react';
import DatovelgerFormik from './DatovelgerFormik';
import { useField } from 'formik';

interface Props {
    name: string;
    /** Begrens fra-dato (tidligste tillatte dato) */
    fromDate?: Date;
    /** Begrens til-dato (seneste tillatte dato) */
    toDate?: Date;
    /** Funksjon eller matcher for å deaktivere spesifikke datoer */
    disabled?: DatePickerProps['disabled'];
}

const Periodevelger = ({ name, fromDate, toDate, disabled }: Props) => {
    const fomFieldName = `${name}.fom`;
    const tomFieldName = `${name}.tom`;
    const [, periodeFieldMeta] = useField(name);
    const [, fomFieldMeta] = useField(fomFieldName);
    const [, tomFieldMeta] = useField(tomFieldName);

    // Beregn effektive grenser for fom-feltet
    const fomToDate = tomFieldMeta.value ? new Date(tomFieldMeta.value) : toDate;

    // Beregn effektive grenser for tom-feltet
    const tomFromDate = fomFieldMeta.value ? new Date(fomFieldMeta.value) : fromDate;

    return (
        <div className="flex flex-col gap-2">
            <div className="flex gap-4 flex-wrap">
                <DatovelgerFormik
                    id={fomFieldName}
                    name={fomFieldName}
                    label="Fra og med"
                    fromDate={fromDate}
                    toDate={fomToDate}
                    visFeilmelding={false}
                    disabled={disabled}
                />
                <DatovelgerFormik
                    id={tomFieldName}
                    name={tomFieldName}
                    label="Til og med"
                    defaultMonth={fomFieldMeta.value ? new Date(fomFieldMeta.value) : undefined}
                    fromDate={tomFromDate}
                    toDate={toDate}
                    visFeilmelding={false}
                    disabled={disabled}
                />
            </div>
            <div>
                {fomFieldMeta.touched && fomFieldMeta.error && (
                    <ErrorMessage aria-describedby={fomFieldName} showIcon>
                        Fra og med: {fomFieldMeta.error}
                    </ErrorMessage>
                )}
                {tomFieldMeta.touched && tomFieldMeta.error && (
                    <ErrorMessage aria-describedby={tomFieldName} showIcon>
                        Til og med: {tomFieldMeta.error}
                    </ErrorMessage>
                )}
                {(fomFieldMeta.touched || tomFieldMeta.touched) && typeof periodeFieldMeta.error === 'string' && (
                    <ErrorMessage aria-describedby={name} showIcon={true}>
                        {periodeFieldMeta.error}
                    </ErrorMessage>
                )}
            </div>
        </div>
    );
};

export default Periodevelger;
