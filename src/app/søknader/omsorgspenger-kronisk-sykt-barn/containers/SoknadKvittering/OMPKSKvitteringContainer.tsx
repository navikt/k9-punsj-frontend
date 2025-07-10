import React from 'react';

import { useSelector } from 'react-redux';
import { RootStateType } from 'app/state/RootState';
import { Alert, Box, Button, Heading } from '@navikt/ds-react';
import { getEnvironmentVariable } from 'app/utils';
import { FormattedMessage } from 'react-intl';
import OMPKSSoknadKvittering from './OMPKSSoknadKvittering';

export const OMPKSKvitteringContainer = () => {
    const { innsentSoknad } = useSelector(
        (state: RootStateType) => state.OMSORGSPENGER_KRONISK_SYKT_BARN.punchFormState,
    );

    return (
        <>
            <Alert size="small" variant="info" className="fullfortmelding">
                <FormattedMessage id="skjema.sentInn" />
            </Alert>

            <div className="my-8">
                <Button
                    onClick={() => {
                        window.location.href = getEnvironmentVariable('K9_LOS_URL');
                    }}
                >
                    <FormattedMessage id="tilbaketilLOS" />
                </Button>
            </div>

            {innsentSoknad && (
                <Box padding="6" borderWidth="1" borderRadius="medium" borderColor="border-info">
                    <div className="mb-6">
                        <Heading size="medium" level="2">
                            <FormattedMessage id="skjema.kvittering.oppsummering" />
                        </Heading>
                    </div>

                    <OMPKSSoknadKvittering response={innsentSoknad} />
                </Box>
            )}
        </>
    );
};
