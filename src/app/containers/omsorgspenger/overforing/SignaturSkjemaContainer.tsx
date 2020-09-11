import React from 'react';
import OmsorgspengerOverføringIdentSjekk from './OmsorgspengerOverføringIdentSjekk';
import {
  ISignaturSkjema,
  validerSignaturSkjema,
} from '../../../models/forms/omsorgspenger/overføring/SignaturSkjema';
import SkjemaContext from '../../../components/skjema/SkjemaContext';
import { useDispatch } from 'react-redux';
import { setSkjema } from '../../../state/reducers/omsorgspengeroverførdager/overføringSignaturReducer';

interface ISignaturSkjemaContextProps {
  initialValues: ISignaturSkjema;
  gåTilNesteSteg: (skjemaParams: { ident: string }) => void;
}

const SignaturSkjemaContainer: React.FunctionComponent<ISignaturSkjemaContextProps> = ({
  initialValues,
  gåTilNesteSteg,
}) => {
  const dispatch = useDispatch();

  return (
    <SkjemaContext
      onSubmitCallback={(values) => {
        dispatch(setSkjema(values));
        gåTilNesteSteg({ ident: values.fødselsnummer });
      }}
      initialValues={initialValues}
      validerSkjema={validerSignaturSkjema}
    >
      <OmsorgspengerOverføringIdentSjekk />
    </SkjemaContext>
  );
};

export default SignaturSkjemaContainer;
