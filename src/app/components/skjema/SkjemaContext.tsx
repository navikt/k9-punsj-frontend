import { IntlShape, useIntl } from 'react-intl';
import { Formik, FormikErrors } from 'formik';
import React from 'react';

export interface ISkjemaContext {
  initialValues: any;
  onSubmitCallback: (values: any) => void;
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
      validateOnChange={true}
      validateOnBlur={true}
      validate={validerSkjema(intl)}
    >
      {children}
    </Formik>
  );
};

export default SkjemaContext;
