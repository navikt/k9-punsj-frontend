import { Input } from 'nav-frontend-skjema';
import * as React from 'react';
import { Row } from 'react-bootstrap';
import { useIntl } from 'react-intl';

import { HelpText } from '@navikt/ds-react';

import { periodeSpenn } from 'app/components/skjema/skjemaUtils';
import {
    PeriodeinfoComponent,
    UpdatePeriodeinfoInSoknad,
    UpdatePeriodeinfoInSoknadState,
} from 'app/containers/pleiepenger/PeriodeinfoPaneler';
import { GetErrorMessage } from 'app/models/types';
import intlHelper from 'app/utils/intlUtils';

import UtregningArbeidstid from '../../components/timefoering/UtregningArbeidstidDesimaler';
import { IArbeidstidPeriodeMedTimer } from '../../models/types/Periode';
import { Periodeinfo } from '../../models/types/Periodeinfo';

// eslint-disable-next-line import/prefer-default-export
export function pfArbeidstider(): PeriodeinfoComponent<IArbeidstidPeriodeMedTimer> {
    return (
        periodeinfo: Periodeinfo<IArbeidstidPeriodeMedTimer>,
        periodeindex: number,
        updatePeriodeinfoInSoknad: UpdatePeriodeinfoInSoknad<IArbeidstidPeriodeMedTimer>,
        updatePeriodeinfoInSoknadState: UpdatePeriodeinfoInSoknadState<IArbeidstidPeriodeMedTimer>,
        feilprefiks: string,
        getErrorMessage: GetErrorMessage,
    ) => {
        const intl = useIntl();
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
                        <HelpText className="arbeidstid-hjelpetext" placement="right" tabIndex={-1}>
                            {intlHelper(intl, 'skjema.arbeidstid.hjelpetekst.normaletimer')}
                        </HelpText>
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
                        <HelpText className="arbeidstid-hjelpetext" placement="right" tabIndex={-1}>
                            {intlHelper(intl, 'skjema.arbeidstid.hjelpetekst.faktisketimer')}
                        </HelpText>
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
