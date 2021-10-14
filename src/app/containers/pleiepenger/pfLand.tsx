import {
    PeriodeinfoComponent,
    UpdatePeriodeinfoInSoknad,
    UpdatePeriodeinfoInSoknadState,
} from 'app/containers/pleiepenger/PeriodeinfoPaneler';
import intlHelper from 'app/utils/intlUtils';
import * as React from 'react';
import { IntlShape } from 'react-intl';
import { GetErrorMessage } from 'app/models/types';
import { Periodeinfo } from '../../models/types/Periodeinfo';
import { IOppholdsLand } from '../../models/types/PSBSoknad';
import { CountrySelect } from '../../components/country-select/CountrySelect';

// eslint-disable-next-line import/prefer-default-export
export function pfLand(): PeriodeinfoComponent<IOppholdsLand> {
    return (
        periodeinfo: Periodeinfo<IOppholdsLand>,
        periodeindex: number,
        updatePeriodeinfoInSoknad: UpdatePeriodeinfoInSoknad<IOppholdsLand>,
        updatePeriodeinfoInSoknadState: UpdatePeriodeinfoInSoknadState<IOppholdsLand>,
        feilprefiks: string,
        getErrorMessage: GetErrorMessage,
        intl: IntlShape
    ) => {
        const { land } = periodeinfo;
        return (
            <div className="countryselect">
                <CountrySelect
                    label={intlHelper(intl, 'skjema.utenlandsopphold.land')}
                    unselectedoption="Velg land"
                    selectedcountry={land || ''}
                    onChange={(event) => {
                        updatePeriodeinfoInSoknadState({ land: event.target.value }, false);
                        updatePeriodeinfoInSoknad({ land: event.target.value });
                    }}
                    onBlur={(event) => updatePeriodeinfoInSoknad({ land: event.target.value })}
                    feil={getErrorMessage(`${feilprefiks}.land`)}
                />
            </div>
        );
    };
}
