import React, { ReactNode } from 'react';
import { CheckboxGruppe } from 'nav-frontend-skjema';
import { useField } from 'formik';
import { FormattedMessage } from 'react-intl';
import CheckboxInput from './CheckboxInput';

interface ICheckboxInputGruppeProps {
  label?: ReactNode;
  feltnavn: string;
  checkboxFeltnavn: string[];
  metaHarFeilFeltnavn: string;
}

const CheckboxInputGruppe: React.FunctionComponent<ICheckboxInputGruppeProps> = ({
  label,
  feltnavn,
  checkboxFeltnavn,
  metaHarFeilFeltnavn,
}) => {
  const { error = {}, touched } = useField<{}>(feltnavn)[1];

  const feil: boolean = error[metaHarFeilFeltnavn];

  return (
    <CheckboxGruppe
      legend={
        label || <FormattedMessage id={`skjema.felt.${feltnavn}.label`} />
      }
      feil={touched && feil}
    >
      {checkboxFeltnavn.map((checkboxnavn) => (
        <CheckboxInput
          feltnavn={`${feltnavn}.${checkboxnavn}`}
          key={checkboxnavn}
        />
      ))}
    </CheckboxGruppe>
  );
};

export default CheckboxInputGruppe;
