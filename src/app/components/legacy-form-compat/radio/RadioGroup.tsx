import clsx from 'clsx';
import React from 'react';

import { RadioGroup as AkselRadioGroup } from '@navikt/ds-react';

import LegacyRadio, { LegacyRadioProps } from './Radio';
import './radioGroup.css';

export interface LegacyRadioGroupOption
    extends Omit<LegacyRadioProps, 'checked' | 'defaultChecked' | 'name' | 'onChange' | 'className'> {
    value: string;
    className?: string;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

export interface LegacyRadioGroupProps
    extends Omit<
        React.ComponentProps<typeof AkselRadioGroup>,
        'children' | 'defaultChecked' | 'defaultValue' | 'error' | 'legend' | 'name' | 'onChange' | 'value'
    > {
    name: string;
    radios: LegacyRadioGroupOption[];
    legend?: React.ReactNode;
    checked?: string;
    defaultChecked?: string;
    feil?: React.ReactNode | boolean;
    retning?: 'horisontal' | 'vertikal';
    onChange?: (event: React.ChangeEvent<HTMLInputElement>, value: string) => void;
}

const LegacyRadioGroup = ({
    name,
    radios,
    legend,
    checked,
    defaultChecked,
    feil,
    retning,
    className,
    onChange,
    ...groupProps
}: LegacyRadioGroupProps) => {
    const isControlled = checked !== undefined;
    const [internalChecked, setInternalChecked] = React.useState(defaultChecked);

    React.useEffect(() => {
        if (!isControlled) {
            setInternalChecked(defaultChecked);
        }
    }, [defaultChecked, isControlled]);

    const selectedValue = isControlled ? checked : internalChecked;
    const hasGroupError = !!feil;
    const groupError = typeof feil === 'boolean' ? undefined : feil;
    const isHorizontalClass = className?.split(' ').includes('horizontalRadios');
    const resolvedRetning = retning ?? (isHorizontalClass ? 'horisontal' : 'vertikal');

    return (
        <AkselRadioGroup
            {...groupProps}
            name={name}
            legend={legend ?? ''}
            className={clsx('legacy-radio-group', className, {
                'legacy-radio-group--horisontal': resolvedRetning === 'horisontal',
                'legacy-radio-group--vertikal': resolvedRetning === 'vertikal',
            })}
            value={selectedValue}
            error={groupError}
        >
            {radios.map((radio) => {
                const {
                    value,
                    label,
                    className: optionClassName,
                    onChange: optionOnChange,
                    feil: optionError,
                    ...radioProps
                } = radio;
                const hasOptionError =
                    typeof optionError === 'boolean'
                        ? optionError
                        : (hasGroupError && selectedValue !== value) || !!optionError;

                return (
                    <LegacyRadio
                        {...radioProps}
                        key={`${name}-${value}`}
                        internalInGroup
                        className={clsx('legacy-radio-group__item', optionClassName)}
                        name={name}
                        value={value}
                        label={label}
                        checked={selectedValue === value}
                        feil={hasOptionError}
                        onChange={(event) => {
                            if (!isControlled) {
                                setInternalChecked(value);
                            }
                            optionOnChange?.(event);
                            onChange?.(event, value);
                        }}
                    />
                );
            })}
        </AkselRadioGroup>
    );
};

export default LegacyRadioGroup;
