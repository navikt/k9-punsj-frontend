import React, { ReactNode } from 'react';
import { Input, InputProps } from 'nav-frontend-skjema';

import { useField } from 'formik';
import { FormattedMessage } from 'react-intl';

interface ITextInputProps {
  label?: ReactNode;
  feltnavn: string;
}

const TextInput: React.FunctionComponent<ITextInputProps & InputProps> = ({
  label,
  feltnavn,
  ...inputProps
}) => {
  const [{ name, value, onBlur, onChange }, { error, touched }] = useField(
    feltnavn
  );

  return (
    <Input
      {...inputProps}
      label={label || <FormattedMessage id={`skjema.felt.${feltnavn}.label`} />}
      feil={touched && error}
      name={name}
      value={value || ''}
      onBlur={onBlur}
      onChange={onChange}
    />
  );
};

export default TextInput;
