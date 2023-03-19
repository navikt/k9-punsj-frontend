import { useField } from 'formik';
import { Input, InputProps } from 'nav-frontend-skjema';
import React, { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';

import { fjernIndexFraLabel } from './skjemaUtils';

interface ITextInputProps {
    label?: ReactNode;
    feltnavn: string;
    disabled?: boolean;
}

const TextInput: React.FunctionComponent<ITextInputProps & InputProps> = ({
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

export default TextInput;
