import React from 'react';

import { Textarea } from '@navikt/ds-react';
import {
    PeriodeinfoComponent,
    UpdatePeriodeinfoInSoknad,
    UpdatePeriodeinfoInSoknadState,
} from 'app/components/periodeinfoPaneler/PeriodeinfoPaneler';
import { periodeSpenn } from 'app/components/skjema/skjemaUtils';
import { GetErrorMessage, ITilleggsinformasjon } from 'app/models/types';
import { Periodeinfo } from 'app/models/types/Periodeinfo';
import intlHelper from 'app/utils/intlUtils';
import { IntlShape } from 'react-intl';

export function pfTilleggsinformasjon(path: string): PeriodeinfoComponent<ITilleggsinformasjon> {
    return (
        periodeinfo: Periodeinfo<ITilleggsinformasjon>,
        periodeindex: number,
        updatePeriodeinfoInSoknad: UpdatePeriodeinfoInSoknad<ITilleggsinformasjon>,
        updatePeriodeinfoInSoknadState: UpdatePeriodeinfoInSoknadState<ITilleggsinformasjon>,
        feilprefiks?: string,
        getErrorMessage?: GetErrorMessage,
        intl?: IntlShape,
    ) => {
        const { tilleggsinformasjon, periode } = periodeinfo;
        const feltindeks = periodeSpenn(periode);
        return (
            <div className="tilleggsinfo">
                <Textarea
                    label={intlHelper(intl!, `skjema.${path}.tilleggsinfo`)}
                    value={tilleggsinformasjon || ''}
                    onChange={(event) => {
                        updatePeriodeinfoInSoknadState({ tilleggsinformasjon: event.target.value }, false);
                    }}
                    onBlur={(event) =>
                        updatePeriodeinfoInSoknad({
                            tilleggsinformasjon: event.target.value,
                        })
                    }
                    error={getErrorMessage?.(`${feilprefiks}.perioder[${feltindeks}].tilleggsinformasjon`)}
                />
            </div>
        );
    };
}
