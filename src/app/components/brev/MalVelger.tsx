import React from 'react';

import { FormattedMessage } from 'react-intl';

import { BrevFormKeys, IBrevForm } from './types';
import Brevmal from './Brevmal';
import { FormSelect } from 'app/components/form';

interface Props {
    resetBrevStatus: () => void;
    brevmaler: Brevmal;
}

const MalVelger: React.FC<Props> = ({ brevmaler, resetBrevStatus }) => {
    const brevmalkoder = Object.keys(brevmaler);

    return (
        <FormSelect<IBrevForm>
            name={BrevFormKeys.brevmalkode}
            label={<FormattedMessage id="malVelger.brevmalkodeSelect.title" />}
            className="w-[400px]"
            required="Dette feltet er påkrevd"
            onChange={() => resetBrevStatus()}
        >
            <option disabled key="default" value="" label="">
                <FormattedMessage id="malVelger.brevmalkodeSelect.velg" />
            </option>

            {brevmalkoder.map((brevmalkode) => (
                <option key={brevmalkode} value={brevmalkode}>
                    {brevmaler[brevmalkode].navn}
                </option>
            ))}
        </FormSelect>
    );
};

export default MalVelger;
