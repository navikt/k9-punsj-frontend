import {
    GetErrorMessage,
    PeriodeinfoComponent,
    UpdatePeriodeinfoInSoknad,
    UpdatePeriodeinfoInSoknadState
}                                          from 'app/containers/pleiepenger/PeriodeinfoPaneler';
import intlHelper                          from 'app/utils/intlUtils';
import * as React                          from 'react';
import {IntlShape}                         from 'react-intl';
import {PeriodeinfoV2} from "../../models/types/PeriodeInfoV2";
import {IOppholdsLand} from "../../models/types/PSBSoknad";
import {CountrySelect} from "../../components/country-select/CountrySelect";


export function pfLand(path: string): PeriodeinfoComponent<IOppholdsLand> {

    return (
        periodeinfo: PeriodeinfoV2<IOppholdsLand>,
        periodeindex: number,
        updatePeriodeinfoInSoknad: UpdatePeriodeinfoInSoknad<IOppholdsLand>,
        updatePeriodeinfoInSoknadState: UpdatePeriodeinfoInSoknadState<IOppholdsLand>,
        feilprefiks: string,
        getErrorMessage: GetErrorMessage,
        intl: IntlShape,
    ) => {

        return <div className="countryselect">
            <CountrySelect
                label={intlHelper(intl, `skjema.${path}.land`)}
                value={periodeinfo.land || ''}
                onChange={event => updatePeriodeinfoInSoknadState({land: event.target.value}, false)}
                onBlur={event => updatePeriodeinfoInSoknad({land: event.target.value})}
                feil={getErrorMessage(`${feilprefiks}.land`)}

            />
        </div>;
    };
}
