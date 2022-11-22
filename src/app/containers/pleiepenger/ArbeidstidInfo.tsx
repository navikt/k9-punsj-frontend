import { Alert } from '@navikt/ds-react';
import * as React from 'react';
import { IntlShape } from 'react-intl';
import intlHelper from '../../utils/intlUtils';

// eslint-disable-next-line import/prefer-default-export
export function arbeidstidInformasjon(intl: IntlShape) {
    return (
        <div className="arbeidstidInfo">
            <hr />
            <h3>{intlHelper(intl, 'skjema.arbeidstid.info.overskrift')}</h3>
            <Alert size="small" variant="info">
                {intlHelper(intl, 'skjema.arbeidstid.info')}
            </Alert>
        </div>
    );
}
