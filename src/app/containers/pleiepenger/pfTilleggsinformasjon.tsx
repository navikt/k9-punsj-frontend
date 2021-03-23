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
import {PeriodeinfoV2} from "../../models/types/PeriodeInfoV2";
import {ITilleggsinformasjonV2} from "../../models/types/Soknadv2";

export function pfTilleggsinformasjon(path: string): PeriodeinfoComponent<ITilleggsinformasjonV2> {

    return (
        periodeinfo: PeriodeinfoV2<ITilleggsinformasjonV2>,
        periodeindex: number,
        updatePeriodeinfoInSoknad: UpdatePeriodeinfoInSoknad<ITilleggsinformasjonV2>,
        updatePeriodeinfoInSoknadState: UpdatePeriodeinfoInSoknadState<ITilleggsinformasjonV2>,
        feilprefiks: string,
        getErrorMessage: GetErrorMessage,
        intl: IntlShape
    ) => {

        return <div className="tilleggsinfo">
            <Textarea
                label={intlHelper(intl, `skjema.${path}.tilleggsinfo`)}
                value={periodeinfo.tilleggsinformasjon || ''}
                onChange={event => updatePeriodeinfoInSoknadState({tilleggsinformasjon: event.target.value}, false)}
                onBlur={event => updatePeriodeinfoInSoknad({tilleggsinformasjon: event.target.value})}
                feil={getErrorMessage(`${feilprefiks}.tilleggsinformasjon`)}
                maxLength={0}
            />
        </div>;
    };
}
