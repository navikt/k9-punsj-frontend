import React from 'react';

import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
import { Heading } from '@navikt/ds-react';
import { IPeriode } from 'app/models/types';
import { initializeDate } from 'app/utils';
import { KorrigeringAvInntektsmeldingFormValues } from '../../types/KorrigeringAvInntektsmeldingFormFieldsValues';

import './omsKvittering.less';

const formaterPerioder = (periode: IPeriode) => {
    const fom = initializeDate(periode.fom).format('DD.MM.YYYY');
    const tom = initializeDate(periode.tom).format('DD.MM.YYYY');
    return `${fom} - ${tom}`;
};

interface Props {
    feltverdier: KorrigeringAvInntektsmeldingFormValues;
}

const OMSKvittering: React.FC<Props> = ({ feltverdier }: Props) => {
    const {
        Virksomhet,
        ArbeidsforholdId,
        Trekkperioder,
        PerioderMedRefusjonskrav,
        DagerMedDelvisFravær,
        OpplysningerOmKorrigering,
    } = feltverdier;

    const visTrekkperioder = () => Trekkperioder.length > 0 && Trekkperioder[0].fom;
    const visPerioderMedRefusjonskrav = () => PerioderMedRefusjonskrav.length > 0 && PerioderMedRefusjonskrav[0].fom;
    const visDagerMedDelvisFravær = () => DagerMedDelvisFravær.length > 0 && DagerMedDelvisFravær[0].dato;

    const mottakelsesdato = initializeDate(OpplysningerOmKorrigering.dato).format('DD.MM.YYYY');

    return (
        <div className="omsKvittering">
            <Heading size="medium" level="2">
                <FormattedMessage id="skjema.kvittering.oppsummering" />
            </Heading>

            <div className="mt-4">
                <Heading size="small" level="3">
                    <FormattedMessage id="skjema.opplysningeromkorrigering" />
                </Heading>

                <hr className={classNames('linje')} />

                <p>
                    <FormattedMessage
                        id="skjema.kvittering.mottakelsesdato"
                        values={{
                            mottakelsesdato,
                            b: (chunks) => <strong>{chunks}</strong>,
                        }}
                    />
                </p>

                <Heading size="small" level="3">
                    <FormattedMessage id="skjema.kvittering.oppsummering.virksomhet" />
                </Heading>

                <hr className={classNames('linje')} />

                <p>
                    <FormattedMessage
                        id="skjema.kvittering.oppsummering.organisasjonsnummer"
                        values={{
                            organisasjonsnummer: Virksomhet,
                            b: (chunks) => <strong>{chunks}</strong>,
                        }}
                    />
                </p>

                {ArbeidsforholdId && (
                    <>
                        <Heading size="small" level="3">
                            <FormattedMessage id="skjema.kvittering.oppsummering.arbeidsforholdId" />
                        </Heading>

                        <hr className={classNames('linje')} />

                        <p>{ArbeidsforholdId}</p>
                    </>
                )}

                {visTrekkperioder() && (
                    <>
                        <Heading size="small" level="3">
                            <FormattedMessage id="skjema.kvittering.oppsummering.omskorrigering.trekkKravPerioder.tittel" />
                        </Heading>

                        <hr className={classNames('linje')} />

                        <p>{Trekkperioder.map((trekkperiode) => formaterPerioder(trekkperiode)).join(', ')}</p>
                    </>
                )}

                {visPerioderMedRefusjonskrav() && (
                    <>
                        <Heading size="small" level="3">
                            <FormattedMessage id="skjema.kvittering.oppsummering.omskorrigering.heleDagerMedFrvær.tittel" />
                        </Heading>

                        <hr className={classNames('linje')} />

                        <p>
                            {PerioderMedRefusjonskrav.map((periodeMedRefusjonskrav) =>
                                formaterPerioder(periodeMedRefusjonskrav),
                            ).join(', ')}
                        </p>
                    </>
                )}

                {visDagerMedDelvisFravær() && (
                    <>
                        <Heading size="small" level="3">
                            <FormattedMessage id="skjema.kvittering.oppsummering.omskorrigering.delDagerMedFrvær.tittel" />
                        </Heading>

                        <hr className={classNames('linje')} />

                        <p>
                            {DagerMedDelvisFravær.filter(
                                (dagMedDelvisFravær) => dagMedDelvisFravær.dato && dagMedDelvisFravær.timer,
                            )
                                .map((dagMedDelvisFravær) => {
                                    const dag = initializeDate(dagMedDelvisFravær.dato).format('DD.MM.YYYY');
                                    return `${dag} - ${dagMedDelvisFravær.timer} timer`;
                                })
                                .join(', ')}
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default OMSKvittering;
