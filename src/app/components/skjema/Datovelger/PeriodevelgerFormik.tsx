import React from 'react';
import { ErrorMessage, DatePickerProps } from '@navikt/ds-react';
import DatovelgerFormik from './DatovelgerFormik';
import { useField, useFormikContext } from 'formik';

interface PeriodevelgerFormikProps {
    name: string;
    /** Begrens fra-dato (tidligste tillatte dato) */
    fromDate?: Date;
    /** Begrens til-dato (seneste tillatte dato) */
    toDate?: Date;
    /** Funksjon eller matcher for å deaktivere spesifikke datoer */
    disabled?: DatePickerProps['disabled'];
    fomId?: string;
    tomId?: string;
    fomInputRef?: React.Ref<HTMLInputElement>;
    tomInputRef?: React.Ref<HTMLInputElement>;
}

const PeriodevelgerFormik = ({
    name,
    fromDate,
    toDate,
    disabled,
    fomId,
    tomId,
    fomInputRef,
    tomInputRef,
}: PeriodevelgerFormikProps) => {
    const { submitCount } = useFormikContext();
    const fomFieldName = `${name}.fom`;
    const tomFieldName = `${name}.tom`;
    const [, periodeFieldMeta] = useField(name);
    const [, fomFieldMeta] = useField(fomFieldName);
    const [, tomFieldMeta] = useField(tomFieldName);
    const effectiveFomId = fomId || fomFieldName;
    const effectiveTomId = tomId || tomFieldName;
    const showPeriodeError = submitCount > 0 || (fomFieldMeta.touched && tomFieldMeta.touched);

    // Beregn effektive grenser for fom-feltet
    const fomToDate = tomFieldMeta.value ? new Date(tomFieldMeta.value) : toDate;

    // Beregn effektive grenser for tom-feltet
    const tomFromDate = fomFieldMeta.value ? new Date(fomFieldMeta.value) : fromDate;

    return (
        <div className="flex flex-col gap-2">
            <div className="flex gap-4 flex-wrap">
                <DatovelgerFormik
                    id={effectiveFomId}
                    name={fomFieldName}
                    label="Fra og med"
                    fromDate={fromDate}
                    toDate={fomToDate}
                    visFeilmelding={false}
                    disabledDates={disabled}
                    inputRef={fomInputRef}
                />
                <DatovelgerFormik
                    id={effectiveTomId}
                    name={tomFieldName}
                    label="Til og med"
                    defaultMonth={fomFieldMeta.value ? new Date(fomFieldMeta.value) : undefined}
                    fromDate={tomFromDate}
                    toDate={toDate}
                    visFeilmelding={false}
                    disabledDates={disabled}
                    inputRef={tomInputRef}
                />
            </div>
            <div>
                {fomFieldMeta.touched && fomFieldMeta.error && (
                    <ErrorMessage aria-describedby={effectiveFomId} showIcon>
                        Fra og med: {fomFieldMeta.error}
                    </ErrorMessage>
                )}
                {tomFieldMeta.touched && tomFieldMeta.error && (
                    <ErrorMessage aria-describedby={effectiveTomId} showIcon>
                        Til og med: {tomFieldMeta.error}
                    </ErrorMessage>
                )}
                {showPeriodeError && typeof periodeFieldMeta.error === 'string' && (
                    <ErrorMessage aria-describedby={effectiveFomId} showIcon={true}>
                        {periodeFieldMeta.error}
                    </ErrorMessage>
                )}
            </div>
        </div>
    );
};

export default PeriodevelgerFormik;
