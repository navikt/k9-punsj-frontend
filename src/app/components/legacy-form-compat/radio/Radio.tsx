import clsx from 'clsx';
import React, { forwardRef, useId } from 'react';

import { Radio as AkselRadio } from '@navikt/ds-react';

import './radio.css';

export interface LegacyRadioProps extends Omit<React.ComponentProps<typeof AkselRadio>, 'children' | 'description'> {
    label: React.ReactNode;
    radioRef?: (element: HTMLInputElement | null) => void;
    feil?: boolean;
}

const LegacyRadio = forwardRef<HTMLInputElement, LegacyRadioProps>(
    ({
        label,
        radioRef,
        feil,
        checked,
        disabled,
        id,
        className,
        ...radioProps
    }: LegacyRadioProps,
    ref,
) => {
    const reactId = useId();
    const inputId = id ?? `legacy-radio-${reactId.replace(/:/g, '')}`;

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

    return (
        <div
            className={clsx('legacy-radio-panel', className, {
                'legacy-radio-panel--checked': !!checked && !disabled,
                'legacy-radio-panel--disabled': !!disabled,
                'legacy-radio-panel--error': hasError,
            })}
        >
            <AkselRadio
                {...radioProps}
                id={inputId}
                value={radioProps.value}
                checked={checked}
                disabled={disabled}
                className="legacy-radio-panel__control"
                ref={setRefs}
            >
                {label}
            </AkselRadio>
        </div>
    );
},
);

LegacyRadio.displayName = 'LegacyRadio';

export default LegacyRadio;
