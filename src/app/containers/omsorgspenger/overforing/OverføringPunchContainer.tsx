import React from 'react';
import { useFormikContext } from 'formik';
import OverføringPunchSkjema from './OverføringPunchSkjema';
import {
  IOverføringPunchSkjema,
  validatePunch,
} from '../../../models/forms/omsorgspenger/overføring/PunchSkjema';
import SkjemaContext from '../../../components/skjema/SkjemaContext';

export const useOverføringPunchSkjemaContext = () =>
  useFormikContext<IOverføringPunchSkjema>();

interface IOverføringPunchContainer {
  initialValues: IOverføringPunchSkjema;
  onSubmitCallback: () => void;
}

const OverføringPunchContainer: React.FunctionComponent<IOverføringPunchContainer> = ({
  initialValues,
  onSubmitCallback,
}) => {
  return (
    <SkjemaContext
      onSubmitCallback={onSubmitCallback}
      initialValues={initialValues}
      validerSkjema={validatePunch}
    >
      <OverføringPunchSkjema />
    </SkjemaContext>
  );
};

export default OverføringPunchContainer;
