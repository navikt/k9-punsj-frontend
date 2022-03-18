import React from 'react';
import intlHelper from 'app/utils/intlUtils';
import classNames from 'classnames';
import './visningAvPerioderPLSSoknadKvittering.less';
import { v4 as uuidv4 } from 'uuid';
import { periodToFormattedString } from '../../../../utils';
import {
    IPLSSoknadKvitteringBeredskapNattevak,
    IPLSSoknadKvitteringBosteder,
    IPLSSoknadKvitteringLovbestemtFerie,
    IPLSSoknadKvitteringUtenlandsopphold,
} from '../../../types/PLSSoknadKvittering';

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
        <div
            className={classNames(
                'visningAvPerioderSoknadKvitteringContainer',
                typeof lessClassForAdjustment !== undefined ? lessClassForAdjustment : ''
            )}
        >
            {tittel.map((t) => (
                <h4 key={uuidv4()}>{intlHelper(intl, t)}</h4>
            ))}
        </div>
        {Object.keys(perioder).map((periode) => (
            <div
                key={uuidv4()}
                className={classNames(
                    'visningAvPerioderSoknadKvitteringContainer',
                    typeof lessClassForAdjustment !== undefined ? lessClassForAdjustment : ''
                )}
            >
                <p>{periodToFormattedString(periode)}</p>

                {properties && properties.map((prop) => <p key={uuidv4()}>{perioder[periode]![prop]}</p>)}
            </div>
        ))}
    </div>
);

export default VisningAvPerioderPLSSoknadKvittering;
