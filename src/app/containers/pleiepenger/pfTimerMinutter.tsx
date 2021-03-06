import {
    GetErrorMessage,
    PeriodeinfoComponent,
    UpdatePeriodeinfoInSoknad,
    UpdatePeriodeinfoInSoknadState
}                                          from 'app/containers/pleiepenger/PeriodeinfoPaneler';
import intlHelper                          from 'app/utils/intlUtils';
import * as React                          from 'react';
import {IntlShape}                         from 'react-intl';
import {Periodeinfo} from "../../models/types/Periodeinfo";
import {IPeriodeMedTimerMinutter} from "../../models/types/Periode";
import {Input} from "nav-frontend-skjema";
import {Row} from "react-bootstrap";
import {stringToNumber} from "../../utils";


export function pfTimerMinutter(): PeriodeinfoComponent<IPeriodeMedTimerMinutter> {

    return (
        periodeinfo: Periodeinfo<IPeriodeMedTimerMinutter>,
        periodeindex: number,
        updatePeriodeinfoInSoknad: UpdatePeriodeinfoInSoknad<IPeriodeMedTimerMinutter>,
        updatePeriodeinfoInSoknadState: UpdatePeriodeinfoInSoknadState<IPeriodeMedTimerMinutter>,
        feilprefiks: string,
        getErrorMessage: GetErrorMessage,
        intl: IntlShape,
    ) => {

        return <div className="timerminutter">
            <Row noGutters={true}>
                <p>{intlHelper(intl, "skjema.omsorgstilbud.gjennomsnittlig")}</p>
                <div className={"input-row"}>
                    <Input
                        label={intlHelper(intl, 'skjema.perioder.timer')}
                        value={periodeinfo.timer}
                        bredde={"XS"}
                        className="timer"
                        onChange={event => updatePeriodeinfoInSoknadState({
                            ...periodeinfo,
                            timer: stringToNumber(event.target.value),
                            minutter: periodeinfo.minutter
                        })}
                        onBlur={event => updatePeriodeinfoInSoknad({
                            ...periodeinfo,
                            timer: stringToNumber(event.target.value),
                            minutter: periodeinfo.minutter
                        })}
                        feil={getErrorMessage(`${feilprefiks}.timer`)}
                    />
                    <Input
                        label={intlHelper(intl, 'skjema.perioder.minutter')}
                        value={periodeinfo.minutter}
                        bredde={"XS"}
                        className="right"
                        onChange={(event) => updatePeriodeinfoInSoknadState({
                            ...periodeinfo,
                            timer: periodeinfo.timer,
                            minutter: stringToNumber(event.target.value)
                        })}
                        onBlur={event => updatePeriodeinfoInSoknad({...periodeinfo,
                            timer: periodeinfo.timer,
                            minutter: stringToNumber(event.target.value)
                        })}
                        feil={getErrorMessage(`${feilprefiks}.minutter`)}
                    />
                </div>
            </Row>
        </div>;
    };
}
