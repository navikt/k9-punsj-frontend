import React, { useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router';

import { Alert, Button } from '@navikt/ds-react';

import { ROUTES } from 'app/constants/routes';
import { IOMPUTSoknadKvittering } from 'app/søknader/omsorgspenger-utbetaling/types/OMPUTSoknadKvittering';
import { getEnvironmentVariable } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import { resetAllStateAction } from 'app/state/actions/GlobalActions';
import { useDispatch } from 'react-redux';

import OMPUTSoknadKvittering from './OMPUTSoknadKvittering';

interface OwnProps {
    kvittering?: IOMPUTSoknadKvittering;
}

export default function KvitteringContainer({ kvittering }: OwnProps) {
    const intl = useIntl();
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
            <div className="punchPage__knapper mt-8">
                <Button
                    onClick={() => {
                        window.location.href = getEnvironmentVariable('K9_LOS_URL');
                    }}
                >
                    {intlHelper(intl, 'tilbaketilLOS')}
                </Button>
            </div>
            <OMPUTSoknadKvittering kvittering={kvittering} />
        </>
    );
}
