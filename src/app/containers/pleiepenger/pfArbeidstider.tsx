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
import { PopoverOrientering } from 'nav-frontend-popover';
import Hjelpetekst from 'nav-frontend-hjelpetekst';
import { IArbeidstidPeriodeMedTimer } from '../../models/types/Periode';
import { Periodeinfo } from '../../models/types/Periodeinfo';

export function pfArbeidstider(): PeriodeinfoComponent<IArbeidstidPeriodeMedTimer> {
    return (
        periodeinfo: Periodeinfo<IArbeidstidPeriodeMedTimer>,
        periodeindex: number,
        updatePeriodeinfoInSoknad: UpdatePeriodeinfoInSoknad<IArbeidstidPeriodeMedTimer>,
        updatePeriodeinfoInSoknadState: UpdatePeriodeinfoInSoknadState<IArbeidstidPeriodeMedTimer>,
        feilprefiks: string,
        getErrorMessage: GetErrorMessage,
        intl: IntlShape
    ) => (
            <div className="arbeidstider">
                <Row noGutters>
                    <div className="input-row">
                        <Input
                            label={intlHelper(intl, 'skjema.arbeid.arbeidstaker.timernormalt')}
                            bredde="XS"
                            value={periodeinfo.jobberNormaltTimerPerDag}
                            onChange={(event) => {
                                updatePeriodeinfoInSoknadState({
                                    jobberNormaltTimerPerDag: event.target.value,
                                });
                            }}
                            onBlur={(event) => {
                                updatePeriodeinfoInSoknad({
                                    jobberNormaltTimerPerDag: event.target.value,
                                });
                            }}
                            onFocus={(event) => (event.target.selectionStart = 0)}
                        />
                        <Hjelpetekst className="arbeidstid-hjelpetext" type={PopoverOrientering.Hoyre} tabIndex={-1}>
                            {intlHelper(intl, 'skjema.arbeidstid.hjelpetekst.normaletimer')}
                        </Hjelpetekst>
                        <Input
                            label={intlHelper(intl, 'skjema.arbeid.arbeidstaker.timerfaktisk')}
                            value={periodeinfo.faktiskArbeidTimerPerDag}
                            className="right"
                            onChange={(event) => {
                                updatePeriodeinfoInSoknadState({
                                    faktiskArbeidTimerPerDag: event.target.value,
                                });
                            }}
                            onBlur={(event) => {
                                updatePeriodeinfoInSoknad({
                                    faktiskArbeidTimerPerDag: event.target.value,
                                });
                            }}
                            onFocus={(event) => (event.target.selectionStart = 0)}
                            feil={getErrorMessage(`${feilprefiks}.timerfaktisk`)}
                            bredde="XS"
                        />
                        <Hjelpetekst className="arbeidstid-hjelpetext" type={PopoverOrientering.Hoyre} tabIndex={-1}>
                            {intlHelper(intl, 'skjema.arbeidstid.hjelpetekst.faktisketimer')}
                        </Hjelpetekst>
                    </div>
                </Row>
            </div>
        );
}
