import React, { useEffect } from 'react';

import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { Alert, Box, Button, Heading } from '@navikt/ds-react';

import { ROUTES } from 'app/constants/routes';
import { IOMPUTSoknadKvittering } from 'app/søknader/omsorgspenger-utbetaling/types/OMPUTSoknadKvittering';
import { redirectToLos } from 'app/utils';
import { resetAllStateAction } from 'app/state/actions/GlobalActions';
import OMPUTSoknadKvittering from './OMPUTSoknadKvittering';

interface Props {
    kvittering?: IOMPUTSoknadKvittering;
}

const OMPUTSoknadKvitteringContainer: React.FC<Props> = ({ kvittering }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        if (!kvittering) {
            dispatch(resetAllStateAction());
            navigate(ROUTES.HOME);
        }
    }, [kvittering]);

    return (
        <>
            <Alert size="small" variant="info" className="fullfortmelding">
                <FormattedMessage id="skjema.sentInn" />
            </Alert>

            <div className="my-8">
                <Button
                    onClick={() => {
                        redirectToLos();
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

            <Box padding="6" borderWidth="1" borderRadius="medium" borderColor="border-info">
                <OMPUTSoknadKvittering kvittering={kvittering} />
            </Box>
        </>
    );
};

export default OMPUTSoknadKvitteringContainer;
