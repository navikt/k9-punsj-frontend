import React from 'react';
import { useIntl } from 'react-intl';

import { JaNeiIkkeOpplyst } from 'app/models/enums/JaNeiIkkeOpplyst';
import intlHelper from 'app/utils/intlUtils';

import LegacyRadioGroupFormik from './LegacyRadioGroupFormik';

type LegacyRadioGroupFormikProps = React.ComponentProps<typeof LegacyRadioGroupFormik>;

interface OwnProps extends Omit<LegacyRadioGroupFormikProps, 'options'> {
    disabledJa?: boolean;
    disabledNei?: boolean;
    disabledIkkeOpplyst?: boolean;
    dataTestIdPrefix?: string;
}

const LegacyJaNeiIkkeOpplystRadioGroupFormik = ({
    disabledJa,
    disabledNei,
    disabledIkkeOpplyst,
    dataTestIdPrefix,
    ...props
}: OwnProps) => {
    const intl = useIntl();

    return (
        <LegacyRadioGroupFormik
            {...props}
            options={[
                {
                    label: intlHelper(intl, JaNeiIkkeOpplyst.JA),
                    value: JaNeiIkkeOpplyst.JA,
                    disabled: disabledJa,
                    'data-test-id': dataTestIdPrefix ? `${dataTestIdPrefix}-${JaNeiIkkeOpplyst.JA}` : undefined,
                },
                {
                    label: intlHelper(intl, JaNeiIkkeOpplyst.NEI),
                    value: JaNeiIkkeOpplyst.NEI,
                    disabled: disabledNei,
                    'data-test-id': dataTestIdPrefix ? `${dataTestIdPrefix}-${JaNeiIkkeOpplyst.NEI}` : undefined,
                },
                {
                    label: intlHelper(intl, JaNeiIkkeOpplyst.IKKE_OPPLYST),
                    value: JaNeiIkkeOpplyst.IKKE_OPPLYST,
                    disabled: disabledIkkeOpplyst,
                    'data-test-id': dataTestIdPrefix
                        ? `${dataTestIdPrefix}-${JaNeiIkkeOpplyst.IKKE_OPPLYST}`
                        : undefined,
                },
            ]}
        />
    );
};

export default LegacyJaNeiIkkeOpplystRadioGroupFormik;
