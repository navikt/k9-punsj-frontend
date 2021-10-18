import React, { useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Label } from 'nav-frontend-skjema';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import intlHelper from '../../utils/intlUtils';
import './labelValue.less';
import Kopier from '../kopier/Kopier';

interface ILabelValueProps {
    labelTextId: string;
    value: string | undefined;
    retning?: 'vertikal' | 'horisontal';
    visKopier?: boolean;
}

const LabelValue: React.FunctionComponent<ILabelValueProps> = ({
    labelTextId,
    value,
    retning = 'vertikal',
    visKopier,
}) => {
    const valueId = useMemo(() => uuidv4(), []);
    const intl = useIntl();

    return (
        <div
            className={classNames({
                'horisontal-label': retning === 'horisontal',
            })}
        >
            <Label htmlFor={valueId}>{intlHelper(intl, labelTextId)}</Label>
            <div id={valueId}>{value}</div>
            {visKopier && <Kopier verdi={value} />}
        </div>
    );
};

export default LabelValue;
