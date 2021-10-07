import { useField } from 'formik';
import { Datepicker } from 'nav-datovelger';
import { InputProps, Label } from 'nav-frontend-skjema';
import { Feilmelding } from 'nav-frontend-typografi';
import React, { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import { fjernIndexFraLabel } from '../../../components/skjema/skjemaUtils';

interface IDateInputProps {
    label?: ReactNode;
    feltnavn: string;
}

const OverføringDateInput: React.FunctionComponent<IDateInputProps & InputProps> = ({ feltnavn, label }) => {
    const [{ value, onChange, name }, { error, touched }] = useField(feltnavn);

    return (
        <>
            <Label htmlFor={name}>
                {label || <FormattedMessage id={`skjema.felt.${fjernIndexFraLabel(feltnavn)}.label`} />}
            </Label>
            <Datepicker locale="nb" inputId={name} value={value || ''} onChange={onChange} showYearSelector />
            {touched && error ? <Feilmelding>{error}</Feilmelding> : null}
        </>
    );
};

export default OverføringDateInput;
