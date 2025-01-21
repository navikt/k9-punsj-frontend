import React from 'react';

import { FormattedMessage, IntlShape, useIntl } from 'react-intl';
import { Heading } from '@navikt/ds-react';

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

import './soknadKvittering.less';
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

    return (
        <div className="SoknadKvitteringContainer" data-testid="kvitter">
            <Heading size="medium" level="2" data-testid="kvittering.oppsummering">
                <FormattedMessage id={'skjema.kvittering.oppsummering'} />
            </Heading>

            {visSoknadsperiode && (
                <div data-testid="soknadsperiode">
                    <Heading size="xsmall" level="3">
                        <FormattedMessage id="skjema.soknadskvittering.soknadsperiode" />
                    </Heading>

                    <hr className="linje" />

                    <p>{formaterSøknadsperioder()}</p>
                </div>
            )}

            {mottattDato && (
                <div data-testid="mottatt-dato">
                    <Heading size="xsmall" level="3">
                        <FormattedMessage id={PunchFormPaneler.OPPLYSINGER_OM_SOKNAD} />
                    </Heading>

                    <hr className="linje" />

                    <p>
                        <b>
                            <FormattedMessage id={'skjema.mottakelsesdato'} />{' '}
                        </b>
                        {`${formattereDatoFraUTCTilGMT(mottattDato)} - ${formattereTidspunktFraUTCTilGMT(mottattDato)}`}
                    </p>

                    {visTrukkedePerioder && (
                        <p data-testid="perioderSomFjernet">
                            <b>
                                <FormattedMessage id={'skjema.perioderSomFjernet'} />{' '}
                            </b>
                            {ytelse.trekkKravPerioder.map((periode) => periodToFormattedString(periode)).join(', ')}
                        </p>
                    )}

                    {begrunnelseForInnsending?.tekst.length > 0 && (
                        <p data-testid="begrunnelseForEndring">
                            <b>
                                <FormattedMessage id={'skjema.begrunnelseForEndring'} />{' '}
                            </b>
                            {begrunnelseForInnsending.tekst}
                        </p>
                    )}
                </div>
            )}

            {visUtenlandsopphold && (
                <div data-testid="utenlandsopphold">
                    <Heading size="xsmall" level="3">
                        <FormattedMessage id={PunchFormPaneler.UTENLANDSOPPHOLD} />
                    </Heading>

                    <hr className="linje" />

                    {formaterUtenlandsopphold(ytelse.utenlandsopphold?.perioder, intl)}
                </div>
            )}

            {visFerie && (
                <div data-testid="ferie">
                    <Heading size="xsmall" level="3">
                        <FormattedMessage id={PunchFormPaneler.FERIE} />
                    </Heading>

                    <hr className="linje" />

                    <VisningAvPerioderSoknadKvittering
                        perioder={skalHaferieListe}
                        tittel={['skjema.periode.overskrift']}
                    />
                </div>
            )}

            {visFerieSomSkalSLettes && (
                <div data-testid="ferieSomSkalSlettes">
                    <Heading size="xsmall" level="3">
                        <FormattedMessage id="skjema.ferie.skalslettes" />
                    </Heading>

                    <hr className="linje" />

                    <VisningAvPerioderSoknadKvittering
                        perioder={skalIkkeHaFerieListe}
                        tittel={['skjema.periode.overskrift']}
                    />
                </div>
            )}

            {visOpplysningerOmSoker && (
                <div data-testid="opplysningerOmSoker">
                    <Heading size="xsmall" level="3">
                        <FormattedMessage id={PunchFormPaneler.OPPLYSINGER_OM_SOKER} />
                    </Heading>

                    <hr className="linje" />

                    <p>
                        <b>
                            <FormattedMessage id={'skjema.relasjontilbarnet.kvittering'} />{' '}
                        </b>

                        {ytelse.omsorg.relasjonTilBarnet === 'ANNET'
                            ? ytelse.omsorg.beskrivelseAvOmsorgsrollen
                            : ytelse.omsorg.relasjonTilBarnet!.charAt(0) +
                              ytelse.omsorg.relasjonTilBarnet!.slice(1).toLowerCase()}
                    </p>
                </div>
            )}

            {(visArbeidsforhold || visFrilanserArbeidstidInfo || visSelvstendigNæringsdrivendeInfo) && (
                <div>
                    <Heading size="xsmall" level="3">
                        <FormattedMessage id={PunchFormPaneler.ARBEID} />
                    </Heading>

                    <hr className="linje" />

                    {visArbeidsforhold && (
                        <div data-testid="arbeidsforhold">
                            <Heading size="xsmall" level="3">
                                <FormattedMessage id="arbeidstaker" />
                            </Heading>

                            {ytelse.arbeidstid?.arbeidstakerList.map((arbeidstakerperiode) => {
                                const skalOrgNummerVises = arbeidstakerperiode.organisasjonsnummer !== null;
                                return (
                                    <React.Fragment
                                        key={
                                            arbeidstakerperiode.norskIdentitetsnummer ||
                                            arbeidstakerperiode.organisasjonsnummer
                                        }
                                    >
                                        <p className="soknadKvitteringUnderTittel">
                                            <b>
                                                <FormattedMessage
                                                    id={
                                                        skalOrgNummerVises
                                                            ? 'skjema.arbeid.arbeidstaker.orgnr'
                                                            : 'skjema.arbeid.arbeidstaker.ident'
                                                    }
                                                />
                                                {': '}
                                            </b>

                                            {skalOrgNummerVises
                                                ? arbeidstakerperiode.organisasjonsnummer
                                                : arbeidstakerperiode.norskIdentitetsnummer}
                                        </p>

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
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    )}

                    {visFrilanserArbeidstidInfo && (
                        <div data-testid="frilanser">
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
                        <div data-testid="selvstendignæringsdrivende">
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

                    <hr className="linje" />

                    <VisningAvPerioderSoknadKvittering
                        perioder={formattereTimerOgMinutterForOmsorgstilbudPerioder(ytelse.tilsynsordning.perioder)}
                        tittel={['skjema.periode.overskrift', 'skjema.omsorgstilbud.gjennomsnittlig']}
                        properties={['etablertTilsynTimerPerDag']}
                        lessClassForAdjustment="visningAvPerioderOmsorgstilbud"
                    />
                </div>
            )}

            {(visNattevak || visBeredskap) && (
                <div data-testid="beredskapnettevaak">
                    <Heading size="xsmall" level="3">
                        <FormattedMessage id={PunchFormPaneler.BEREDSKAPNATTEVAAK} />
                    </Heading>

                    <hr className="linje" />

                    {visBeredskap && (
                        <div data-testid="beredskap">
                            <h4 className="soknadKvitteringUnderTittel">
                                <FormattedMessage id="skjema.beredskap.overskrift" />
                            </h4>

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
                            <h4 className="soknadKvitteringUnderTittel">
                                <FormattedMessage id="skjema.nattevaak.overskrift" />
                            </h4>

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
                <div data-testid="medlemskap">
                    <Heading size="xsmall" level="3">
                        <FormattedMessage id={PunchFormPaneler.MEDLEMSKAP} />
                    </Heading>

                    <hr className="linje" />

                    <VisningAvPerioderSoknadKvittering
                        perioder={endreLandkodeTilLandnavnIPerioder(ytelse.bosteder?.perioder)}
                        tittel={['skjema.periode.overskrift', 'skjema.utenlandsopphold.land']}
                        properties={['land']}
                    />
                </div>
            )}

            {!!journalposter && journalposter.length > 0 && (
                <div data-testid="tilleggsopplysninger">
                    <Heading size="xsmall" level="3">
                        <FormattedMessage id="skjema.soknadskvittering.tilleggsopplysninger" />
                    </Heading>

                    <hr className="linje" />

                    <p>
                        <b>
                            <FormattedMessage id={'skjema.medisinskeopplysninger.kvittering'} />{' '}
                        </b>
                        {`${journalposter[0].inneholderMedisinskeOpplysninger ? 'Ja' : 'Nei'}`}
                    </p>
                    <p>
                        <b>
                            <FormattedMessage id={'skjema.opplysningerikkepunsjet.kvittering'} />{' '}
                        </b>
                        {journalposter[0].inneholderInformasjonSomIkkeKanPunsjes ? 'Ja' : 'Nei'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default PSBSoknadKvittering;
