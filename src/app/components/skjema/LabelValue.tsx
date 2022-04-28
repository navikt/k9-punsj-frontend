import React from 'react';
import { Label } from 'nav-frontend-skjema';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import intlHelper from '../../utils/intlUtils';
import './labelValue.less';
import Kopier from '../kopier/Kopier';

type ILabelValueProps = {
    value: string | undefined;
    retning?: 'vertikal' | 'horisontal';
    visKopier?: boolean;
} & ({ text: string; labelTextId?: string } | { labelTextId: string; text?: string });

const LabelValue: React.FunctionComponent<ILabelValueProps> = ({
    labelTextId,
    text,
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
            <Label htmlFor={`journalpostpanel.${text || labelTextId}.label`}>
                {text || intlHelper(intl, labelTextId || '')}
            </Label>
            <div id={`journalpostpanel.${text || labelTextId}.value`}>{value}</div>
            {visKopier && <Kopier verdi={value} />}
        </div>
    );
};

export default LabelValue;
