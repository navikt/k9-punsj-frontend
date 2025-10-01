import React from 'react';
import Datovelger, { DatovelgerProps } from './Datovelger';
import { useField } from 'formik';

type Props = Pick<DatovelgerProps, 'toDate' | 'fromDate' | 'hideLabel' | 'defaultMonth' | 'label'> & {
    name: string;
    className?: string;
};

const DatovelgerFormik = ({ name, label, toDate, fromDate, hideLabel, defaultMonth, className }: Props) => {
    const [field, meta, helper] = useField(name);
    return (
        <Datovelger
            label={label}
            value={field.value}
            selectedDay={field.value}
            onChange={(value) => helper.setValue(value)}
            onBlur={() => helper.setTouched(true, true)}
            errorMessage={meta.touched && meta.error}
            toDate={toDate}
            fromDate={fromDate}
            hideLabel={hideLabel}
            defaultMonth={defaultMonth}
            className={className}
        />
    );
};

export default DatovelgerFormik;
