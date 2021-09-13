import { IntlShape, useIntl } from 'react-intl';
import { Formik, FormikErrors, FormikHelpers } from 'formik';
import React from 'react';

export interface ISkjemaContext {
    initialValues: any;
    onSubmitCallback: (values: any, formikHelpers: FormikHelpers<any>) => void;
    validerSkjema: (intl: IntlShape) => (skjema: any) => FormikErrors<any>;
}

const SkjemaContext: React.FunctionComponent<ISkjemaContext> = ({
    initialValues,
    onSubmitCallback,
    validerSkjema,
    children,
}) => {
    const intl = useIntl();

    return (
        <Formik
            onSubmit={onSubmitCallback}
            initialValues={initialValues}
            validateOnChange
            validateOnBlur
            validate={validerSkjema(intl)}
        >
            {children}
        </Formik>
    );
};

export default SkjemaContext;
