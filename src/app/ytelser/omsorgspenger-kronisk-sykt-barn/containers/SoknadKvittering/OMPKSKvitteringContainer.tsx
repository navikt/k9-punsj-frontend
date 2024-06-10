import React from 'react';
import { useSelector } from 'react-redux';
import { RootStateType } from 'app/state/RootState';
import { Alert, Button } from '@navikt/ds-react';
import { getEnvironmentVariable } from 'app/utils';
import { FormattedMessage, useIntl } from 'react-intl';
import intlHelper from 'app/utils/intlUtils';
import OMPKSSoknadKvittering from './OMPKSSoknadKvittering';

export const OMPKSKvitteringContainer = () => {
    const { innsentSoknad } = useSelector(
        (state: RootStateType) => state.OMSORGSPENGER_KRONISK_SYKT_BARN.punchFormState,
    );
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
            {innsentSoknad && <OMPKSSoknadKvittering response={innsentSoknad} />}
        </>
    );
};
