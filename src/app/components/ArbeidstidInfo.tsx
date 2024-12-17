import React from 'react';

import { FormattedMessage } from 'react-intl';
import { Alert, Heading } from '@navikt/ds-react';

export const arbeidstidInformasjon = () => {
    return (
        <div className="arbeidstidInfo">
            <hr />

            <Heading size="small" level="3">
                <FormattedMessage id={'skjema.arbeidstid.info.overskrift'} />
            </Heading>

            <Alert size="small" variant="info">
                <FormattedMessage id={'skjema.arbeidstid.info'} />
            </Alert>
        </div>
    );
};
