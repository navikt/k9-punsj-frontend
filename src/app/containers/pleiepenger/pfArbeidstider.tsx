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
import {IArbeidstidPeriodeMedTimer} from "../../models/types/PeriodeV2";
import {Input} from "nav-frontend-skjema";
import {Row} from "react-bootstrap";


export function pfArbeidstider(): PeriodeinfoComponent<IArbeidstidPeriodeMedTimer> {

    return (
        periodeinfo: PeriodeinfoV2<IArbeidstidPeriodeMedTimer>,
        periodeindex: number,
        updatePeriodeinfoInSoknad: UpdatePeriodeinfoInSoknad<IArbeidstidPeriodeMedTimer>,
        updatePeriodeinfoInSoknadState: UpdatePeriodeinfoInSoknadState<IArbeidstidPeriodeMedTimer>,
        feilprefiks: string,
        getErrorMessage: GetErrorMessage,
        intl: IntlShape,
    ) => {

        return <div className="arbeidstider">
            <Row noGutters={true}>
                <div className={"input-row"}>
                    <Input
                        label={intlHelper(intl, 'skjema.arbeid.arbeidstaker.timernormalt')}
                        bredde={"XS"}
                        value={periodeinfo.jobberNormaltTimerPerDag}
                        onChange={event => {
                            updatePeriodeinfoInSoknadState({jobberNormaltTimerPerDag: event.target.value});
                        }}
                        onBlur={event => {
                            updatePeriodeinfoInSoknad({jobberNormaltTimerPerDag: event.target.value});
                        }}
                        onFocus={event => event.target.selectionStart = 0}
                    />
                    <Input
                        label={intlHelper(intl, 'skjema.arbeid.arbeidstaker.timerfaktisk')}
                        value={periodeinfo.faktiskArbeidTimerPerDag}
                        className="right"
                        onChange={event => {
                            updatePeriodeinfoInSoknadState({faktiskArbeidTimerPerDag: event.target.value});
                        }}
                        onBlur={event => {
                            updatePeriodeinfoInSoknad({faktiskArbeidTimerPerDag: (event.target.value)});
                        }}
                        onFocus={event => event.target.selectionStart = 0}
                        feil={getErrorMessage(`${feilprefiks}.timerfaktisk`)}
                        bredde={"XS"}
                    />
                </div>
            </Row>
        </div>;
    };
}
