import { IOMPUTSoknadKvittering } from 'app/omsorgspenger-utbetaling/types/OMPUTSoknadKvittering';
import { getEnvironmentVariable } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import { AlertStripeInfo } from 'nav-frontend-alertstriper';
import { Hovedknapp } from 'nav-frontend-knapper';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useHistory } from 'react-router';
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
            <AlertStripeInfo className="fullfortmelding">
                <FormattedMessage id="skjema.sentInn" />
            </AlertStripeInfo>
            <div className="punchPage__knapper">
                <Hovedknapp
                    onClick={() => {
                        window.location.href = getEnvironmentVariable('K9_LOS_URL');
                    }}
                >
                    {intlHelper(intl, 'tilbaketilLOS')}
                </Hovedknapp>
            </div>
            <OMPUTSoknadKvittering {...props} />
        </>
    );
}
