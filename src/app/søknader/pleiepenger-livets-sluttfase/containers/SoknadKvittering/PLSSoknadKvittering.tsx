import React from 'react';

import { BodyShort, Heading, VStack } from '@navikt/ds-react';
import { FormattedMessage, useIntl } from 'react-intl';

import { PunchFormPaneler } from '../../../../models/enums/PunchFormPaneler';
import {
    formatDato,
    formattereDatoFraUTCTilGMT,
    formattereTidspunktFraUTCTilGMT,
    periodToFormattedString,
    sjekkPropertyEksistererOgIkkeErNull,
} from '../../../../utils';
import { IPLSSoknadKvittering } from '../../types/IPLSSoknadKvittering';
import VisningAvPerioderSNSoknadKvittering from 'app/components/soknadKvittering/VisningAvPerioderSNSoknadKvittering';
import VisningAvPerioderSoknadKvittering from 'app/components/soknadKvittering/VisningAvPerioderSoknadKvittering';
import {
    endreLandkodeTilLandnavnIPerioder,
    formattereTimerForArbeidstakerPerioder,
    genererIkkeSkalHaFerie,
    genererSkalHaFerie,
    sjekkHvisPerioderEksisterer,
} from 'app/utils/soknadKvitteringUtils';

interface Props {
    response: IPLSSoknadKvittering;
}

const PLSSoknadKvittering: React.FC<Props> = ({ response }: Props) => {
    const intl = useIntl();

    const { ytelse, journalposter } = response;

    const skalHaferieListe = genererSkalHaFerie(ytelse.lovbestemtFerie.perioder);
    const skalIkkeHaFerieListe = genererIkkeSkalHaFerie(ytelse.lovbestemtFerie.perioder);
    const visSoknadsperiode =
        sjekkPropertyEksistererOgIkkeErNull('søknadsperiode', ytelse) && ytelse.søknadsperiode.length > 0;
    const visTrukkedePerioder =
        sjekkPropertyEksistererOgIkkeErNull('trekkKravPerioder', ytelse) && ytelse.trekkKravPerioder.length > 0;
    const visBegrunnelseForInnsending =
        sjekkPropertyEksistererOgIkkeErNull('begrunnelseForInnsending', response) &&
        response.begrunnelseForInnsending.tekst;
    const visOpplysningerOmSoknad = sjekkPropertyEksistererOgIkkeErNull('mottattDato', response);
    const visUtenlandsopphold = sjekkHvisPerioderEksisterer('utenlandsopphold', ytelse);
    const visFerie = sjekkHvisPerioderEksisterer('lovbestemtFerie', ytelse) && Object.keys(skalHaferieListe).length > 0;
    const visFerieSomSkalSlettes =
        sjekkHvisPerioderEksisterer('lovbestemtFerie', ytelse) && Object.keys(skalIkkeHaFerieListe).length > 0;
    const visArbeidsforhold =
        sjekkPropertyEksistererOgIkkeErNull('arbeidstakerList', ytelse.arbeidstid) &&
        ytelse.arbeidstid?.arbeidstakerList.length > 0;
    const visSelvstendigNæringsdrivendeInfo =
        ytelse.arbeidstid.selvstendigNæringsdrivendeArbeidstidInfo !== null ||
        sjekkPropertyEksistererOgIkkeErNull('selvstendigNæringsdrivende', ytelse.opptjeningAktivitet);
    const visFrilanserArbeidstidInfo =
        ytelse.arbeidstid.frilanserArbeidstidInfo !== null ||
        sjekkPropertyEksistererOgIkkeErNull('frilanser', ytelse.opptjeningAktivitet);
    const visMedlemskap = sjekkHvisPerioderEksisterer('bosteder', ytelse);
    const formaterSøknadsperioder = () =>
        ytelse.søknadsperiode.map((periode) => periodToFormattedString(periode)).join(', ');
    const mottakelsesdato = `${formattereDatoFraUTCTilGMT(response.mottattDato)} - ${formattereTidspunktFraUTCTilGMT(
        response.mottattDato,
    )}`;
    const inneholderMedisinskeOpplysninger =
        journalposter && journalposter[0].inneholderMedisinskeOpplysninger ? 'Ja' : 'Nei';
    const inneholderInformasjonSomIkkeKanPunsjes =
        journalposter && journalposter[0].inneholderInformasjonSomIkkeKanPunsjes ? 'Ja' : 'Nei';

    return (
        <>
            {visSoknadsperiode && (
                <div data-testid="soknadsperiode" className="mb-4">
                    <Heading size="xsmall" level="3">
                        <FormattedMessage id="skjema.soknadskvittering.soknadsperiode" />
                    </Heading>

                    <div className="h-px bg-gray-300 mb-4" />

                    <BodyShort size="small">{formaterSøknadsperioder()}</BodyShort>
                </div>
            )}

            {visOpplysningerOmSoknad && (
                <div data-testid="opplysningerOmSoknad" className="mb-4">
                    <Heading size="xsmall" level="3">
                        <FormattedMessage id={PunchFormPaneler.OPPLYSINGER_OM_SOKNAD} />
                    </Heading>

                    <div className="h-px bg-gray-300 mb-4" />

                    <VStack gap="4">
                        <BodyShort size="small" data-testid="mottakelsesdato">
                            <FormattedMessage
                                id="skjema.kvittering.mottakelsesdato"
                                values={{
                                    mottakelsesdato,
                                    b: (chunks) => <strong>{chunks}</strong>,
                                }}
                            />
                        </BodyShort>

                        {visTrukkedePerioder && (
                            <BodyShort size="small" data-testid="perioderSomFjernet">
                                <FormattedMessage
                                    id="skjema.kvittering.perioderSomFjernet"
                                    values={{
                                        perioder: ytelse.trekkKravPerioder
                                            .map((periode) => periodToFormattedString(periode))
                                            .join(', '),
                                        b: (chunks) => <strong>{chunks}</strong>,
                                    }}
                                />
                            </BodyShort>
                        )}

                        {visBegrunnelseForInnsending && (
                            <BodyShort size="small" data-testid="begrunnelseForEndring">
                                <FormattedMessage
                                    id="skjema.kvittering.begrunnelseForEndring"
                                    values={{
                                        begrunnelse: response.begrunnelseForInnsending.tekst,
                                        b: (chunks) => <strong>{chunks}</strong>,
                                    }}
                                />
                            </BodyShort>
                        )}
                    </VStack>
                </div>
            )}

            {visUtenlandsopphold && (
                <div data-testid="utenlandsopphold" className="mb-4">
                    <Heading size="xsmall" level="3">
                        <FormattedMessage id={PunchFormPaneler.UTENLANDSOPPHOLD} />
                    </Heading>

                    <div className="h-px bg-gray-300 mb-4" />

                    <VisningAvPerioderSoknadKvittering
                        perioder={endreLandkodeTilLandnavnIPerioder(ytelse.utenlandsopphold?.perioder)}
                        tittel={['skjema.periode.overskrift', 'skjema.utenlandsopphold.land']}
                        properties={['land']}
                    />
                </div>
            )}

            {visFerie && (
                <div data-testid="ferie" className="mb-4">
                    <Heading size="xsmall" level="3">
                        <FormattedMessage id={PunchFormPaneler.FERIE} />
                    </Heading>

                    <div className="h-px bg-gray-300 mb-4" />

                    <VisningAvPerioderSoknadKvittering
                        perioder={skalHaferieListe}
                        tittel={['skjema.periode.overskrift']}
                    />
                </div>
            )}

            {visFerieSomSkalSlettes && (
                <div data-testid="ferieSomSkalSlettes" className="mb-4">
                    <Heading size="xsmall" level="3">
                        <FormattedMessage id="skjema.ferie.skalslettes" />
                    </Heading>

                    <div className="h-px bg-gray-300 mb-4" />

                    <VisningAvPerioderSoknadKvittering
                        perioder={skalIkkeHaFerieListe}
                        tittel={['skjema.periode.overskrift']}
                    />
                </div>
            )}

            {(visArbeidsforhold || visFrilanserArbeidstidInfo || visSelvstendigNæringsdrivendeInfo) && (
                <div data-testid="arbeid" className="mb-4">
                    <Heading size="xsmall" level="3">
                        <FormattedMessage id={PunchFormPaneler.ARBEID} />
                    </Heading>

                    <div className="h-px bg-gray-300 mb-4" />

                    {visArbeidsforhold && (
                        <div className="mt-4">
                            <Heading size="xsmall" level="3">
                                <FormattedMessage id="arbeidstaker" />
                            </Heading>

                            {ytelse.arbeidstid?.arbeidstakerList.map((arbeidstakerperiode, indeks) => {
                                const skalOrgNummerVises = arbeidstakerperiode.organisasjonsnummer !== null;
                                return (
                                    <div
                                        key={
                                            arbeidstakerperiode.organisasjonsnummer ||
                                            arbeidstakerperiode.norskIdentitetsnummer ||
                                            indeks
                                        }
                                    >
                                        <div className="mt-4 mb-4">
                                            <BodyShort size="small" data-testid="orgnummer">
                                                <FormattedMessage
                                                    id="skjema.kvittering.orgnummer"
                                                    values={{
                                                        orgnr: skalOrgNummerVises
                                                            ? arbeidstakerperiode.organisasjonsnummer
                                                            : arbeidstakerperiode.norskIdentitetsnummer,
                                                        b: (chunks) => <strong>{chunks}</strong>,
                                                    }}
                                                />
                                            </BodyShort>
                                        </div>

                                        <VisningAvPerioderSoknadKvittering
                                            perioder={formattereTimerForArbeidstakerPerioder(
                                                arbeidstakerperiode.arbeidstidInfo.perioder,
                                            )}
                                            tittel={[
                                                'skjema.periode.overskrift',
                                                'skjema.arbeid.arbeidstaker.timernormalt',
                                                'skjema.arbeid.arbeidstaker.timerfaktisk',
                                            ]}
                                            properties={['jobberNormaltTimerPerDag', 'faktiskArbeidTimerPerDag']}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {visFrilanserArbeidstidInfo && (
                        <div data-testid="frilanser" className="mb-4">
                            <Heading size="xsmall" level="3">
                                <FormattedMessage id="frilanser" />
                            </Heading>

                            {sjekkPropertyEksistererOgIkkeErNull('startdato', ytelse.opptjeningAktivitet.frilanser) &&
                                ytelse?.opptjeningAktivitet?.frilanser?.startdato &&
                                ytelse?.opptjeningAktivitet?.frilanser?.startdato?.length > 0 && (
                                    <p>
                                        <b>
                                            <FormattedMessage id="skjema.frilanserdato" />{' '}
                                        </b>
                                        {formatDato(ytelse.opptjeningAktivitet.frilanser?.startdato)}
                                    </p>
                                )}

                            {!ytelse.opptjeningAktivitet.frilanser?.jobberFortsattSomFrilans &&
                                sjekkPropertyEksistererOgIkkeErNull(
                                    'sluttdato',
                                    ytelse.opptjeningAktivitet.frilanser,
                                ) &&
                                ytelse.opptjeningAktivitet.frilanser?.sluttdato &&
                                ytelse.opptjeningAktivitet.frilanser?.sluttdato?.length > 0 && (
                                    <p>
                                        <b>
                                            <FormattedMessage id="skjema.frilanserdato.slutt" />{' '}
                                        </b>
                                        {formatDato(ytelse.opptjeningAktivitet.frilanser?.sluttdato)}
                                    </p>
                                )}

                            {ytelse.arbeidstid.frilanserArbeidstidInfo !== null && (
                                <VisningAvPerioderSoknadKvittering
                                    perioder={formattereTimerForArbeidstakerPerioder(
                                        ytelse.arbeidstid.frilanserArbeidstidInfo?.perioder,
                                    )}
                                    tittel={[
                                        'skjema.periode.overskrift',
                                        'skjema.arbeid.arbeidstaker.timernormalt',
                                        'skjema.arbeid.arbeidstaker.timerfaktisk',
                                    ]}
                                    properties={['jobberNormaltTimerPerDag', 'faktiskArbeidTimerPerDag']}
                                />
                            )}
                        </div>
                    )}

                    {visSelvstendigNæringsdrivendeInfo && (
                        <div data-testid="selvstendignæringsdrivende" className="mb-4">
                            <Heading size="xsmall" level="3">
                                <FormattedMessage id="selvstendig" />
                            </Heading>

                            {sjekkPropertyEksistererOgIkkeErNull(
                                'selvstendigNæringsdrivende',
                                ytelse.opptjeningAktivitet,
                            ) && (
                                <VisningAvPerioderSNSoknadKvittering
                                    intl={intl}
                                    perioder={ytelse.opptjeningAktivitet.selvstendigNæringsdrivende!}
                                />
                            )}

                            {ytelse.arbeidstid.selvstendigNæringsdrivendeArbeidstidInfo !== null && (
                                <VisningAvPerioderSoknadKvittering
                                    perioder={formattereTimerForArbeidstakerPerioder(
                                        ytelse.arbeidstid.selvstendigNæringsdrivendeArbeidstidInfo?.perioder,
                                    )}
                                    tittel={[
                                        'skjema.periode.overskrift',
                                        'skjema.arbeid.arbeidstaker.timernormalt',
                                        'skjema.arbeid.arbeidstaker.timerfaktisk',
                                    ]}
                                    properties={['jobberNormaltTimerPerDag', 'faktiskArbeidTimerPerDag']}
                                />
                            )}
                        </div>
                    )}
                </div>
            )}

            {visMedlemskap && (
                <div data-testid="medlemskap" className="mb-4">
                    <Heading size="xsmall" level="3">
                        <FormattedMessage id={PunchFormPaneler.MEDLEMSKAP} />
                    </Heading>

                    <div className="h-px bg-gray-300 mb-4" />

                    <VisningAvPerioderSoknadKvittering
                        perioder={endreLandkodeTilLandnavnIPerioder(ytelse.bosteder?.perioder)}
                        tittel={['skjema.periode.overskrift', 'skjema.utenlandsopphold.land']}
                        properties={['land']}
                    />
                </div>
            )}

            {!!journalposter && journalposter.length > 0 && (
                <div data-testid="tilleggsopplysninger">
                    <Heading size="small" level="3">
                        <FormattedMessage id="skjema.soknadskvittering.tilleggsopplysninger" />
                    </Heading>

                    <div className="h-px bg-gray-300 mb-4" />

                    <VStack gap="4">
                        <BodyShort size="small">
                            <FormattedMessage
                                id="skjema.kvittering.medisinskeopplysninger"
                                values={{
                                    jaNei: inneholderMedisinskeOpplysninger,
                                    b: (chunks) => <strong>{chunks}</strong>,
                                }}
                            />
                        </BodyShort>

                        <BodyShort size="small">
                            <FormattedMessage
                                id="skjema.kvittering.opplysningerikkepunsjet"
                                values={{
                                    jaNei: inneholderInformasjonSomIkkeKanPunsjes,
                                    b: (chunks) => <strong>{chunks}</strong>,
                                }}
                            />
                        </BodyShort>
                    </VStack>
                </div>
            )}
        </>
    );
};

export default PLSSoknadKvittering;
