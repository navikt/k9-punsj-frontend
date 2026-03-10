import React from 'react';
import { useIntl } from 'react-intl';

import { JaNeiIkkeOpplyst } from 'app/models/enums/JaNeiIkkeOpplyst';
import intlHelper from 'app/utils/intlUtils';

import LegacyRadioGroup, { LegacyRadioGroupProps } from './RadioGroup';

export interface LegacyJaNeiIkkeOpplystRadioGroupProps
    extends Omit<LegacyRadioGroupProps, 'checked' | 'defaultChecked' | 'onChange' | 'radios'> {
    checked?: JaNeiIkkeOpplyst;
    defaultChecked?: JaNeiIkkeOpplyst;
    disabledJa?: boolean;
    disabledNei?: boolean;
    disabledIkkeOpplyst?: boolean;
    dataTestIdPrefix?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>, value: JaNeiIkkeOpplyst) => void;
}

const LegacyJaNeiIkkeOpplystRadioGroup = ({
    checked,
    defaultChecked,
    disabledJa,
    disabledNei,
    disabledIkkeOpplyst,
    dataTestIdPrefix,
    onChange,
    ...props
}: LegacyJaNeiIkkeOpplystRadioGroupProps) => {
    const intl = useIntl();

    const radios = [
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
            'data-test-id': dataTestIdPrefix ? `${dataTestIdPrefix}-${JaNeiIkkeOpplyst.IKKE_OPPLYST}` : undefined,
        },
    ];

    return (
        <LegacyRadioGroup
            {...props}
            radios={radios}
            checked={checked}
            defaultChecked={defaultChecked}
            onChange={(event, value) => onChange?.(event, value as JaNeiIkkeOpplyst)}
        />
    );
};

export default LegacyJaNeiIkkeOpplystRadioGroup;
