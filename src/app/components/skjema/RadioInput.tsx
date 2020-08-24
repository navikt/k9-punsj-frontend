import React from 'react';
import { useField } from 'formik';
import { Radio, RadioPanel, SkjemaGruppe } from 'nav-frontend-skjema';
import intlHelper from '../../utils/intlUtils';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import './radioInput.less';

interface IRadioInputProps {
  label?: React.ReactNode;
  feltnavn: string;
  optionValues: any[];
  retning?: 'vertikal' | 'horisontal';
  styling?: 'medPanel' | 'utenPanel';
}

const RadioInput: React.FunctionComponent<IRadioInputProps> = ({
  feltnavn,
  optionValues,
  retning = 'horisontal',
  styling = 'utenPanel',
}) => {
  const [{ name, value, onBlur, onChange }, { error }] = useField(feltnavn);
  const intl = useIntl();

  const RadioComponent = styling === 'utenPanel' ? Radio : RadioPanel;

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
          <RadioComponent
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
