import React from 'react';
import { DatePickerProps, ErrorMessage } from '@navikt/ds-react';
import { useField, useFormikContext } from 'formik';
import DatovelgerControlled from '../skjema/Datovelger/DatovelgerControlled';
import { uniqueId } from 'lodash';

interface PeriodevelgerControlledProps {
    name: string;
    fromDate?: Date;
    toDate?: Date;
    disabled?: DatePickerProps['disabled'];
}

const PeriodevelgerControlled = ({ name, fromDate, toDate, disabled }: PeriodevelgerControlledProps) => {
    const formik = useFormikContext();
    const fomFieldName = `${name}.fom`;
    const tomFieldName = `${name}.tom`;
    const [, periodeFieldMeta] = useField(name);
    const [fomField, fomFieldMeta] = useField(fomFieldName);
    const [tomField, tomFieldMeta] = useField(tomFieldName);

    const id = uniqueId();
    const fomId = `fom-${id}`;
    const tomId = `tom-${id}`;

    return (
        <div className="flex flex-col gap-2">
            <div className="flex gap-4 flex-wrap">
                <DatovelgerControlled
                    id={fomId}
                    label="Fra og med"
                    value={fomField.value || ''}
                    selectedDay={fomField.value || ''}
                    onChange={(value) => {
                        formik.setFieldValue(fomFieldName, value);
                        formik.setFieldTouched(fomFieldName, true);
                    }}
                    onBlur={() => {
                        formik.setFieldTouched(fomFieldName, true);
                    }}
                    fromDate={fromDate}
                    toDate={tomField.value ? new Date(tomField.value) : toDate}
                    disabledDates={disabled}
                />
                <DatovelgerControlled
                    id={tomId}
                    label="Til og med"
                    value={tomField.value || ''}
                    selectedDay={tomField.value || ''}
                    onChange={(value) => {
                        formik.setFieldValue(tomFieldName, value);
                        formik.setFieldTouched(tomFieldName, true);
                    }}
                    onBlur={() => {
                        formik.setFieldTouched(tomFieldName, true);
                    }}
                    defaultMonth={fomField.value ? new Date(fomField.value) : undefined}
                    fromDate={fomField.value ? new Date(fomField.value) : fromDate}
                    toDate={toDate}
                    disabledDates={disabled}
                />
            </div>
            <div>
                {fomFieldMeta.touched && fomFieldMeta.error && (
                    <ErrorMessage aria-describedby={fomId} showIcon>
                        Fra og med: {fomFieldMeta.error}
                    </ErrorMessage>
                )}
                {tomFieldMeta.touched && tomFieldMeta.error && (
                    <ErrorMessage aria-describedby={tomId} showIcon>
                        Til og med: {tomFieldMeta.error}
                    </ErrorMessage>
                )}
                {(fomFieldMeta.touched || tomFieldMeta.touched) && typeof periodeFieldMeta.error === 'string' && (
                    <ErrorMessage aria-describedby={fomId} showIcon={true}>
                        {periodeFieldMeta.error}
                    </ErrorMessage>
                )}
            </div>
        </div>
    );
};

export default PeriodevelgerControlled;
