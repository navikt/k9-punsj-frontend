import clsx from 'clsx';
import React, { forwardRef, useId } from 'react';

import { Checkbox as AkselCheckbox } from '@navikt/ds-react';

import './checkbox.css';

// Compatibility wrapper for migration from nav-frontend-skjema to Aksel.
// Keeps legacy CheckboksPanel visuals while using the new design system internals.
export interface LegacyCheckboxProps
    extends Omit<React.ComponentProps<typeof AkselCheckbox>, 'children' | 'description'> {
    label: React.ReactNode;
    subtext?: React.ReactNode;
    feil?: boolean;
    checkboxRef?: (element: HTMLInputElement | null) => void;
    internalInGroup?: boolean;
}

const LegacyCheckbox = forwardRef<HTMLInputElement, LegacyCheckboxProps>(
    (
        {
            label,
            subtext,
            checkboxRef,
            feil,
            internalInGroup,
            checked,
            defaultChecked,
            disabled,
            className,
            id,
            onChange,
            ...checkboxProps
        }: LegacyCheckboxProps,
        ref,
    ) => {
        const reactId = useId();
        const inputId = id ?? `legacy-checkbox-${reactId.replace(/:/g, '')}`;

        const isControlled = checked !== undefined || internalInGroup;
        const [internalChecked, setInternalChecked] = React.useState(Boolean(defaultChecked));
        const resolvedChecked = checked !== undefined ? Boolean(checked) : internalChecked;
        const hasError = !disabled && !!feil && !resolvedChecked;

        React.useEffect(() => {
            if (!isControlled) {
                setInternalChecked(Boolean(defaultChecked));
            }
        }, [defaultChecked, isControlled]);

        const setRefs = (element: HTMLInputElement | null) => {
            if (typeof ref === 'function') {
                ref(element);
            } else if (ref) {
                ref.current = element;
            }

            if (checkboxRef) {
                checkboxRef(element);
            }
        };

        return (
            <div
                className={clsx('legacy-checkbox-panel', className, {
                    'legacy-checkbox-panel--checked': resolvedChecked && !disabled,
                    'legacy-checkbox-panel--disabled': !!disabled,
                    'legacy-checkbox-panel--error': hasError,
                })}
            >
                <AkselCheckbox
                    {...checkboxProps}
                    id={inputId}
                    disabled={disabled}
                    className="legacy-checkbox-panel__control"
                    ref={setRefs}
                    {...(!internalInGroup ? { checked: resolvedChecked } : {})}
                    onChange={(event) => {
                        if (!isControlled) {
                            setInternalChecked((event.target as HTMLInputElement).checked);
                        }
                        onChange?.(event);
                    }}
                >
                    <span className="legacy-checkbox-panel__label-text">{label}</span>
                    {subtext ? <span className="legacy-checkbox-panel__subtext">{subtext}</span> : undefined}
                </AkselCheckbox>
            </div>
        );
    },
);

LegacyCheckbox.displayName = 'LegacyCheckbox';

export default LegacyCheckbox;
