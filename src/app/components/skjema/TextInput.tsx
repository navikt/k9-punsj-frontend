import React, { ReactNode } from 'react';
import { Input } from 'nav-frontend-skjema';

import { useField } from 'formik';
import { FormattedMessage } from 'react-intl';

interface ITextInputProps {
  label?: ReactNode;
  feltnavn: string;
}

const TextInput: React.FunctionComponent<ITextInputProps> = ({
  label,
  feltnavn,
}) => {
  const [{ name, value, onBlur, onChange }, { error }] = useField(feltnavn);

  return (
    <Input
      label={label || <FormattedMessage id={`skjema.felt.${feltnavn}.label`} />}
      feil={error}
      name={name}
      value={value || ''}
      onBlur={onBlur}
      onChange={onChange}
    />
  );
};

export default TextInput;
