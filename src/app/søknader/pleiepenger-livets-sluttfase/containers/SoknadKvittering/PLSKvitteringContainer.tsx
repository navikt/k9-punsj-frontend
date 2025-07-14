import React from 'react';

import { Alert, Box, Button, Heading } from '@navikt/ds-react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';

import { RootStateType } from 'app/state/RootState';
import { getEnvironmentVariable } from 'app/utils';
import PLSSoknadKvittering from './PLSSoknadKvittering';

const PLSKvitteringContainer = () => {
    const punchFormState = useSelector((state: RootStateType) => state.PLEIEPENGER_I_LIVETS_SLUTTFASE.punchFormState);

    return (
        <>
            <Alert size="small" variant="info" className="mt-4">
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

            <div className="mb-6">
                <Heading size="medium" level="2">
                    <FormattedMessage id="skjema.kvittering.oppsummering" />
                </Heading>
            </div>

            {!!punchFormState.innsentSoknad && (
                <Box padding="6" borderWidth="1" borderRadius="medium" borderColor="border-info">
                    <PLSSoknadKvittering response={punchFormState.innsentSoknad} />
                </Box>
            )}
        </>
    );
};

export default PLSKvitteringContainer;
