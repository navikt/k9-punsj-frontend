import React from 'react';
import Datovelger, { DatovelgerProps } from './Datovelger';
import { useField } from 'formik';

type Props = Pick<DatovelgerProps, 'toDate' | 'fromDate' | 'hideLabel' | 'defaultMonth' | 'label'> & {
    name: string;
    className?: string;
    id?: string;
};

const DatovelgerFormik = ({ name, label, toDate, fromDate, hideLabel, defaultMonth, className, id }: Props) => {
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
            id={id}
        />
    );
};

export default DatovelgerFormik;
