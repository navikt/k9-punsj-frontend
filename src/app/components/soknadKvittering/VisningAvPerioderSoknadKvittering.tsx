import React from 'react';

import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';

import { IPSBSoknadKvitteringBeredskapNattevak } from '../../models/types/PSBSoknadKvittering';
import { periodToFormattedString } from '../../utils';
import {
    ISoknadKvitteringBosteder,
    ISoknadKvitteringLovbestemtFerie,
    ISoknadKvitteringUtenlandsopphold,
} from 'app/models/types/KvitteringTyper';

import './visningAvPerioderSoknadKvittering.less';

interface Props {
    perioder:
        | ISoknadKvitteringUtenlandsopphold
        | ISoknadKvitteringBosteder
        | IPSBSoknadKvitteringBeredskapNattevak
        | ISoknadKvitteringLovbestemtFerie;
    tittel: string[];
    properties?: string[];
    lessClassForAdjustment?: string;
}

const VisningAvPerioderSoknadKvittering: React.FC<Props> = ({
    tittel,
    properties,
    perioder,
    lessClassForAdjustment,
}) => {
    return (
        <div>
            <div className={classNames('visningAvPerioderSoknadKvitteringContainer', !!lessClassForAdjustment)}>
                {tittel.map((t, index) => (
                    <h4 key={index}>
                        <FormattedMessage id={t} />
                    </h4>
                ))}
            </div>

            {Object.entries(perioder)
                .sort(([periodeA], [periodeB]) => {
                    const fomA = periodeA.split('/')?.[0];
                    const fomB = periodeB.split('/')?.[0];
                    return new Date(fomA).getTime() - new Date(fomB).getTime();
                })
                .map(([periode, props]) => (
                    <div
                        key={periode}
                        className={classNames('visningAvPerioderSoknadKvitteringContainer', !!lessClassForAdjustment)}
                    >
                        <p>{periodToFormattedString(periode)}</p>

                        {properties && properties.map((prop) => <p key={prop}>{props[prop]}</p>)}
                    </div>
                ))}
        </div>
    );
};

export default VisningAvPerioderSoknadKvittering;
