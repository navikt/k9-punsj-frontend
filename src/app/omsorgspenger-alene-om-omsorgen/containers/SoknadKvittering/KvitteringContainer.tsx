import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useHistory } from 'react-router';

import { Alert, Button } from '@navikt/ds-react';

import { IOMPAOSoknadKvittering } from 'app/omsorgspenger-alene-om-omsorgen/types/OMPAOSoknadKvittering';
import { getEnvironmentVariable } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';

import OMPAOSoknadKvittering from './OMPAOSoknadKvittering';

interface OwnProps {
    kvittering?: IOMPAOSoknadKvittering;
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
            <div className="punchPage__knapper mt-8">
                <Button
                    onClick={() => {
                        window.location.href = getEnvironmentVariable('K9_LOS_URL');
                    }}
                >
                    {intlHelper(intl, 'tilbaketilLOS')}
                </Button>
            </div>
            <OMPAOSoknadKvittering {...props} />
        </>
    );
}
