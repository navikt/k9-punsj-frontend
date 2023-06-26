import { useField } from 'formik';
import { Datepicker } from 'nav-datovelger';
import { InputProps, Label } from 'nav-frontend-skjema';
import React, { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';

import { ErrorMessage } from '@navikt/ds-react';

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
            {touched && error ? <ErrorMessage size="small">{error}</ErrorMessage> : null}
        </>
    );
};

export default OverføringDateInput;
