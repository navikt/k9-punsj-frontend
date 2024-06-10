import { Alert, Button } from '@navikt/ds-react';
import { RootStateType } from 'app/state/RootState';
import { getEnvironmentVariable } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { PSBSoknadKvittering } from './SoknadKvittering';

export const PSBKvitteringContainer = () => {
    const punchFormState = useSelector((state: RootStateType) => state.PLEIEPENGER_SYKT_BARN.punchFormState);
    const intl = useIntl();
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
                    {intlHelper(intl, 'tilbaketilLOS')}
                </Button>
            </div>
            {!!punchFormState.innsentSoknad && <PSBSoknadKvittering innsendtSøknad={punchFormState.innsentSoknad} />}
        </>
    );
};
