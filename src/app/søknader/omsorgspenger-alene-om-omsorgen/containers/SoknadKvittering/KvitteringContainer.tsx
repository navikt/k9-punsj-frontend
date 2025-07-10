import React, { useEffect } from 'react';

import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { Alert, Box, Button, Heading } from '@navikt/ds-react';
import { IOMPAOSoknadKvittering } from 'app/søknader/omsorgspenger-alene-om-omsorgen/types/OMPAOSoknadKvittering';
import { getEnvironmentVariable } from 'app/utils';
import { ROUTES } from 'app/constants/routes';
import { resetAllStateAction } from 'app/state/actions/GlobalActions';
import OMPAOSoknadKvittering from './OMPAOSoknadKvittering';

interface Props {
    kvittering?: IOMPAOSoknadKvittering;
}

const KvitteringContainer: React.FC<Props> = ({ kvittering }: Props) => {
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

            <Box padding="6" borderWidth="1" borderRadius="medium" borderColor="border-info">
                <OMPAOSoknadKvittering kvittering={kvittering} />
            </Box>
        </>
    );
};

export default KvitteringContainer;
