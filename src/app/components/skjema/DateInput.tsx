import React, { ReactNode } from 'react';
import { Input, InputProps } from 'nav-frontend-skjema';

import { useField } from 'formik';
import { FormattedMessage } from 'react-intl';
import { fjernIndexFraLabel } from './skjemaUtils';

interface IDateInputProps {
    label?: ReactNode;
    feltnavn: string;
    disabled?: boolean;
}

const DateInput: React.FunctionComponent<IDateInputProps & InputProps> = ({
    label,
    feltnavn,
    disabled = false,
    ...inputProps
}) => {
    const [{ name, value, onBlur, onChange }, { error, touched }] = useField(feltnavn);

    return (
        <Input
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...inputProps}
            type="date"
            label={label || <FormattedMessage id={`skjema.felt.${fjernIndexFraLabel(feltnavn)}.label`} />}
            feil={touched && error}
            name={name}
            value={value || ''}
            onBlur={onBlur}
            onChange={onChange}
            disabled={disabled}
        />
    );
};

export default DateInput;
