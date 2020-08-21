import React from 'react';
import { JaNei } from '../../../models/enums';
import { Formik, FormikErrors, useFormikContext } from 'formik';
import { IntlShape, useIntl } from 'react-intl';
import intlHelper from '../../../utils/intlUtils';
import OmsorgspengerOverføringIdentSjekk from './OmsorgspengerOverføringIdentSjekk';
import {
  fødselsnummervalidator,
  påkrevd,
  Validator,
} from '../../../rules/valideringer';

export interface ISignaturSkjema {
  fødselsnummer?: string;
  signert?: JaNei;
}

export const useSignaturSkjemaContext = () =>
  useFormikContext<ISignaturSkjema>();

interface ISignaturSkjemaContextProps {
  initialValues: ISignaturSkjema;
  onSubmitCallback: () => void;
}

const fødselsnummerValideringer: Validator<
  string | undefined,
  ISignaturSkjema
>[] = [påkrevd, fødselsnummervalidator];

const validate = (intl: IntlShape) => ({
  fødselsnummer,
  signert,
}: ISignaturSkjema): FormikErrors<ISignaturSkjema> => {
  const errors: FormikErrors<ISignaturSkjema> = {};

  const fødselsnummerError = fødselsnummerValideringer
    .map((validering) => validering(fødselsnummer))
    .find((resultat) => resultat);

  if (fødselsnummerError) {
    errors.fødselsnummer = intlHelper(intl, fødselsnummerError);
  }

  const signaturError = [påkrevd]
    .map((validering) => validering(signert))
    .find((resultat) => resultat);

  if (signaturError) {
    errors.signert = intlHelper(intl, signaturError);
  }

  return errors;
};

const SignaturSkjemaContext: React.FunctionComponent<ISignaturSkjemaContextProps> = ({
  initialValues,
  onSubmitCallback,
}) => {
  const intl = useIntl();

  return (
    <Formik
      onSubmit={onSubmitCallback}
      initialValues={initialValues}
      validateOnChange={false}
      validateOnBlur={true}
      validate={validate(intl)}
    >
      <OmsorgspengerOverføringIdentSjekk />
    </Formik>
  );
};

export default SignaturSkjemaContext;
