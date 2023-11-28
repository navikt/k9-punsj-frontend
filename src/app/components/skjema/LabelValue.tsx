import classNames from 'classnames';
import { Label } from 'nav-frontend-skjema';
import React from 'react';
import { useIntl } from 'react-intl';
import { CopyButton, HStack } from '@navikt/ds-react';
import intlHelper from '../../utils/intlUtils';
import './labelValue.less';

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
            <HStack gap="1" align="center">
                <Label htmlFor={`journalpostpanel.${text || labelTextId}.label`}>
                    {text || intlHelper(intl, labelTextId || '')}
                </Label>

                <div id={`journalpostpanel.${text || labelTextId}.value`}>{value}</div>
                {visKopier && value && <CopyButton size="small" copyText={value} />}
            </HStack>
        </div>
    );
};

export default LabelValue;
