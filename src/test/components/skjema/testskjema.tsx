import React from 'react';
import SkjemaContext from '../../../app/components/skjema/SkjemaContext';
import { Form, FormikErrors } from 'formik';
import TestIntlProvider from '../intl/TestIntlProvider';

export enum By {
  Oslo = 'Oslo',
  Barcelona = 'Barcelona',
  NewYork = 'New York',
}

export interface ITestPerson {
  fødselsnummer: string;
  alder: number;
  favorittby: By | null;
  erBlond: boolean;
}

interface ITestSkjemaProps {
  initialValues: Partial<ITestPerson>;
  valider?: (values: ITestPerson) => FormikErrors<ITestPerson>;
}

const tomtSkjema: ITestPerson = {
  fødselsnummer: '',
  alder: 0,
  favorittby: null,
  erBlond: false,
};

export const TestSkjema: React.FunctionComponent<ITestSkjemaProps> = ({
  initialValues,
  valider = () => ({}),
  children,
}) => {
  return (
    <TestIntlProvider>
      <SkjemaContext
        initialValues={{
          ...tomtSkjema,
          ...initialValues,
        }}
        onSubmitCallback={() => undefined}
        validerSkjema={() => valider}
      >
        <Form>{children}</Form>
      </SkjemaContext>
    </TestIntlProvider>
  );
};
