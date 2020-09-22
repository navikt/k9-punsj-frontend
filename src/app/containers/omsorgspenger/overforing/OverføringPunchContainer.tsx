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
import { Sakstype } from '../../../models/enums';

interface IOverføringPunchContainer {
  initialValues: IOverføringPunchSkjema;
  gåTilForrigeSteg: () => void;
}

const OverføringPunchContainer: React.FunctionComponent<IOverføringPunchContainer> = ({
  initialValues,
  gåTilForrigeSteg,
}) => {
  const dispatch = useDispatch();
  const { innsendingsstatus, innsendingsfeil, journalpostId } = useSelector(
    (state: RootStateType) => {
      const punchState = state[Sakstype.OMSORGSPENGER_OVERFØRING].punch;
      return {
        innsendingsstatus: punchState.innsendingsstatus,
        innsendingsfeil: punchState.innsendingsfeil,
        journalpostId: state.felles.journalpost!.journalpostId,
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
        journalpostId={journalpostId}
      />
    </SkjemaContext>
  );
};

export default OverføringPunchContainer;
