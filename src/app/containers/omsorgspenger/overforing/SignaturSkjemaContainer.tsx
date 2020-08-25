import React from 'react';
import OmsorgspengerOverføringIdentSjekk from './OmsorgspengerOverføringIdentSjekk';
import {
  ISignaturSkjema,
  validerSignaturSkjema,
} from '../../../models/forms/omsorgspenger/overføring/SignaturSkjema';
import SkjemaContext from '../../../components/skjema/SkjemaContext';

interface ISignaturSkjemaContextProps {
  initialValues: ISignaturSkjema;
  onSubmitCallback: () => void;
}

const SignaturSkjemaContainer: React.FunctionComponent<ISignaturSkjemaContextProps> = ({
  initialValues,
  onSubmitCallback,
}) => {
  return (
    <SkjemaContext
      onSubmitCallback={onSubmitCallback}
      initialValues={initialValues}
      validerSkjema={validerSignaturSkjema}
    >
      <OmsorgspengerOverføringIdentSjekk />
    </SkjemaContext>
  );
};

export default SignaturSkjemaContainer;
