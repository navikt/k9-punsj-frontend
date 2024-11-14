import React from 'react';

import classNames from 'classnames';
import { useIntl } from 'react-intl';
import { CopyButton, Label } from '@navikt/ds-react';

import intlHelper from '../../utils/intlUtils';

interface Props {
    labelTextId?: string;
    text?: string;
    value?: string;
    visKopier?: boolean;
    gap?: boolean;
}

const LabelValue: React.FC<Props> = ({ labelTextId, text, value, visKopier, gap }: Props) => {
    const intl = useIntl();

    return (
        <div className={`flex ${gap ? 'gap-4' : undefined}`}>
            <Label as="p" className="mb-0" size="small">
                {text || intlHelper(intl, labelTextId || '')}
            </Label>

            <div className="flex">
                <span>{value}</span>
                {visKopier && value && <CopyButton size="xsmall" copyText={value} className={classNames('copyBtn')} />}
            </div>
        </div>
    );
};

export default LabelValue;
