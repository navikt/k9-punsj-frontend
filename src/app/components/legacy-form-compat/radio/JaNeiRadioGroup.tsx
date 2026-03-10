import React from 'react';
import { useIntl } from 'react-intl';

import { JaNei } from 'app/models/enums';
import intlHelper from 'app/utils/intlUtils';

import LegacyRadioGroup, { LegacyRadioGroupProps } from './RadioGroup';

export interface LegacyJaNeiRadioGroupProps
    extends Omit<LegacyRadioGroupProps, 'checked' | 'defaultChecked' | 'onChange' | 'radios'> {
    checked?: JaNei;
    defaultChecked?: JaNei;
    disabledJa?: boolean;
    disabledNei?: boolean;
    dataTestIdPrefix?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>, value: JaNei) => void;
}

const LegacyJaNeiRadioGroup = ({
    checked,
    defaultChecked,
    disabledJa,
    disabledNei,
    dataTestIdPrefix,
    onChange,
    ...props
}: LegacyJaNeiRadioGroupProps) => {
    const intl = useIntl();

    const radios = [
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
    ];

    return (
        <LegacyRadioGroup
            {...props}
            radios={radios}
            checked={checked}
            defaultChecked={defaultChecked}
            onChange={(event, value) => onChange?.(event, value as JaNei)}
        />
    );
};

export default LegacyJaNeiRadioGroup;
