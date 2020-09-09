import React, { ReactNode } from 'react';
import { Checkbox } from 'nav-frontend-skjema';
import { useField } from 'formik';
import { FormattedMessage } from 'react-intl';

interface ICheckboxInputProps {
  label?: ReactNode;
  feltnavn: string;
  disabled?: boolean;
}

const CheckboxInput: React.FunctionComponent<ICheckboxInputProps> = ({
  label,
  feltnavn,
  disabled = false,
}) => {
  const [{ name, value, onBlur, onChange }, { error }] = useField(feltnavn);

  return (
    <Checkbox
      label={label || <FormattedMessage id={`skjema.felt.${feltnavn}.label`} />}
      name={name}
      feil={error}
      value={value}
      onBlur={onBlur}
      onChange={onChange}
      disabled={disabled}
    />
  );
};

export default CheckboxInput;
