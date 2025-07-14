import React from 'react';

import { FormattedMessage, IntlShape, useIntl } from 'react-intl';
import { BodyShort, Heading, VStack } from '@navikt/ds-react';

import intlHelper from 'app/utils/intlUtils';
import VisningAvPerioderSNSoknadKvittering from 'app/components/soknadKvittering/VisningAvPerioderSNSoknadKvittering';
import VisningAvPerioderSoknadKvittering from 'app/components/soknadKvittering/VisningAvPerioderSoknadKvittering';
import { PunchFormPaneler } from 'app/models/enums/PunchFormPaneler';
import { IPSBSoknadKvittering } from 'app/models/types/PSBSoknadKvittering';
import {
    formatDato,
    formattereDatoFraUTCTilGMT,
    formattereTidspunktFraUTCTilGMT,
    periodToFormattedString,
    sjekkPropertyEksistererOgIkkeErNull,
} from 'app/utils';

import {
    endreLandkodeTilLandnavnIPerioder,
    formattereTimerForArbeidstakerPerioder,
    formattereTimerOgMinutterForOmsorgstilbudPerioder,
    genererIkkeSkalHaFerie,
    genererSkalHaFerie,
    sjekkHvisPerioderEksisterer,
} from '../../../../utils/soknadKvitteringUtils';
import { ISoknadKvitteringUtenlandsopphold } from 'app/models/types/KvitteringTyper';

interface Props {
    innsendtSøknad: IPSBSoknadKvittering;
}

const formaterUtenlandsopphold = (perioder: ISoknadKvitteringUtenlandsopphold, intl: IntlShape) => {
    const årsaker = [
        {
            label: intlHelper(intl, 'skjema.utenlandsopphold.årsak.norskOfftenligRegning'),
            value: 'barnetInnlagtIHelseinstitusjonForNorskOffentligRegning',
        },
        {
            label: intlHelper(intl, 'skjema.utenlandsopphold.årsak.trygdeavtaleMedAnnetLand'),
            value: 'barnetInnlagtIHelseinstitusjonDekketEtterAvtaleMedEtAnnetLandOmTrygd',
        },
        {
            label: intlHelper(intl, 'skjema.utenlandsopphold.årsak.søkerDekkerSelv'),
            value: 'barnetInnlagtIHelseinstitusjonDekketAvSøker',
        },
    ];
    const perioderUtenInnleggelse = Object.keys(perioder)
        .filter((key) => !perioder[key].årsak)
        .reduce((obj, key) => {
            obj[key] = perioder[key];
            return obj;
        }, {} as ISoknadKvitteringUtenlandsopphold);

    const perioderMedInnleggelse = Object.keys(perioder)
        .filter((key) => !!perioder[key].årsak)
        .reduce((obj, key) => {
            obj[key] = perioder[key];
            obj[key].årsak = årsaker.find((årsak) => årsak.value === obj[key].årsak)?.label;
            return obj;
        }, {} as ISoknadKvitteringUtenlandsopphold);

    return (
        <>
            <VisningAvPerioderSoknadKvittering
                perioder={endreLandkodeTilLandnavnIPerioder(perioderUtenInnleggelse)}
                tittel={['skjema.periode.overskrift', 'skjema.utenlandsopphold.land']}
                properties={['land']}
            />

            {Object.keys(perioderMedInnleggelse).length > 0 ? (
                <div className="marginTop24">
                    <VisningAvPerioderSoknadKvittering
                        perioder={endreLandkodeTilLandnavnIPerioder(perioderMedInnleggelse)}
                        tittel={[
                            'skjema.perioder.innleggelse.overskrift',
                            'skjema.utenlandsopphold.land',
                            'skjema.utenlandsopphold.utgifterTilInnleggelse',
                        ]}
                        properties={['land', 'årsak']}
                    />
                </div>
            ) : null}
        </>
    );
};

const PSBSoknadKvittering: React.FC<Props> = ({ innsendtSøknad }) => {
    const intl = useIntl();

    const { ytelse, begrunnelseForInnsending, mottattDato, journalposter } = innsendtSøknad;

    const skalHaferieListe = genererSkalHaFerie(ytelse.lovbestemtFerie.perioder);
    const skalIkkeHaFerieListe = genererIkkeSkalHaFerie(ytelse.lovbestemtFerie.perioder);
    const visSoknadsperiode =
        sjekkPropertyEksistererOgIkkeErNull('søknadsperiode', ytelse) && ytelse.søknadsperiode.length > 0;
    const visTrukkedePerioder =
        sjekkPropertyEksistererOgIkkeErNull('trekkKravPerioder', ytelse) && ytelse.trekkKravPerioder.length > 0;

    const visUtenlandsopphold = sjekkHvisPerioderEksisterer('utenlandsopphold', ytelse);
    const visFerie = sjekkHvisPerioderEksisterer('lovbestemtFerie', ytelse) && Object.keys(skalHaferieListe).length > 0;
    const visFerieSomSkalSLettes =
        sjekkHvisPerioderEksisterer('lovbestemtFerie', ytelse) && Object.keys(skalIkkeHaFerieListe).length > 0;
    const visOpplysningerOmSoker = ytelse.omsorg?.relasjonTilBarnet !== null;
    const visArbeidsforhold =
        sjekkPropertyEksistererOgIkkeErNull('arbeidstakerList', ytelse.arbeidstid) &&
        ytelse.arbeidstid?.arbeidstakerList.length > 0;
    const visSelvstendigNæringsdrivendeInfo =
        ytelse.arbeidstid.selvstendigNæringsdrivendeArbeidstidInfo !== null ||
        sjekkPropertyEksistererOgIkkeErNull('selvstendigNæringsdrivende', ytelse.opptjeningAktivitet);
    const visFrilanserArbeidstidInfo =
        ytelse.arbeidstid.frilanserArbeidstidInfo !== null ||
        sjekkPropertyEksistererOgIkkeErNull('frilanser', ytelse.opptjeningAktivitet);
    const visOmsorgstilbud = sjekkHvisPerioderEksisterer('tilsynsordning', ytelse);
    const visNattevak = sjekkHvisPerioderEksisterer('nattevåk', ytelse);
    const visBeredskap = sjekkHvisPerioderEksisterer('beredskap', ytelse);
    const visMedlemskap = sjekkHvisPerioderEksisterer('bosteder', ytelse);

    const formaterSøknadsperioder = () =>
        ytelse.søknadsperiode.map((periode) => periodToFormattedString(periode)).join(', ');

    const mottattDatoFormatted = `${formattereDatoFraUTCTilGMT(mottattDato)} - ${formattereTidspunktFraUTCTilGMT(mottattDato)}`;

    const inneholderMedisinskeOpplysninger =
        journalposter && journalposter[0]?.inneholderMedisinskeOpplysninger ? 'Ja' : 'Nei';
    const inneholderInformasjonSomIkkeKanPunsjes =
        journalposter && journalposter[0]?.inneholderInformasjonSomIkkeKanPunsjes ? 'Ja' : 'Nei';

    return (
        <div data-testid="kvittering.oppsummering">
            {visSoknadsperiode && (
                <div data-testid="soknadsperiode" className="mb-4">
                    <Heading size="xsmall" level="3">
                        <FormattedMessage id="skjema.soknadskvittering.soknadsperiode" />
                    </Heading>

                    <div className="h-px bg-gray-300 mb-4" />

                    <p>{formaterSøknadsperioder()}</p>
                </div>
            )}

            {mottattDato && (
                <div data-testid="mottatt-dato" className="mb-4">
                    <Heading size="xsmall" level="3">
                        <FormattedMessage id={PunchFormPaneler.OPPLYSINGER_OM_SOKNAD} />
                    </Heading>

                    <div className="h-px bg-gray-300 mb-4" />

                    <VStack gap="4">
                        <BodyShort size="small" data-testid="mottakelsesdato">
                            <FormattedMessage
                                id="skjema.kvittering.mottakelsesdato"
                                values={{
                                    mottakelsesdato: mottattDatoFormatted,
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

                        {begrunnelseForInnsending?.tekst.length > 0 && (
                            <BodyShort size="small" data-testid="begrunnelseForEndring">
                                <FormattedMessage
                                    id="skjema.kvittering.begrunnelseForEndring"
                                    values={{
                                        begrunnelse: begrunnelseForInnsending.tekst,
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

                    {formaterUtenlandsopphold(ytelse.utenlandsopphold?.perioder, intl)}
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

            {visFerieSomSkalSLettes && (
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

            {visOpplysningerOmSoker && (
                <div data-testid="opplysningerOmSoker" className="mb-4">
                    <Heading size="xsmall" level="3">
                        <FormattedMessage id={PunchFormPaneler.OPPLYSINGER_OM_SOKER} />
                    </Heading>

                    <div className="h-px bg-gray-300 mb-4" />

                    <BodyShort size="small" data-testid="relasjontilbarnet">
                        <FormattedMessage
                            id="skjema.kvittering.relasjontilbarnet"
                            values={{
                                relasjon:
                                    ytelse.omsorg.relasjonTilBarnet === 'ANNET'
                                        ? ytelse.omsorg.beskrivelseAvOmsorgsrollen
                                        : ytelse.omsorg.relasjonTilBarnet!.charAt(0) +
                                          ytelse.omsorg.relasjonTilBarnet!.slice(1).toLowerCase(),
                                b: (chunks) => <strong>{chunks}</strong>,
                            }}
                        />
                    </BodyShort>
                </div>
            )}

            {(visArbeidsforhold || visFrilanserArbeidstidInfo || visSelvstendigNæringsdrivendeInfo) && (
                <div className="mb-4">
                    <Heading size="xsmall" level="3">
                        <FormattedMessage id={PunchFormPaneler.ARBEID} />
                    </Heading>

                    <div className="h-px bg-gray-300 mb-4" />

                    {visArbeidsforhold && (
                        <div data-testid="arbeidsforhold" className="mt-4">
                            <Heading size="xsmall" level="3">
                                <FormattedMessage id="arbeidstaker" />
                            </Heading>

                            {ytelse.arbeidstid?.arbeidstakerList.map((arbeidstakerperiode) => {
                                const skalOrgNummerVises = arbeidstakerperiode.organisasjonsnummer !== null;

                                return (
                                    <div
                                        key={
                                            arbeidstakerperiode.norskIdentitetsnummer ||
                                            arbeidstakerperiode.organisasjonsnummer
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
                                            <FormattedMessage id={'skjema.frilanserdato.slutt'} />{' '}
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
                        <div data-testid="selvstendignæringsdrivende" className="mt-4">
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

            {visOmsorgstilbud && (
                <div data-testid="visOmsorgstilbud">
                    <Heading size="xsmall" level="3">
                        <FormattedMessage id={PunchFormPaneler.OMSORGSTILBUD} />
                    </Heading>

                    <div className="h-px bg-gray-300 mb-4" />

                    <VisningAvPerioderSoknadKvittering
                        perioder={formattereTimerOgMinutterForOmsorgstilbudPerioder(ytelse.tilsynsordning.perioder)}
                        tittel={['skjema.periode.overskrift', 'skjema.omsorgstilbud.gjennomsnittlig']}
                        properties={['etablertTilsynTimerPerDag']}
                        lessClassForAdjustment="visningAvPerioderOmsorgstilbud"
                    />
                </div>
            )}

            {(visNattevak || visBeredskap) && (
                <div data-testid="beredskapnettevaak" className="mb-4">
                    <Heading size="xsmall" level="3">
                        <FormattedMessage id={PunchFormPaneler.BEREDSKAPNATTEVAAK} />
                    </Heading>

                    <div className="h-px bg-gray-300 mb-4" />

                    {visBeredskap && (
                        <div data-testid="beredskap">
                            <Heading size="small" level="3">
                                <FormattedMessage id="skjema.beredskap.overskrift" />
                            </Heading>

                            <VisningAvPerioderSoknadKvittering
                                perioder={ytelse.beredskap.perioder}
                                tittel={['skjema.periode.overskrift', 'skjema.beredskap.tilleggsinfo.kvittering']}
                                properties={['tilleggsinformasjon']}
                                lessClassForAdjustment="visningAvPerioderSoknadBeredskap"
                            />
                        </div>
                    )}

                    {visNattevak && (
                        <div data-testid="nattevak">
                            <Heading size="small" level="3">
                                <FormattedMessage id="skjema.nattevaak.overskrift" />
                            </Heading>

                            <VisningAvPerioderSoknadKvittering
                                perioder={ytelse.nattevåk.perioder}
                                tittel={['skjema.periode.overskrift', 'skjema.beredskap.tilleggsinfo.kvittering']}
                                properties={['tilleggsinformasjon']}
                                lessClassForAdjustment="visningAvPerioderSoknadBeredskap"
                            />
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
        </div>
    );
};

export default PSBSoknadKvittering;
