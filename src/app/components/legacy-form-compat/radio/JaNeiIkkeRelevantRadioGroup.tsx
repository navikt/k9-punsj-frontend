import React from 'react';
import { useIntl } from 'react-intl';

import { JaNeiIkkeRelevant } from 'app/models/enums/JaNeiIkkeRelevant';
import intlHelper from 'app/utils/intlUtils';

import LegacyRadioGroup, { LegacyRadioGroupProps } from './RadioGroup';

export interface LegacyJaNeiIkkeRelevantRadioGroupProps
    extends Omit<LegacyRadioGroupProps, 'checked' | 'defaultChecked' | 'onChange' | 'radios'> {
    checked?: JaNeiIkkeRelevant;
    defaultChecked?: JaNeiIkkeRelevant;
    disabledJa?: boolean;
    disabledNei?: boolean;
    disabledIkkeRelevant?: boolean;
    dataTestIdPrefix?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>, value: JaNeiIkkeRelevant) => void;
}

const LegacyJaNeiIkkeRelevantRadioGroup = ({
    checked,
    defaultChecked,
    disabledJa,
    disabledNei,
    disabledIkkeRelevant,
    dataTestIdPrefix,
    onChange,
    ...props
}: LegacyJaNeiIkkeRelevantRadioGroupProps) => {
    const intl = useIntl();

    const radios = [
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
            'data-test-id': dataTestIdPrefix ? `${dataTestIdPrefix}-${JaNeiIkkeRelevant.IKKE_RELEVANT}` : undefined,
        },
    ];

    return (
        <LegacyRadioGroup
            {...props}
            radios={radios}
            checked={checked}
            defaultChecked={defaultChecked}
            onChange={(event, value) => onChange?.(event, value as JaNeiIkkeRelevant)}
        />
    );
};

export default LegacyJaNeiIkkeRelevantRadioGroup;
