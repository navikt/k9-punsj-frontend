import classNames from 'classnames';
import React from 'react';
import { FieldValues, useController, useFormContext } from 'react-hook-form';

import { LegacyRadioGroup } from 'app/components/legacy-form-compat/radio';

import { FormLegacyRadioGroupProps } from './types';
import '../formikInput/legacyRadioGroupFormik.css';

export function FormLegacyRadioGroup<T extends FieldValues>({
    name,
    legend,
    options,
    description,
    retning = 'horisontal',
    validate,
    className,
    disabled,
    readOnly,
    size,
    'data-testid': dataTestId,
    onChange,
}: FormLegacyRadioGroupProps<T>) {
    const { control } = useFormContext<T>();
    const { field, fieldState } = useController({
        name,
        control,
        rules: validate,
    });

    const radios = options.map((option) => ({
        ...option,
        disabled: option.disabled || disabled,
    }));

    return (
        <div
            className={classNames('radioinput--container', {
                'radioinput--horisontal': retning === 'horisontal',
                'radioinput--vertikal': retning === 'vertikal',
            })}
        >
            <LegacyRadioGroup
                name={field.name}
                legend={legend}
                description={description}
                radios={radios}
                checked={field.value as string | undefined}
                retning={retning}
                className={className}
                feil={fieldState.error?.message}
                disabled={disabled}
                readOnly={readOnly}
                size={size}
                data-testid={dataTestId}
                onBlur={field.onBlur}
                onChange={(event, value) => {
                    field.onChange(value);
                    if (onChange) {
                        onChange(event, value);
                    }
                }}
            />
        </div>
    );
}
