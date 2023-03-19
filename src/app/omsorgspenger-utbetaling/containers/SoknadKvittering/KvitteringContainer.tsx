import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useHistory } from 'react-router';

import { Alert, Button } from '@navikt/ds-react';

import { IOMPUTSoknadKvittering } from 'app/omsorgspenger-utbetaling/types/OMPUTSoknadKvittering';
import { getEnvironmentVariable } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';

import OMPUTSoknadKvittering from './OMPUTSoknadKvittering';

interface OwnProps {
    kvittering?: IOMPUTSoknadKvittering;
}

export default function KvitteringContainer(props: OwnProps) {
    const intl = useIntl();
    const history = useHistory();
    if (!props.kvittering) {
        history.push('/');
    }
    return (
        <>
            <Alert size="small" variant="info" className="fullfortmelding">
                <FormattedMessage id="skjema.sentInn" />
            </Alert>
            <div className="punchPage__knapper">
                <Button
                    onClick={() => {
                        window.location.href = getEnvironmentVariable('K9_LOS_URL');
                    }}
                >
                    {intlHelper(intl, 'tilbaketilLOS')}
                </Button>
            </div>
            <OMPUTSoknadKvittering {...props} />
        </>
    );
}
