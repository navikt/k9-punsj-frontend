import React from 'react';
import { Alert, Button } from '@navikt/ds-react';
import { RootStateType } from 'app/state/RootState';
import { getEnvironmentVariable } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import PLSSoknadKvittering from './SoknadKvittering/PLSSoknadKvittering';

export const PLSKvitteringContainer = () => {
    const intl = useIntl();
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
                    {intlHelper(intl, 'tilbaketilLOS')}
                </Button>
            </div>
            {!!punchFormState.innsentSoknad && (
                <PLSSoknadKvittering response={punchFormState.innsentSoknad} intl={intl} />
            )}
        </>
    );
};
