import classNames from 'classnames';
import { useField } from 'formik';
import { Radio, RadioPanel, SkjemaGruppe } from 'nav-frontend-skjema';
import React from 'react';

import './radioInput.less';

interface IRadioInputProps {
    legend: React.ReactNode;
    name: string;
    optionValues: { label: string; value: string }[];
    retning?: 'vertikal' | 'horisontal';
    styling?: 'medPanel' | 'utenPanel';
    disabled?: boolean;
}

const RadioInput: React.FunctionComponent<IRadioInputProps> = ({
    legend,
    optionValues,
    name,
    retning = 'horisontal',
    styling = 'utenPanel',
    disabled = false,
}) => {
    const [{ value, onBlur, onChange }, { error, touched }] = useField(name);

    const RadioComponent = styling === 'utenPanel' ? Radio : RadioPanel;

    return (
        <SkjemaGruppe legend={<div className="radio-legend">{legend}</div>} feil={touched && error}>
            <div
                className={classNames('radioinput--radios', {
                    'radioinput--horisontal': retning === 'horisontal',
                    'radioinput--vertikal': retning === 'vertikal',
                })}
            >
                {optionValues.map((option) => (
                    <RadioComponent
                        label={option.label}
                        key={option.value}
                        name={name}
                        value={option.value}
                        checked={option.value === value}
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
