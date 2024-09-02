import { useField } from 'formik';
import React, { useState } from 'react';

import { DateInputProps, DatePicker, useDatepicker } from '@navikt/ds-react';
import { dateToISODate, initializeDate } from 'app/utils';

const ISO_DATE_FORMAT = 'YYYY-MM-DD';
export const DDMMYYYY_DATE_FORMAT = 'DD.MM.YYYY';

interface OwnProps extends Omit<DateInputProps, 'value' | 'onChange'> {
    label: string;
    name: string;
}

const DatoInputFormikNew = ({ label, name }: OwnProps) => {
    const [field, meta, helper] = useField(name);
    const defaultDate = field.value ? initializeDate(field.value, ISO_DATE_FORMAT).format(DDMMYYYY_DATE_FORMAT) : '';
    const [fieldValue, setFieldValue] = useState<string>(defaultDate !== 'Invalid Date' ? defaultDate : '');
    const { datepickerProps, inputProps } = useDatepicker({
        onDateChange: (selectedDate: Date) => {
            helper.setValue(dateToISODate(selectedDate));
            setFieldValue(initializeDate(selectedDate).format(DDMMYYYY_DATE_FORMAT));
        },
        defaultSelected: field.value ? initializeDate(field.value, ISO_DATE_FORMAT).toDate() : undefined,
    });
    return (
        <DatePicker {...datepickerProps}>
            <DatePicker.Input {...inputProps} value={fieldValue} label={label} error={meta.touched && meta.error} />
        </DatePicker>
    );
};

export default DatoInputFormikNew;
