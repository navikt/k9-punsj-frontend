import classNames from 'classnames';
import React from 'react';

import { CheckboxGroup as AkselCheckboxGroup } from '@navikt/ds-react';

import LegacyCheckbox, { LegacyCheckboxProps } from './Checkbox';
import './checkboxGroup.css';

// Kompatibilitetslag for migrering fra eldre skjemakomponenter til Aksel.
// Beholder legacy-oppførsel og visning for CheckboksPanelGruppe i overgangsperioden.
export interface LegacyCheckboxGroupOption
    extends Omit<LegacyCheckboxProps, 'checked' | 'defaultChecked' | 'name' | 'onChange' | 'className'> {
    value: string;
    checked?: boolean;
    defaultChecked?: boolean;
    className?: string;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

export interface LegacyCheckboxGroupProps
    extends Omit<
        React.ComponentProps<typeof AkselCheckboxGroup>,
        'children' | 'defaultValue' | 'error' | 'legend' | 'onChange' | 'checked' | 'defaultChecked'
    > {
    name?: string;
    checkboxes: LegacyCheckboxGroupOption[];
    checked?: string[];
    defaultChecked?: string[];
    legend?: React.ReactNode;
    feil?: React.ReactNode | boolean;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>, value: string, checkedValues: string[]) => void;
}

const LegacyCheckboxGroup = ({
    name,
    checkboxes,
    checked,
    defaultChecked,
    legend,
    feil,
    className,
    onChange,
    disabled,
    ...groupProps
}: LegacyCheckboxGroupProps) => {
    const hasOptionChecked = checkboxes.some((checkbox) => checkbox.checked !== undefined);
    const optionChecked = checkboxes.filter((checkbox) => checkbox.checked).map((checkbox) => checkbox.value);
    const optionDefaultChecked = checkboxes
        .filter((checkbox) => checkbox.defaultChecked)
        .map((checkbox) => checkbox.value);

    const [internalChecked, setInternalChecked] = React.useState<string[]>(defaultChecked ?? optionDefaultChecked);

    React.useEffect(() => {
        if (checked === undefined && !hasOptionChecked && defaultChecked !== undefined) {
            setInternalChecked(defaultChecked);
        }
    }, [checked, hasOptionChecked, defaultChecked]);

    const selectedValues = checked ?? (hasOptionChecked ? optionChecked : internalChecked);
    const hasGroupError = !!feil;
    const groupError = typeof feil === 'boolean' ? undefined : feil;

    return (
        <AkselCheckboxGroup
            {...groupProps}
            disabled={disabled}
            legend={legend ?? ''}
            className={classNames('legacy-checkbox-group', className)}
            value={selectedValues}
            error={groupError}
        >
            {checkboxes.map((checkbox) => {
                const {
                    value,
                    label,
                    subtext,
                    className: optionClassName,
                    onChange: optionOnChange,
                    feil: optionError,
                    checked: optionCheckedValue,
                    defaultChecked: optionDefaultCheckedValue,
                    ...checkboxProps
                } = checkbox;

                const isChecked = selectedValues.includes(value);
                const hasOptionError = !isChecked && (hasGroupError || !!optionError);

                return (
                    <LegacyCheckbox
                        {...checkboxProps}
                        key={`${name ?? 'legacy-checkbox-group'}-${value}`}
                        internalInGroup
                        name={name}
                        value={value}
                        label={label}
                        subtext={subtext}
                        checked={optionCheckedValue ?? isChecked}
                        defaultChecked={optionDefaultCheckedValue}
                        className={classNames('legacy-checkbox-group__item', optionClassName)}
                        feil={hasOptionError}
                        disabled={disabled || checkboxProps.disabled}
                        onChange={(event) => {
                            const isOptionChecked = (event.target as HTMLInputElement).checked;
                            const nextCheckedValues = isOptionChecked
                                ? [...selectedValues, value]
                                : selectedValues.filter((checkedValue) => checkedValue !== value);

                            if (checked === undefined && !hasOptionChecked && optionCheckedValue === undefined) {
                                setInternalChecked(nextCheckedValues);
                            }

                            optionOnChange?.(event);
                            onChange?.(event, value, nextCheckedValues);
                        }}
                    />
                );
            })}
        </AkselCheckboxGroup>
    );
};

export default LegacyCheckboxGroup;
