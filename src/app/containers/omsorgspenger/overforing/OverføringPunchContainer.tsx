import React from 'react';
import { Formik, useFormikContext } from 'formik';
import { useIntl } from 'react-intl';
import OverføringPunchSkjema from './OverføringPunchSkjema';
import {
  IOverføringPunchSkjema,
  validatePunch,
} from '../../../models/forms/omsorgspenger/overføring/PunchSkjema';

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
  const intl = useIntl();

  return (
    <Formik
      onSubmit={onSubmitCallback}
      initialValues={initialValues}
      validateOnChange={true}
      validateOnBlur={true}
      validate={validatePunch(intl)}
    >
      <OverføringPunchSkjema />
    </Formik>
  );
};

export default OverføringPunchContainer;
