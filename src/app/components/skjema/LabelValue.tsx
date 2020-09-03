import React, { useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Label } from 'nav-frontend-skjema';
import { useIntl } from 'react-intl';
import intlHelper from '../../utils/intlUtils';

interface ILabelValueProps {
  labelTextId: string;
  value: React.ReactNode;
}

const LabelValue: React.FunctionComponent<ILabelValueProps> = ({
  labelTextId,
  value,
}) => {
  const valueId = useMemo(() => uuidv4(), []);
  const intl = useIntl();

  return (
    <>
      <Label htmlFor={valueId}>{intlHelper(intl, labelTextId)}</Label>
      <div id={valueId}>{value}</div>
    </>
  );
};

export default LabelValue;
