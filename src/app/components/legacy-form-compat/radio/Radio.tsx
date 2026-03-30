import classNames from 'classnames';
import React, { forwardRef, useId } from 'react';

import { Radio as AkselRadio, RadioGroup as AkselRadioGroup } from '@navikt/ds-react';

import './radio.css';

// Kompatibilitetslag for migrering fra eldre skjemakomponenter til Aksel.
// Beholder legacy-visning for RadioPanel, men bruker ny designsystemimplementasjon.
export interface LegacyRadioProps extends Omit<React.ComponentProps<typeof AkselRadio>, 'children' | 'description'> {
    label: React.ReactNode;
    radioRef?: (element: HTMLInputElement | null) => void;
    feil?: boolean;
    internalInGroup?: boolean;
}

const LegacyRadio = forwardRef<HTMLInputElement, LegacyRadioProps>(
    ({
        label,
        radioRef,
        feil,
        internalInGroup,
        checked,
        defaultChecked,
        disabled,
        name,
        id,
        className,
        ...radioProps
    }: LegacyRadioProps,
    ref,
) => {
    const reactId = useId();
    const inputId = id ?? `legacy-radio-${reactId.replace(/:/g, '')}`;
    const fallbackGroupName = name ?? `legacy-radio-group-${reactId.replace(/:/g, '')}`;
    const radioValue = radioProps.value;

    const hasError = !disabled && !!feil && !checked;

    const setRefs = (element: HTMLInputElement | null) => {
        if (typeof ref === 'function') {
            ref(element);
        } else if (ref) {
            ref.current = element;
        }

        if (radioRef) {
            radioRef(element);
        }
    };

    const radio = (
        <div
            className={classNames('legacy-radio-panel', className, {
                'legacy-radio-panel--checked': !!checked && !disabled,
                'legacy-radio-panel--disabled': !!disabled,
                'legacy-radio-panel--error': hasError,
            })}
        >
            <AkselRadio
                {...radioProps}
                id={inputId}
                value={radioValue}
                checked={checked}
                defaultChecked={defaultChecked}
                disabled={disabled}
                name={name}
                className="legacy-radio-panel__control"
                ref={setRefs}
            >
                {label}
            </AkselRadio>
        </div>
    );

    if (internalInGroup) {
        return radio;
    }

    const groupControlledProps =
        checked !== undefined
            ? {
                  value: checked ? radioValue : undefined,
              }
            : {
                  defaultValue: defaultChecked ? radioValue : undefined,
              };

    return (
        <AkselRadioGroup
            legend=""
            hideLegend
            name={fallbackGroupName}
            className="legacy-radio-panel__standalone-group"
            {...groupControlledProps}
        >
            {radio}
        </AkselRadioGroup>
    );
},
);

LegacyRadio.displayName = 'LegacyRadio';

export default LegacyRadio;
