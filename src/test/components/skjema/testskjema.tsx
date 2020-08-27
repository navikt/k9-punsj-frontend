import React from 'react';
import SkjemaContext from '../../../app/components/skjema/SkjemaContext';
import { Form, FormikErrors } from 'formik';
import TestIntlProvider from '../intl/TestIntlProvider';

export interface ITestPerson {
  fødselsnummer: string;
  alder: number;
  navn?: {
    fornavn: string;
    etternavn: string;
  };
  barn?: string[];
}

interface ITestSkjemaProps {
  initialValues: ITestPerson;
  valider?: (values: ITestPerson) => FormikErrors<ITestPerson>;
}

export const TestSkjema: React.FunctionComponent<ITestSkjemaProps> = ({
  initialValues,
  valider = () => ({}),
  children,
}) => {
  return (
    <TestIntlProvider>
      <SkjemaContext
        initialValues={initialValues}
        onSubmitCallback={() => undefined}
        validerSkjema={() => valider}
      >
        <Form>{children}</Form>
      </SkjemaContext>
    </TestIntlProvider>
  );
};
