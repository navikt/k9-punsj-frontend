import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useHistory } from 'react-router';

import { Alert, Button } from '@navikt/ds-react';

import VerticalSpacer from 'app/components/VerticalSpacer';
import { getEnvironmentVariable } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';

import { IOLPSoknadKvittering } from '../../OLPSoknadKvittering';
import OLPSoknadKvittering from './OLPSoknadKvittering';

interface OwnProps {
    kvittering?: IOLPSoknadKvittering;
}

export default function KvitteringContainer(props: OwnProps) {
    const intl = useIntl();
    const history = useHistory();
    if (!props.kvittering) {
        history.push('/');
        return null;
    }
    return (
        <>
            <Alert size="small" variant="info" className="fullfortmelding">
                <FormattedMessage id="skjema.sentInn" />
            </Alert>
            <VerticalSpacer sixteenPx />
            <div className="punchPage__knapper">
                <Button
                    onClick={() => {
                        window.location.href = getEnvironmentVariable('K9_LOS_URL');
                    }}
                >
                    {intlHelper(intl, 'tilbaketilLOS')}
                </Button>
            </div>
            <OLPSoknadKvittering kvittering={props.kvittering} />
        </>
    );
}
