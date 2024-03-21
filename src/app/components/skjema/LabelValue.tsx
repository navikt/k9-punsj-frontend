import React from 'react';

import classNames from 'classnames';
import { Label } from 'nav-frontend-skjema';
import { useIntl } from 'react-intl';
import { CopyButton, HStack } from '@navikt/ds-react';
import intlHelper from '../../utils/intlUtils';

type ILabelValueProps = {
    value: string | undefined;
    visKopier?: boolean;
} & ({ text: string; labelTextId?: string } | { labelTextId: string; text?: string });

const LabelValue: React.FC<ILabelValueProps> = ({ labelTextId, text, value, visKopier }) => {
    const intl = useIntl();

    return (
        <HStack gap="10">
            <Label htmlFor={`journalpostpanel.${text || labelTextId}.label`} className="mb-0">
                {text || intlHelper(intl, labelTextId || '')}
            </Label>

            <div id={`journalpostpanel.${text || labelTextId}.value`} className="flex">
                <span>{value}</span>
                {visKopier && value && (
                    <span>
                        <CopyButton size="xsmall" copyText={value} className={classNames('copyBtn')} />
                    </span>
                )}
            </div>
        </HStack>
    );
};

export default LabelValue;
