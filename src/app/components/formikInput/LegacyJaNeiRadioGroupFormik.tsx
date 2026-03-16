import React from 'react';
import { useIntl } from 'react-intl';

import { JaNei } from 'app/models/enums';
import intlHelper from 'app/utils/intlUtils';

import LegacyRadioGroupFormik from './LegacyRadioGroupFormik';

type LegacyRadioGroupFormikProps = React.ComponentProps<typeof LegacyRadioGroupFormik>;

interface OwnProps extends Omit<LegacyRadioGroupFormikProps, 'options'> {
    disabledJa?: boolean;
    disabledNei?: boolean;
    dataTestIdPrefix?: string;
}

const LegacyJaNeiRadioGroupFormik = ({
    disabledJa,
    disabledNei,
    dataTestIdPrefix,
    ...props
}: OwnProps) => {
    const intl = useIntl();

    return (
        <LegacyRadioGroupFormik
            {...props}
            options={[
                {
                    label: intlHelper(intl, JaNei.JA),
                    value: JaNei.JA,
                    disabled: disabledJa,
                    'data-test-id': dataTestIdPrefix ? `${dataTestIdPrefix}-${JaNei.JA}` : undefined,
                },
                {
                    label: intlHelper(intl, JaNei.NEI),
                    value: JaNei.NEI,
                    disabled: disabledNei,
                    'data-test-id': dataTestIdPrefix ? `${dataTestIdPrefix}-${JaNei.NEI}` : undefined,
                },
            ]}
        />
    );
};

export default LegacyJaNeiRadioGroupFormik;
