import React from 'react';
import OverføringPunchSkjema from './OverføringPunchSkjema';
import {
  IOverføringPunchSkjema,
  validatePunch,
} from '../../../models/forms/omsorgspenger/overføring/PunchSkjema';
import SkjemaContext from '../../../components/skjema/SkjemaContext';

interface IOverføringPunchContainer {
  initialValues: IOverføringPunchSkjema;
  sendInn: (skjema: IOverføringPunchSkjema) => void;
  gåTilForrigeSteg: () => void;
}

const OverføringPunchContainer: React.FunctionComponent<IOverføringPunchContainer> = ({
  initialValues,
  sendInn,
  gåTilForrigeSteg,
}) => {
  return (
    <SkjemaContext
      onSubmitCallback={(skjema, formikHelpers) => {
        sendInn(skjema);
        // TODO
        // console.log('kaller set submit false');
        // formikHelpers.setSubmitting(false);
      }}
      initialValues={initialValues}
      validerSkjema={validatePunch}
    >
      <OverføringPunchSkjema gåTilForrigeSteg={gåTilForrigeSteg} />
    </SkjemaContext>
  );
};

export default OverføringPunchContainer;
