import * as React from 'react';
import { IntlShape } from 'react-intl';

import { Alert } from '@navikt/ds-react';

import intlHelper from '../../utils/intlUtils';

 import/prefer-default-export
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
