import React from 'react';
import { useIntl } from 'react-intl';

import { JaNeiIkkeRelevant } from 'app/models/enums/JaNeiIkkeRelevant';
import intlHelper from 'app/utils/intlUtils';

import LegacyRadioGroupFormik from './LegacyRadioGroupFormik';

type LegacyRadioGroupFormikProps = React.ComponentProps<typeof LegacyRadioGroupFormik>;

interface OwnProps extends Omit<LegacyRadioGroupFormikProps, 'options'> {
    disabledJa?: boolean;
    disabledNei?: boolean;
    disabledIkkeRelevant?: boolean;
    dataTestIdPrefix?: string;
}

const LegacyJaNeiIkkeRelevantRadioGroupFormik = ({
    disabledJa,
    disabledNei,
    disabledIkkeRelevant,
    dataTestIdPrefix,
    ...props
}: OwnProps) => {
    const intl = useIntl();

    return (
        <LegacyRadioGroupFormik
            {...props}
            options={[
                {
                    label: intlHelper(intl, JaNeiIkkeRelevant.JA),
                    value: JaNeiIkkeRelevant.JA,
                    disabled: disabledJa,
                    'data-test-id': dataTestIdPrefix ? `${dataTestIdPrefix}-${JaNeiIkkeRelevant.JA}` : undefined,
                },
                {
                    label: intlHelper(intl, JaNeiIkkeRelevant.NEI),
                    value: JaNeiIkkeRelevant.NEI,
                    disabled: disabledNei,
                    'data-test-id': dataTestIdPrefix ? `${dataTestIdPrefix}-${JaNeiIkkeRelevant.NEI}` : undefined,
                },
                {
                    label: intlHelper(intl, JaNeiIkkeRelevant.IKKE_RELEVANT),
                    value: JaNeiIkkeRelevant.IKKE_RELEVANT,
                    disabled: disabledIkkeRelevant,
                    'data-test-id': dataTestIdPrefix
                        ? `${dataTestIdPrefix}-${JaNeiIkkeRelevant.IKKE_RELEVANT}`
                        : undefined,
                },
            ]}
        />
    );
};

export default LegacyJaNeiIkkeRelevantRadioGroupFormik;
