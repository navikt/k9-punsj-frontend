import React from 'react';
import { Formik, useFormikContext } from 'formik';
import { useIntl } from 'react-intl';
import OmsorgspengerOverføringIdentSjekk from './OmsorgspengerOverføringIdentSjekk';
import {
  ISignaturSkjema,
  validerSignaturSkjema,
} from '../../../models/forms/omsorgspenger/overføring/SignaturSkjema';

export const useSignaturSkjemaContext = () =>
  useFormikContext<ISignaturSkjema>();

interface ISignaturSkjemaContextProps {
  initialValues: ISignaturSkjema;
  onSubmitCallback: () => void;
}

const SignaturSkjemaContainer: React.FunctionComponent<ISignaturSkjemaContextProps> = ({
  initialValues,
  onSubmitCallback,
}) => {
  const intl = useIntl();

  return (
    <Formik
      onSubmit={onSubmitCallback}
      initialValues={initialValues}
      validateOnChange={true}
      validateOnBlur={true}
      validate={validerSignaturSkjema(intl)}
    >
      <OmsorgspengerOverføringIdentSjekk />
    </Formik>
  );
};

export default SignaturSkjemaContainer;
