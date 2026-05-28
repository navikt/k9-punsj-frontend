import React from 'react';
import { DatePickerProps } from '@navikt/ds-react';
import BasePeriodevelgerFormik from '../skjema/Datovelger/PeriodevelgerFormik';

interface PeriodevelgerFormikProps {
    name: string;
    fromDate?: Date;
    toDate?: Date;
    disabled?: DatePickerProps['disabled'];
}

const PeriodevelgerFormik = ({ name, fromDate, toDate, disabled }: PeriodevelgerFormikProps) => (
    <BasePeriodevelgerFormik
        name={name}
        fromDate={fromDate}
        toDate={toDate}
        disabled={disabled}
        touchOnChange
    />
);

export default PeriodevelgerFormik;
