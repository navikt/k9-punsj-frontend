import {
    GetErrorMessage,
    PeriodeinfoComponent,
    UpdatePeriodeinfoInSoknad,
    UpdatePeriodeinfoInSoknadState,
} from 'app/containers/pleiepenger/PeriodeinfoPaneler';
import intlHelper from 'app/utils/intlUtils';
import * as React from 'react';
import { IntlShape } from 'react-intl';
import { Input } from 'nav-frontend-skjema';
import { Row } from 'react-bootstrap';
import { Periodeinfo } from '../../models/types/Periodeinfo';
import { IPeriodeMedTimerMinutter } from '../../models/types/Periode';
import { stringToNumber } from '../../utils';

// eslint-disable-next-line import/prefer-default-export
export function pfTimerMinutter(): PeriodeinfoComponent<IPeriodeMedTimerMinutter> {
    return (
        periodeinfo: Periodeinfo<IPeriodeMedTimerMinutter>,
        periodeindex: number,
        updatePeriodeinfoInSoknad: UpdatePeriodeinfoInSoknad<IPeriodeMedTimerMinutter>,
        updatePeriodeinfoInSoknadState: UpdatePeriodeinfoInSoknadState<IPeriodeMedTimerMinutter>,
        feilprefiks: string,
        getErrorMessage: GetErrorMessage,
        intl: IntlShape
    ) => {
        const { timer, minutter } = periodeinfo;
        return (
            <div className="timerminutter">
                <Row noGutters>
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
                                    timer: stringToNumber(event.target.value.replace(/ /g, '')),
                                    minutter: periodeinfo.minutter,
                                })
                            }
                            onBlur={(event) =>
                                updatePeriodeinfoInSoknad({
                                    ...periodeinfo,
                                    timer: stringToNumber(event.target.value.replace(/ /g, '')),
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
                                    minutter: stringToNumber(event.target.value.replace(/ /g, '')),
                                })
                            }
                            onBlur={(event) =>
                                updatePeriodeinfoInSoknad({
                                    ...periodeinfo,
                                    timer: periodeinfo.timer,
                                    minutter: stringToNumber(event.target.value.replace(/ /g, '')),
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
