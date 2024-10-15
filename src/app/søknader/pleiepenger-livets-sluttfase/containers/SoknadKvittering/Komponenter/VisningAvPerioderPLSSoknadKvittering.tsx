import classNames from 'classnames';
import React from 'react';
import { v4 as uuidv4 } from 'uuid';

import intlHelper from 'app/utils/intlUtils';

import { periodToFormattedString } from '../../../../../utils';
import {
    IPLSSoknadKvitteringBeredskapNattevak,
    IPLSSoknadKvitteringBosteder,
    IPLSSoknadKvitteringLovbestemtFerie,
    IPLSSoknadKvitteringUtenlandsopphold,
} from '../../../types/PLSSoknadKvittering';
import './visningAvPerioderPLSSoknadKvittering.less';

interface IOwnProps {
    intl: any;
    perioder:
        | IPLSSoknadKvitteringUtenlandsopphold
        | IPLSSoknadKvitteringBosteder
        | IPLSSoknadKvitteringBeredskapNattevak
        | IPLSSoknadKvitteringLovbestemtFerie;
    tittel: string[];
    properties?: string[];
    lessClassForAdjustment?: string;
}

const VisningAvPerioderPLSSoknadKvittering: React.FunctionComponent<IOwnProps> = ({
    intl,
    tittel,
    properties,
    perioder,
    lessClassForAdjustment,
}) => (
    <div>
        <div className={classNames('visningAvPerioderSoknadKvitteringContainer', lessClassForAdjustment || '')}>
            {tittel.map((t) => (
                <h4 key={uuidv4()}>{intlHelper(intl, t)}</h4>
            ))}
        </div>
        {Object.keys(perioder).map((periode) => (
            <div
                key={periode}
                className={classNames('visningAvPerioderSoknadKvitteringContainer', lessClassForAdjustment || '')}
            >
                <p>{periodToFormattedString(periode)}</p>

                {properties && properties.map((prop) => <p key={uuidv4()}>{perioder[periode]![prop]}</p>)}
            </div>
        ))}
    </div>
);

export default VisningAvPerioderPLSSoknadKvittering;
