import classNames from 'classnames';
import React from 'react';
import { v4 as uuidv4 } from 'uuid';

import intlHelper from 'app/utils/intlUtils';

import {
    IPSBSoknadKvitteringBeredskapNattevak,
    IPSBSoknadKvitteringBosteder,
    IPSBSoknadKvitteringLovbestemtFerie,
    IPSBSoknadKvitteringUtenlandsopphold,
} from '../../models/types/PSBSoknadKvittering';
import { periodToFormattedString } from '../../utils';
import './visningAvPerioderSoknadKvittering.less';

interface IOwnProps {
    intl: any;
    perioder:
        | IPSBSoknadKvitteringUtenlandsopphold
        | IPSBSoknadKvitteringBosteder
        | IPSBSoknadKvitteringBeredskapNattevak
        | IPSBSoknadKvitteringLovbestemtFerie;
    tittel: string[];
    properties?: string[];
    lessClassForAdjustment?: string;
}

const VisningAvPerioderSoknadKvittering: React.FunctionComponent<IOwnProps> = ({
    intl,
    tittel,
    properties,
    perioder,
    lessClassForAdjustment,
}) => (
    <div>
        <div className={classNames('visningAvPerioderSoknadKvitteringContainer', !!lessClassForAdjustment)}>
            {tittel.map((t) => (
                <h4 key={uuidv4()}>{intlHelper(intl, t)}</h4>
            ))}
        </div>
        {Object.keys(perioder)
            .sort((a, b) => {
                const fomA = a.split('/')?.[0];
                const fomB = b.split('/')?.[0];
                return new Date(fomA).getTime() - new Date(fomB).getTime();
            })
            .map((periode) => (
                <div
                    key={periode}
                    className={classNames('visningAvPerioderSoknadKvitteringContainer', !!lessClassForAdjustment)}
                >
                    <p>{periodToFormattedString(periode)}</p>

                    {properties && properties.map((prop) => <p key={uuidv4()}>{perioder[periode]![prop]}</p>)}
                </div>
            ))}
    </div>
);

export default VisningAvPerioderSoknadKvittering;
