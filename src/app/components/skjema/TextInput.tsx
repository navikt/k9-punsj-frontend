import { useField } from 'formik';
import React, { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import { TextField, TextFieldProps } from '@navikt/ds-react';

import { fjernIndexFraLabel } from './skjemaUtils';

interface ITextInputProps {
    label?: ReactNode;
    feltnavn: string;
    disabled?: boolean;
}

const TextInput: React.FunctionComponent<ITextInputProps & TextFieldProps> = ({
    label,
    feltnavn,
    disabled = false,
    ...inputProps
}) => {
    const [{ name, value, onBlur, onChange }, { error, touched }] = useField(feltnavn);

    return (
        <TextField
            {...inputProps}
            label={label || <FormattedMessage id={`skjema.felt.${fjernIndexFraLabel(feltnavn)}.label`} />}
            error={touched && error}
            name={name}
            value={value || ''}
            onBlur={onBlur}
            onChange={onChange}
            disabled={disabled}
        />
    );
};

export default TextInput;
