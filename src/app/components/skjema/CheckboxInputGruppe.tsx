import classNames from 'classnames';
import { useField } from 'formik';
import { CheckboxGruppe } from 'nav-frontend-skjema';
import React, { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';

import CheckboxInput from './CheckboxInput';
import './checkboxInputGruppe.less';

interface ICheckboxInputGruppeProps {
    label?: ReactNode;
    feltnavn: string;
    checkboxFeltnavn: string[];
    metaHarFeilFeltnavn: string;
    disabled?: boolean;
    styling?: 'medPanel' | 'utenPanel';
}

const CheckboxInputGruppe: React.FunctionComponent<ICheckboxInputGruppeProps> = ({
    label,
    feltnavn,
    checkboxFeltnavn,
    metaHarFeilFeltnavn,
    disabled = false,
    styling = 'utenPanel',
}) => {
    const { error = {}, touched } = useField(feltnavn)[1];

    const feil: boolean = error[metaHarFeilFeltnavn];

    return (
        <CheckboxGruppe
            legend={label || <FormattedMessage id={`skjema.felt.${feltnavn}.label`} />}
            feil={touched && feil}
            className={classNames({ checkboxpaneler: styling === 'medPanel' })}
        >
            {checkboxFeltnavn.map((checkboxnavn) => (
                <CheckboxInput
                    feltnavn={`${feltnavn}.${checkboxnavn}`}
                    key={checkboxnavn}
                    disabled={disabled}
                    styling={styling}
                />
            ))}
        </CheckboxGruppe>
    );
};

export default CheckboxInputGruppe;
