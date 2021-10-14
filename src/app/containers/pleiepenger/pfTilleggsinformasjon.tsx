import { periodeSpenn } from 'app/components/skjema/skjemaUtils';
import {
    PeriodeinfoComponent,
    UpdatePeriodeinfoInSoknad,
    UpdatePeriodeinfoInSoknadState,
} from 'app/containers/pleiepenger/PeriodeinfoPaneler';
import intlHelper from 'app/utils/intlUtils';
import { Textarea } from 'nav-frontend-skjema';
import * as React from 'react';
import { IntlShape } from 'react-intl';
import { Periodeinfo } from '../../models/types/Periodeinfo';
import { ITilleggsinformasjon, GetErrorMessage } from '../../models/types';

// eslint-disable-next-line import/prefer-default-export
export function pfTilleggsinformasjon(path: string): PeriodeinfoComponent<ITilleggsinformasjon> {
    return (
        periodeinfo: Periodeinfo<ITilleggsinformasjon>,
        periodeindex: number,
        updatePeriodeinfoInSoknad: UpdatePeriodeinfoInSoknad<ITilleggsinformasjon>,
        updatePeriodeinfoInSoknadState: UpdatePeriodeinfoInSoknadState<ITilleggsinformasjon>,
        feilprefiks: string,
        getErrorMessage: GetErrorMessage,
        intl: IntlShape
    ) => {
        const { tilleggsinformasjon, periode } = periodeinfo;
        const feltindeks = periodeSpenn(periode);
        return (
            <div className="tilleggsinfo">
                <Textarea
                    label={intlHelper(intl, `skjema.${path}.tilleggsinfo`)}
                    value={tilleggsinformasjon || ''}
                    onChange={(event) => {
                        updatePeriodeinfoInSoknadState({ tilleggsinformasjon: event.target.value }, false);
                        updatePeriodeinfoInSoknad({
                            tilleggsinformasjon: event.target.value,
                        });
                    }}
                    onBlur={(event) =>
                        updatePeriodeinfoInSoknad({
                            tilleggsinformasjon: event.target.value,
                        })
                    }
                    feil={getErrorMessage(`${feilprefiks}.perioder[${feltindeks}].tilleggsinformasjon`)}
                />
            </div>
        );
    };
}
