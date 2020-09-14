import React from 'react';
import OverføringIdentSjekk from './OverføringIdentSjekk';
import {
  ISignaturSkjema,
  validerSignaturSkjema,
} from '../../../models/forms/omsorgspenger/overføring/SignaturSkjema';
import SkjemaContext from '../../../components/skjema/SkjemaContext';
import { useDispatch } from 'react-redux';
import { setSkjema } from 'app/state/reducers/omsorgspengeroverførdager/overføringSignaturReducer';

interface ISignaturSkjemaContextProps {
  initialValues: ISignaturSkjema;
  gåTilNesteSteg: (skjemaParams: { ident: string }) => void;
}

const OverføringIdentSjekkContainer: React.FunctionComponent<ISignaturSkjemaContextProps> = ({
  initialValues,
  gåTilNesteSteg,
}) => {
  const dispatch = useDispatch();

  return (
    <SkjemaContext
      onSubmitCallback={(values: ISignaturSkjema) => {
        dispatch(setSkjema(values));
        gåTilNesteSteg({ ident: values.identitetsnummer });
      }}
      initialValues={initialValues}
      validerSkjema={validerSignaturSkjema}
    >
      <OverføringIdentSjekk />
    </SkjemaContext>
  );
};

export default OverføringIdentSjekkContainer;
