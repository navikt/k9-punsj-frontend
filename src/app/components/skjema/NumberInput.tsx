import React, { ReactNode, useMemo } from 'react';
import { Input, Label } from 'nav-frontend-skjema';

import { useField } from 'formik';
import { useIntl } from 'react-intl';
import { v4 as uuidv4 } from 'uuid';
import PlussSVG from '../../assets/SVG/PlussSVG';
import MinusSVG from '../../assets/SVG/MinusSVG';
import './numberInput.less';
import intlHelper from '../../utils/intlUtils';
import { fjernIndexFraLabel } from './skjemaUtils';

interface ITextInputProps {
  label?: ReactNode;
  feltnavn: string;
  disabled?: boolean;
}

const NumberInput: React.FunctionComponent<ITextInputProps> = ({
  label,
  feltnavn,
  disabled = false,
}) => {
  const [
    { name, value, onBlur, onChange },
    { error, touched },
    { setValue },
  ] = useField(feltnavn);

  const inputId = useMemo(() => uuidv4(), []);

  const plussEn = () => {
    const val = Number(value || 0);
    setValue(val + 1);
  };

  const minusEn = () => {
    const val = Number(value || 0);
    setValue(val - 1);
  };

  const intl = useIntl();
  const feltVisningsnavn = intlHelper(
    intl,
    `skjema.felt.${fjernIndexFraLabel(feltnavn)}.label`
  );

  const minkMedEnTekst = intlHelper(intl, 'numberinput.mink', {
    felt: feltVisningsnavn,
  });
  const økMedEnTekst = intlHelper(intl, 'numberinput.øk', {
    felt: feltVisningsnavn,
  });

  const zeroIfNullOrUndefined =
    value === undefined || value === null ? 0 : value;

  return (
    <article>
      {label || <Label htmlFor={inputId}>{feltVisningsnavn}</Label>}
      <div className="numberInput">
        <button
          onClick={minusEn}
          type="button"
          className="numberInput__button numberInput__minus"
          disabled={disabled}
        >
          <MinusSVG alt={minkMedEnTekst} />
        </button>
        <Input
          type="number"
          id={inputId}
          feil={touched && error}
          name={name}
          value={zeroIfNullOrUndefined}
          onBlur={onBlur}
          onChange={onChange}
          bredde="XXS"
          disabled={disabled}
          className="numberInput__input"
        />
        <button
          onClick={plussEn}
          type="button"
          className="numberInput__button numberInput__pluss"
          disabled={disabled}
        >
          <PlussSVG alt={økMedEnTekst} />
        </button>
      </div>
    </article>
  );
};

export default NumberInput;
