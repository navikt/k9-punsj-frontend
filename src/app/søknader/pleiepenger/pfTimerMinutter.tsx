import * as React from 'react';
import { IntlShape } from 'react-intl';
import { TextField } from '@navikt/ds-react';

import {
    PeriodeinfoComponent,
    UpdatePeriodeinfoInSoknad,
    UpdatePeriodeinfoInSoknadState,
} from 'app/søknader/pleiepenger/PeriodeinfoPaneler';
import { GetErrorMessage } from 'app/models/types';
import intlHelper from 'app/utils/intlUtils';

import { ITimerOgMinutter } from '../../models/types/Periode';
import { Periodeinfo } from '../../models/types/Periodeinfo';
import { stringToNumber } from '../../utils';

export function pfTimerMinutter(): PeriodeinfoComponent<ITimerOgMinutter> {
    return (
        periodeinfo: Periodeinfo<ITimerOgMinutter>,
        periodeindex: number,
        updatePeriodeinfoInSoknad: UpdatePeriodeinfoInSoknad<ITimerOgMinutter>,
        updatePeriodeinfoInSoknadState: UpdatePeriodeinfoInSoknadState<ITimerOgMinutter>,
        feilprefiks: string,
        getErrorMessage: GetErrorMessage,
        intl: IntlShape,
    ) => {
        const { timer, minutter } = periodeinfo;
        return (
            <div className="timerminutter">
                <div className="flex flex-wrap">
                    <p>{intlHelper(intl, 'skjema.omsorgstilbud.gjennomsnittlig')}</p>
                    <div className="input-row">
                        <TextField
                            label={intlHelper(intl, 'skjema.perioder.timer')}
                            value={timer}
                            className="timer w-12"
                            onChange={(event) =>
                                updatePeriodeinfoInSoknadState({
                                    ...periodeinfo,
                                    timer: stringToNumber(event.target.value.replace(/\s/g, '')),
                                    minutter: periodeinfo.minutter,
                                })
                            }
                            onBlur={(event) =>
                                updatePeriodeinfoInSoknad({
                                    ...periodeinfo,
                                    timer: stringToNumber(event.target.value.replace(/\s/g, '')),
                                    minutter: periodeinfo.minutter,
                                })
                            }
                            error={getErrorMessage(`${feilprefiks}.timer`)}
                        />
                        <TextField
                            label={intlHelper(intl, 'skjema.perioder.minutter')}
                            value={minutter}
                            className="right w-12"
                            onChange={(event) =>
                                updatePeriodeinfoInSoknadState({
                                    ...periodeinfo,
                                    timer: periodeinfo.timer,
                                    minutter: stringToNumber(event.target.value.replace(/\s/g, '')),
                                })
                            }
                            onBlur={(event) =>
                                updatePeriodeinfoInSoknad({
                                    ...periodeinfo,
                                    timer: periodeinfo.timer,
                                    minutter: stringToNumber(event.target.value.replace(/\s/g, '')),
                                })
                            }
                            error={getErrorMessage(`${feilprefiks}.minutter`)}
                        />
                    </div>
                </div>
            </div>
        );
    };
}
