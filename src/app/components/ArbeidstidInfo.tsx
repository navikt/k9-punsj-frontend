import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Alert } from '@navikt/ds-react';

export const arbeidstidInformasjon = () => {
    return (
        <div className="arbeidstidInfo">
            <hr />
            <h3>
                <FormattedMessage id={'skjema.arbeidstid.info.overskrift'} />
            </h3>
            <Alert size="small" variant="info">
                <FormattedMessage id={'skjema.arbeidstid.info'} />
            </Alert>
        </div>
    );
};
