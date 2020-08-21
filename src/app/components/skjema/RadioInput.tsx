import React from 'react';
import { useField } from 'formik';
import { RadioPanel, SkjemaGruppe } from 'nav-frontend-skjema';
import intlHelper from '../../utils/intlUtils';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import './radioInput.less';

interface IRadioInputProps {
  label?: React.ReactNode;
  feltnavn: string;
  optionValues: any[];
  retning?: 'vertikal' | 'horisontal';
}

const RadioInput: React.FunctionComponent<IRadioInputProps> = ({
  feltnavn,
  optionValues,
  retning = 'horisontal',
}) => {
  const [{ name, value, onBlur, onChange }, { error }] = useField(feltnavn);
  const intl = useIntl();

  return (
    <SkjemaGruppe
      legend={intlHelper(intl, `skjema.felt.${feltnavn}.label`)}
      feil={error}
    >
      <div
        className={classNames('radioinput--radios', {
          'radioinput--horisontal': retning === 'horisontal',
          'radioinput--vertikal': retning === 'vertikal',
        })}
      >
        {optionValues.map((optionValue) => (
          <RadioPanel
            label={intlHelper(intl, `skjema.felt.${feltnavn}.${optionValue}`)}
            key={optionValue}
            name={name}
            value={optionValue}
            checked={optionValue === value}
            onBlur={onBlur}
            onChange={onChange}
          />
        ))}
      </div>
    </SkjemaGruppe>
  );
};

export default RadioInput;
