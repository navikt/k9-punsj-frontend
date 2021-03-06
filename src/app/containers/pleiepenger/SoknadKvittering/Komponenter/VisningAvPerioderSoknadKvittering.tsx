import React from 'react';
import intlHelper from 'app/utils/intlUtils';
import classNames from 'classnames';
import './visningAvPerioderSoknadKvittering.less';
import {v4 as uuidv4} from 'uuid';
import {periodToFormattedString} from "../../../../utils";
import {
    IPSBSoknadKvitteringBeredskapNattevak,
    IPSBSoknadKvitteringBosteder, IPSBSoknadKvitteringLovbestemtFerie,
    IPSBSoknadKvitteringUtenlandsopphold
} from "../../../../models/types/PSBSoknadKvittering";

interface IOwnProps {
    intl: any;
    perioder: IPSBSoknadKvitteringUtenlandsopphold | IPSBSoknadKvitteringBosteder | IPSBSoknadKvitteringBeredskapNattevak | IPSBSoknadKvitteringLovbestemtFerie;
    tittel: string[],
    properties?: string[],
    lessClassForAdjustment?: string;
}

const VisningAvPerioderSoknadKvittering: React.FunctionComponent<IOwnProps> = ({intl, tittel, properties, perioder, lessClassForAdjustment}) => {
    return (
        <div>
            <div
                className={classNames('visningAvPerioderSoknadKvitteringContainer', typeof lessClassForAdjustment !== undefined ? lessClassForAdjustment : '')}>
                {tittel.map(t => {
                    return <h4 key={uuidv4()}>{intlHelper(intl, t)}</h4>
                })}
            </div>
            {Object.keys(perioder).map(periode => {
                return <div key={uuidv4()}
                            className={classNames('visningAvPerioderSoknadKvitteringContainer', typeof lessClassForAdjustment !== undefined ? lessClassForAdjustment : '')}>
                    <p>{periodToFormattedString(periode)}</p>

                    {typeof properties !== "undefined" && properties.map(prop => {
                            return <p key={uuidv4()}>
                                {perioder[periode]![prop]}
                            </p>
                        })
                    }
                </div>
            })}
        </div>
    );
};

export default VisningAvPerioderSoknadKvittering;