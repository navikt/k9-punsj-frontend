import { Input } from 'nav-frontend-skjema';
import * as React from 'react';
import { IntlShape } from 'react-intl';

import Row from 'app/components/Row';
import {
    PeriodeinfoComponent,
    UpdatePeriodeinfoInSoknad,
    UpdatePeriodeinfoInSoknadState,
} from 'app/containers/pleiepenger/PeriodeinfoPaneler';
import { GetErrorMessage } from 'app/models/types';
import intlHelper from 'app/utils/intlUtils';

import { ITimerOgMinutter } from '../../models/types/Periode';
import { Periodeinfo } from '../../models/types/Periodeinfo';
import { stringToNumber } from '../../utils';

// eslint-disable-next-line import/prefer-default-export
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
                <Row>
                    <p>{intlHelper(intl, 'skjema.omsorgstilbud.gjennomsnittlig')}</p>
                    <div className="input-row">
                        <Input
                            label={intlHelper(intl, 'skjema.perioder.timer')}
                            value={timer}
                            bredde="XS"
                            className="timer"
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
                            feil={getErrorMessage(`${feilprefiks}.timer`)}
                        />
                        <Input
                            label={intlHelper(intl, 'skjema.perioder.minutter')}
                            value={minutter}
                            bredde="XS"
                            className="right"
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
                            feil={getErrorMessage(`${feilprefiks}.minutter`)}
                        />
                    </div>
                </Row>
            </div>
        );
    };
}
