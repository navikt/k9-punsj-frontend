import {
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
import { periodeSpenn } from 'app/components/skjema/skjemaUtils';
import { GetErrorMessage } from 'app/models/types';
import { IArbeidstidPeriodeMedTimer } from '../../models/types/Periode';
import { Periodeinfo } from '../../models/types/Periodeinfo';
import UtregningArbeidstid from './UtregningArbeidstid';

// eslint-disable-next-line import/prefer-default-export
export function pfArbeidstider(): PeriodeinfoComponent<IArbeidstidPeriodeMedTimer> {
    return (
        periodeinfo: Periodeinfo<IArbeidstidPeriodeMedTimer>,
        periodeindex: number,
        updatePeriodeinfoInSoknad: UpdatePeriodeinfoInSoknad<IArbeidstidPeriodeMedTimer>,
        updatePeriodeinfoInSoknadState: UpdatePeriodeinfoInSoknadState<IArbeidstidPeriodeMedTimer>,
        feilprefiks: string,
        getErrorMessage: GetErrorMessage,
        intl: IntlShape
    ) => {
        const { jobberNormaltTimerPerDag, faktiskArbeidTimerPerDag, periode } = periodeinfo;
        const feltindeks = periodeSpenn(periode);
        return (
            <div className="arbeidstider">
                <Row noGutters>
                    <div className="input-row">
                        <Input
                            label={intlHelper(intl, 'skjema.arbeid.arbeidstaker.timernormalt')}
                            bredde="XS"
                            value={jobberNormaltTimerPerDag}
                            onChange={(event) => {
                                updatePeriodeinfoInSoknadState({
                                    jobberNormaltTimerPerDag: event.target.value.replace(/\s/g, ''),
                                });
                            }}
                            onBlur={(event) => {
                                updatePeriodeinfoInSoknad({
                                    jobberNormaltTimerPerDag: event.target.value.replace(/\s/g, ''),
                                });
                            }}
                            feil={getErrorMessage(`${feilprefiks}.perioder[${feltindeks}].jobberNormaltTimerPerDag`)}
                        />
                        <Hjelpetekst className="arbeidstid-hjelpetext" type={PopoverOrientering.Hoyre} tabIndex={-1}>
                            {intlHelper(intl, 'skjema.arbeidstid.hjelpetekst.normaletimer')}
                        </Hjelpetekst>
                        <Input
                            label={intlHelper(intl, 'skjema.arbeid.arbeidstaker.timerfaktisk')}
                            value={faktiskArbeidTimerPerDag}
                            className="right"
                            onChange={(event) => {
                                updatePeriodeinfoInSoknadState({
                                    faktiskArbeidTimerPerDag: event.target.value.replace(/\s/g, ''),
                                });
                            }}
                            onBlur={(event) => {
                                updatePeriodeinfoInSoknad({
                                    faktiskArbeidTimerPerDag: event.target.value.replace(/\s/g, ''),
                                });
                            }}
                            feil={getErrorMessage(`${feilprefiks}.perioder[${feltindeks}].faktiskArbeidTimerPerDag`)}
                            bredde="XS"
                        />
                        <Hjelpetekst className="arbeidstid-hjelpetext" type={PopoverOrientering.Hoyre} tabIndex={-1}>
                            {intlHelper(intl, 'skjema.arbeidstid.hjelpetekst.faktisketimer')}
                        </Hjelpetekst>
                    </div>
                </Row>
                <div className="utregnetArbeidstid__container">
                    <div>
                        <UtregningArbeidstid arbeidstid={jobberNormaltTimerPerDag} />
                    </div>
                    <div>
                        <UtregningArbeidstid
                            arbeidstid={faktiskArbeidTimerPerDag}
                            normalArbeidstid={jobberNormaltTimerPerDag}
                        />
                    </div>
                </div>
            </div>
        );
    };
}
