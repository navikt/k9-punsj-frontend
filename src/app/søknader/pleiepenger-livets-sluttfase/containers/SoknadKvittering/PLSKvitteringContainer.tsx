import React from 'react';

import { Alert, Button } from '@navikt/ds-react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';

import { RootStateType } from 'app/state/RootState';
import { getEnvironmentVariable } from 'app/utils';
import PLSSoknadKvittering from './PLSSoknadKvittering';

const PLSKvitteringContainer = () => {
    const punchFormState = useSelector((state: RootStateType) => state.PLEIEPENGER_I_LIVETS_SLUTTFASE.punchFormState);

    return (
        <>
            <Alert size="small" variant="info" className="fullfortmelding">
                <FormattedMessage id="skjema.sentInn" />
            </Alert>

            <div className="punchPage__knapper mt-8">
                <Button
                    onClick={() => {
                        window.location.href = getEnvironmentVariable('K9_LOS_URL');
                    }}
                >
                    <FormattedMessage id="tilbaketilLOS" />
                </Button>
            </div>

            {!!punchFormState.innsentSoknad && <PLSSoknadKvittering response={punchFormState.innsentSoknad} />}
        </>
    );
};

export default PLSKvitteringContainer;
