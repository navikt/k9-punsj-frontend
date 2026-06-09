import React from 'react';
import { DatePickerProps, ErrorMessage } from '@navikt/ds-react';
import { useField, useFormikContext } from 'formik';

import DatovelgerFormik from './DatovelgerFormik';

interface PeriodevelgerFormikProps {
    name: string;
    /** Begrens fra-dato (tidligste tillatte dato) */
    fromDate?: Date;
    /** Begrens til-dato (seneste tillatte dato) */
    toDate?: Date;
    /** Funksjon eller matcher for å deaktivere spesifikke datoer */
    disabled?: DatePickerProps['disabled'];
    size?: 'small' | 'medium';
    fomId?: string;
    tomId?: string;
    fomInputRef?: React.Ref<HTMLInputElement>;
    tomInputRef?: React.Ref<HTMLInputElement>;
    action?: React.ReactNode;
}

const PeriodevelgerFormik = ({
    name,
    fromDate,
    toDate,
    disabled,
    size,
    fomId,
    tomId,
    fomInputRef,
    tomInputRef,
    action,
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
    const fomToDate = tomFieldMeta.value ? new Date(tomFieldMeta.value) : toDate;
    const tomFromDate = fomFieldMeta.value ? new Date(fomFieldMeta.value) : fromDate;
    const [fomInlineValidationMessage, setFomInlineValidationMessage] = React.useState<string | undefined>(undefined);
    const [tomInlineValidationMessage, setTomInlineValidationMessage] = React.useState<string | undefined>(undefined);
    const fomErrorId = `${effectiveFomId}-error`;
    const tomErrorId = `${effectiveTomId}-error`;
    const groupErrorId = `${effectiveFomId || effectiveTomId}-periode-error`;
    const fomErrorMessage =
        fomInlineValidationMessage || (fomFieldMeta.touched && typeof fomFieldMeta.error === 'string' ? fomFieldMeta.error : undefined);
    const tomErrorMessage =
        tomInlineValidationMessage || (tomFieldMeta.touched && typeof tomFieldMeta.error === 'string' ? tomFieldMeta.error : undefined);
    const groupErrorMessage =
        showPeriodeError && typeof periodeFieldMeta.error === 'string' ? periodeFieldMeta.error : undefined;

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-end gap-4 flex-wrap">
                <div className="flex gap-4 flex-wrap">
                    {/* Vi beholder to separate kalendere her fordi saksbehandlere opplevde felles range-picker som mindre praktisk i Punsj. */}
                    <DatovelgerFormik
                        id={effectiveFomId}
                        name={fomFieldName}
                        label="Fra og med"
                        fromDate={fromDate}
                        toDate={fomToDate}
                        visFeilmelding={false}
                        disabledDates={disabled}
                        size={size}
                        inputRef={fomInputRef}
                        dataTestId="fom"
                        renderInlineErrorMessage={false}
                        errorAriaDescribedBy={[fomErrorMessage ? fomErrorId : undefined, groupErrorMessage ? groupErrorId : undefined]
                            .filter(Boolean)
                            .join(' ')}
                        onInlineValidationMessageChange={setFomInlineValidationMessage}
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
                        size={size}
                        inputRef={tomInputRef}
                        dataTestId="tom"
                        renderInlineErrorMessage={false}
                        errorAriaDescribedBy={[tomErrorMessage ? tomErrorId : undefined, groupErrorMessage ? groupErrorId : undefined]
                            .filter(Boolean)
                            .join(' ')}
                        onInlineValidationMessageChange={setTomInlineValidationMessage}
                    />
                </div>
                {action && <div className="flex self-stretch items-end">{action}</div>}
            </div>
            <div>
                {fomErrorMessage && (
                    <ErrorMessage id={fomErrorId} aria-describedby={effectiveFomId} showIcon>
                        Fra og med: {fomErrorMessage}
                    </ErrorMessage>
                )}
                {tomErrorMessage && (
                    <ErrorMessage id={tomErrorId} aria-describedby={effectiveTomId} showIcon>
                        Til og med: {tomErrorMessage}
                    </ErrorMessage>
                )}
                {groupErrorMessage && (
                    <ErrorMessage id={groupErrorId} aria-describedby={effectiveFomId || effectiveTomId} showIcon>
                        {groupErrorMessage}
                    </ErrorMessage>
                )}
            </div>
        </div>
    );
};

export default PeriodevelgerFormik;
