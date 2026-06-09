import React from 'react';
import { FormikValues, useField, useFormikContext } from 'formik';
import { cloneDeep, set } from 'lodash';
import DatovelgerControlled, { DatovelgerControlledProps } from './DatovelgerControlled';

export type DatovelgerFormikProps = Pick<
    DatovelgerControlledProps,
    | 'toDate'
    | 'fromDate'
    | 'hideLabel'
    | 'defaultMonth'
    | 'label'
    | 'disabled'
    | 'size'
    | 'description'
    | 'className'
    | 'id'
    | 'inputRef'
    | 'disabledDates'
    | 'noValidateTomtFelt'
    | 'dataTestId'
    | 'renderInlineErrorMessage'
    | 'errorAriaDescribedBy'
    | 'onInlineValidationMessageChange'
> & {
    name: string;
    visFeilmelding?: boolean;
    error?: React.ReactNode | string;
    handleBlur?: (callback: () => void, values: any) => void;
};

const DatovelgerFormik = ({
    name,
    label,
    toDate,
    fromDate,
    hideLabel,
    defaultMonth,
    className,
    id,
    inputRef,
    disabled,
    disabledDates,
    size,
    description,
    noValidateTomtFelt,
    dataTestId,
    error,
    handleBlur,
    renderInlineErrorMessage,
    errorAriaDescribedBy,
    onInlineValidationMessageChange,
    // visFeilmelding kan settes til false dersom man vil håndtere feilmelding selv
    visFeilmelding = true,
}: DatovelgerFormikProps) => {
    const [field, meta, helper] = useField(name);
    const { values } = useFormikContext<FormikValues>();

    const externalOrFormikError = (meta.touched && meta.error) || error;

    const getErrorMessage = () => {
        if (visFeilmelding) {
            return externalOrFormikError;
        }
        return !!externalOrFormikError;
    };

    return (
        <DatovelgerControlled
            label={label}
            description={description}
            value={field.value || ''}
            onChange={(value) => helper.setValue(value)}
            onBlur={(selectedDate) => {
                if (handleBlur) {
                    handleBlur(() => helper.setTouched(true, true), set(cloneDeep(values), name, selectedDate));
                    return;
                }

                helper.setValue(selectedDate);
                helper.setTouched(true, true);
            }}
            errorMessage={getErrorMessage()}
            toDate={toDate}
            fromDate={fromDate}
            hideLabel={hideLabel}
            defaultMonth={defaultMonth}
            className={className}
            id={id}
            inputRef={inputRef}
            disabled={disabled}
            disabledDates={disabledDates}
            size={size}
            noValidateTomtFelt={noValidateTomtFelt}
            dataTestId={dataTestId}
            renderInlineErrorMessage={renderInlineErrorMessage}
            errorAriaDescribedBy={errorAriaDescribedBy}
            onInlineValidationMessageChange={onInlineValidationMessageChange}
        />
    );
};

export default DatovelgerFormik;
