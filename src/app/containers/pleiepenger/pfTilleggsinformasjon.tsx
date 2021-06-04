import {
    GetErrorMessage,
    PeriodeinfoComponent,
    UpdatePeriodeinfoInSoknad,
    UpdatePeriodeinfoInSoknadState
}                                          from 'app/containers/pleiepenger/PeriodeinfoPaneler';
import intlHelper                          from 'app/utils/intlUtils';
import {Textarea}                          from 'nav-frontend-skjema';
import * as React                          from 'react';
import {IntlShape}                         from 'react-intl';
import {Periodeinfo} from "../../models/types/Periodeinfo";
import {ITilleggsinformasjon} from "../../models/types/PSBSoknad";

export function pfTilleggsinformasjon(path: string): PeriodeinfoComponent<ITilleggsinformasjon> {

    return (
        periodeinfo: Periodeinfo<ITilleggsinformasjon>,
        periodeindex: number,
        updatePeriodeinfoInSoknad: UpdatePeriodeinfoInSoknad<ITilleggsinformasjon>,
        updatePeriodeinfoInSoknadState: UpdatePeriodeinfoInSoknadState<ITilleggsinformasjon>,
        feilprefiks: string,
        getErrorMessage: GetErrorMessage,
        intl: IntlShape,
    ) => {

        return <div className="tilleggsinfo">
            <Textarea
                label={intlHelper(intl, `skjema.${path}.tilleggsinfo`)}
                value={periodeinfo.tilleggsinformasjon || ''}
                onChange={(event) => updatePeriodeinfoInSoknadState({tilleggsinformasjon: event.target.value}, false)}
                onBlur={event => updatePeriodeinfoInSoknad({tilleggsinformasjon: event.target.value})}
                feil={getErrorMessage(`${feilprefiks}.tilleggsinformasjon`)}
            />
        </div>;
    };
}
