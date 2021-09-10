import React from 'react';
import { useField } from 'formik';
import { Radio, RadioPanel, SkjemaGruppe } from 'nav-frontend-skjema';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import intlHelper from '../../utils/intlUtils';
import './radioInput.less';
import { fjernIndexFraLabel } from './skjemaUtils';

interface IRadioInputProps {
    label?: React.ReactNode;
    feltnavn: string;
    optionValues: any[];
    retning?: 'vertikal' | 'horisontal';
    styling?: 'medPanel' | 'utenPanel';
    disabled?: boolean;
}

const RadioInput: React.FunctionComponent<IRadioInputProps> = ({
    label,
    feltnavn,
    optionValues,
    retning = 'horisontal',
    styling = 'utenPanel',
    disabled = false,
}) => {
    const [{ name, value, onBlur, onChange }, { error, touched }] = useField(feltnavn);
    const intl = useIntl();

    const RadioComponent = styling === 'utenPanel' ? Radio : RadioPanel;

    return (
        <SkjemaGruppe
            legend={
                <div className="radio-legend">
                    {label || intlHelper(intl, `skjema.felt.${fjernIndexFraLabel(feltnavn)}.label`)}
                </div>
            }
            feil={touched && error}
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
                        disabled={disabled}
                    />
                ))}
            </div>
        </SkjemaGruppe>
    );
};

export default RadioInput;
