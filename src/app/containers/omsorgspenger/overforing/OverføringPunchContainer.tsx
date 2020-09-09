import React from 'react';
import OverføringPunchSkjema from './OverføringPunchSkjema';
import {
  IOverføringPunchSkjema,
  validatePunch,
} from '../../../models/forms/omsorgspenger/overføring/PunchSkjema';
import SkjemaContext from '../../../components/skjema/SkjemaContext';
import { useDispatch, useSelector } from 'react-redux';
import { sendInnSkjema } from '../../../state/reducers/omsorgspengeroverførdager/overføringPunchReducer';
import { RootStateType } from '../../../state/RootState';
import { OmsorgspengerOverføring } from '../../SakstypeImpls';

interface IOverføringPunchContainer {
  initialValues: IOverføringPunchSkjema;
  sendInn: (skjema: IOverføringPunchSkjema) => void;
  gåTilForrigeSteg: () => void;
}

const OverføringPunchContainer: React.FunctionComponent<IOverføringPunchContainer> = ({
  initialValues,
  gåTilForrigeSteg,
}) => {
  const dispatch = useDispatch();
  const { innsendingsstatus, innsendingsfeil } = useSelector(
    (state: RootStateType) => {
      const punchState = state[OmsorgspengerOverføring.navn].punch;
      return {
        innsendingsstatus: punchState.innsendingsstatus,
        innsendingsfeil: punchState.innsendingsfeil,
      };
    }
  );

  return (
    <SkjemaContext
      onSubmitCallback={(skjema) => {
        dispatch(sendInnSkjema(skjema));
      }}
      initialValues={initialValues}
      validerSkjema={validatePunch}
    >
      <OverføringPunchSkjema
        gåTilForrigeSteg={gåTilForrigeSteg}
        innsendingsstatus={innsendingsstatus}
        innsendingsfeil={innsendingsfeil}
      />
    </SkjemaContext>
  );
};

export default OverføringPunchContainer;
