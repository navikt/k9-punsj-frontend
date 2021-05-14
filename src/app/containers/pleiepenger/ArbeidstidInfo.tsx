import {IntlShape} from "react-intl";
import intlHelper from "../../utils/intlUtils";
import * as React from "react";
import {AlertStripeInfo} from "nav-frontend-alertstriper";

export function arbeidstidInformasjon(intl: IntlShape) {
    return (
        <div>
            <hr/>
            <h3>{intlHelper(intl, 'skjema.arbeidstid.info.overskrift')}</h3>
            <AlertStripeInfo>{intlHelper(intl, 'skjema.arbeidstid.info')}</AlertStripeInfo>
        </div>
    );
}
