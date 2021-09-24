import React, { ReactNode } from 'react';
import { CheckboksPanel, Checkbox } from 'nav-frontend-skjema';
import { useField } from 'formik';
import { FormattedMessage } from 'react-intl';
import { fjernIndexFraLabel } from './skjemaUtils';

interface ICheckboxInputProps {
    label?: ReactNode;
    feltnavn: string;
    disabled?: boolean;
    styling?: 'medPanel' | 'utenPanel';
}

const CheckboxInput: React.FunctionComponent<ICheckboxInputProps> = ({
    label,
    feltnavn,
    disabled = false,
    styling = 'utenPanel',
}) => {
    const [{ name, value, onBlur, onChange }, { error }] = useField(feltnavn);

    const CheckboxComponent = styling === 'utenPanel' ? Checkbox : CheckboksPanel;

    return (
        <CheckboxComponent
            label={label || <FormattedMessage id={`skjema.felt.${fjernIndexFraLabel(feltnavn)}.label`} />}
            name={name}
            feil={error !== ''}
            value={value}
            onBlur={onBlur}
            onChange={onChange}
            disabled={disabled}
            checked={!!value}
        />
    );
};

export default CheckboxInput;
