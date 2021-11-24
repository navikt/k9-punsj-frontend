import React from 'react';
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
    const intl = useIntl();

    return (
        <div
            className={classNames({
                'horisontal-label': retning === 'horisontal',
            })}
        >
            <Label htmlFor={`journalpostpanel.${labelTextId}.label`}>{intlHelper(intl, labelTextId)}</Label>
            <div id={`journalpostpanel.${labelTextId}.value`}>{value}</div>
            {visKopier && <Kopier verdi={value} />}
        </div>
    );
};

export default LabelValue;
