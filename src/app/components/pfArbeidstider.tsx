import React from 'react';
import { useIntl } from 'react-intl';

import { HelpText, TextField } from '@navikt/ds-react';

import { periodeSpenn } from 'app/components/skjema/skjemaUtils';
import {
    PeriodeinfoComponent,
    UpdatePeriodeinfoInSoknad,
    UpdatePeriodeinfoInSoknadState,
} from 'app/components/periode-info-paneler/PeriodeinfoPaneler';
import { GetErrorMessage } from 'app/models/types';
import intlHelper from 'app/utils/intlUtils';

import UtregningArbeidstid from './timefoering/UtregningArbeidstidDesimaler';
import { IArbeidstidPeriodeMedTimer } from '../models/types/Periode';
import { Periodeinfo } from '../models/types/Periodeinfo';

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
                <div className="flex flex-wrap">
                    <div className="input-row">
                        <TextField
                            label={intlHelper(intl, 'skjema.arbeid.arbeidstaker.timernormalt')}
                            className="w-12"
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
                            error={getErrorMessage(`${feilprefiks}.perioder[${feltindeks}].jobberNormaltTimerPerDag`)}
                        />
                        <HelpText className="arbeidstid-hjelpetext" placement="right" tabIndex={-1}>
                            {intlHelper(intl, 'skjema.arbeidstid.hjelpetekst.normaletimer')}
                        </HelpText>
                        <TextField
                            label={intlHelper(intl, 'skjema.arbeid.arbeidstaker.timerfaktisk')}
                            value={faktiskArbeidTimerPerDag}
                            className="right w-12"
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
                            error={getErrorMessage(`${feilprefiks}.perioder[${feltindeks}].faktiskArbeidTimerPerDag`)}
                        />
                        <HelpText className="arbeidstid-hjelpetext" placement="right" tabIndex={-1}>
                            {intlHelper(intl, 'skjema.arbeidstid.hjelpetekst.faktisketimer')}
                        </HelpText>
                    </div>
                </div>
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
