import {
    GetErrorMessage,
    PeriodeComponent,
    UpdatePeriodeinfoInSoknad,
    UpdatePeriodeinfoInSoknadState
}                                          from 'app/containers/punch-page/Periodepaneler';
import {ITilleggsinformasjon, Periodeinfo} from 'app/models/types';
import intlHelper                          from 'app/utils/intlUtils';
import {Textarea}                          from 'nav-frontend-skjema';
import * as React                          from 'react';
import {IntlShape}                         from 'react-intl';

export function pfTilleggsinformasjon(path: string): PeriodeComponent<ITilleggsinformasjon> {

    return (
        periodeinfo: Periodeinfo<ITilleggsinformasjon>,
        periodeindex: number,
        updatePeriodeinfoInSoknad: UpdatePeriodeinfoInSoknad<ITilleggsinformasjon>,
        updatePeriodeinfoInSoknadState: UpdatePeriodeinfoInSoknadState<ITilleggsinformasjon>,
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
                feil={getErrorMessage(`${feilprefiks}.tillegsinformasjon`)}
                maxLength={0}
            />
        </div>;
    };
}