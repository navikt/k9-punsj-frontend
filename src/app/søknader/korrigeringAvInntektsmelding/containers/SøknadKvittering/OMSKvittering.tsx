import React from 'react';

import { FormattedMessage } from 'react-intl';
import { BodyShort, Heading } from '@navikt/ds-react';

import { IPeriode } from 'app/models/types';
import { initializeDate } from 'app/utils';
import { KorrigeringAvInntektsmeldingFormValues } from '../../types/KorrigeringAvInntektsmeldingFormFieldsValues';

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
        <>
            <div className="mb-4">
                <Heading size="small" level="3">
                    <FormattedMessage id="skjema.opplysningeromkorrigering" />
                </Heading>

                <div className="h-px bg-gray-300 mb-4" />

                <BodyShort size="small">
                    <FormattedMessage
                        id="skjema.kvittering.mottakelsesdato"
                        values={{
                            mottakelsesdato,
                            b: (chunks) => <strong>{chunks}</strong>,
                        }}
                    />
                </BodyShort>
            </div>

            <div className="mb-4">
                <Heading size="small" level="3">
                    <FormattedMessage id="skjema.kvittering.oppsummering.virksomhet" />
                </Heading>

                <div className="h-px bg-gray-300 mb-4" />

                <BodyShort size="small">
                    <FormattedMessage
                        id="skjema.kvittering.oppsummering.organisasjonsnummer"
                        values={{
                            organisasjonsnummer: Virksomhet,
                            b: (chunks) => <strong>{chunks}</strong>,
                        }}
                    />
                </BodyShort>
            </div>

            {ArbeidsforholdId && (
                <div className="mb-4">
                    <Heading size="small" level="3">
                        <FormattedMessage id="skjema.kvittering.oppsummering.arbeidsforholdId" />
                    </Heading>

                    <div className="h-px bg-gray-300 mb-4" />

                    <BodyShort size="small">{ArbeidsforholdId}</BodyShort>
                </div>
            )}

            {visTrekkperioder() && (
                <div className="mb-4">
                    <Heading size="small" level="3">
                        <FormattedMessage id="skjema.kvittering.oppsummering.omskorrigering.trekkKravPerioder.tittel" />
                    </Heading>

                    <div className="h-px bg-gray-300 mb-4" />

                    <BodyShort size="small">
                        {Trekkperioder.map((trekkperiode) => formaterPerioder(trekkperiode)).join(', ')}
                    </BodyShort>
                </div>
            )}

            {visPerioderMedRefusjonskrav() && (
                <div className="mb-4">
                    <Heading size="small" level="3">
                        <FormattedMessage id="skjema.kvittering.oppsummering.omskorrigering.heleDagerMedFrvær.tittel" />
                    </Heading>

                    <div className="h-px bg-gray-300 mb-4" />

                    <BodyShort size="small">
                        {PerioderMedRefusjonskrav.map((periodeMedRefusjonskrav) =>
                            formaterPerioder(periodeMedRefusjonskrav),
                        ).join(', ')}
                    </BodyShort>
                </div>
            )}

            {visDagerMedDelvisFravær() && (
                <div>
                    <Heading size="small" level="3">
                        <FormattedMessage id="skjema.kvittering.oppsummering.omskorrigering.delDagerMedFrvær.tittel" />
                    </Heading>

                    <div className="h-px bg-gray-300 mb-4" />

                    <BodyShort size="small">
                        {DagerMedDelvisFravær.filter(
                            (dagMedDelvisFravær) => dagMedDelvisFravær.dato && dagMedDelvisFravær.timer,
                        )
                            .map((dagMedDelvisFravær) => {
                                const dag = initializeDate(dagMedDelvisFravær.dato).format('DD.MM.YYYY');
                                return `${dag} - ${dagMedDelvisFravær.timer} timer`;
                            })
                            .join(', ')}
                    </BodyShort>
                </div>
            )}
        </>
    );
};

export default OMSKvittering;
