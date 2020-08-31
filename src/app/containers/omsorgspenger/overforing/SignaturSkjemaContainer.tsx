import React from 'react';
import OmsorgspengerOverføringIdentSjekk from './OmsorgspengerOverføringIdentSjekk';
import {
  ISignaturSkjema,
  validerSignaturSkjema,
} from '../../../models/forms/omsorgspenger/overføring/SignaturSkjema';
import SkjemaContext from '../../../components/skjema/SkjemaContext';

interface ISignaturSkjemaContextProps {
  initialValues: ISignaturSkjema;
  onSubmitCallback: (skjemaParams: { ident: string }) => void;
}

const SignaturSkjemaContainer: React.FunctionComponent<ISignaturSkjemaContextProps> = ({
  initialValues,
  onSubmitCallback,
}) => {
  return (
    <SkjemaContext
      onSubmitCallback={(values) =>
        onSubmitCallback({ ident: values.fødselsnummer })
      }
      initialValues={initialValues}
      validerSkjema={validerSignaturSkjema}
    >
      <OmsorgspengerOverføringIdentSjekk />
    </SkjemaContext>
  );
};

export default SignaturSkjemaContainer;
