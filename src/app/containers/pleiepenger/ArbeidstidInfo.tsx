import { IntlShape } from 'react-intl';
import * as React from 'react';
import { AlertStripeInfo } from 'nav-frontend-alertstriper';
import intlHelper from '../../utils/intlUtils';

// eslint-disable-next-line import/prefer-default-export
export function arbeidstidInformasjon(intl: IntlShape) {
    return (
        <div className="arbeidstidInfo">
            <hr />
            <h3>{intlHelper(intl, 'skjema.arbeidstid.info.overskrift')}</h3>
            <AlertStripeInfo>{intlHelper(intl, 'skjema.arbeidstid.info')}</AlertStripeInfo>
        </div>
    );
}
