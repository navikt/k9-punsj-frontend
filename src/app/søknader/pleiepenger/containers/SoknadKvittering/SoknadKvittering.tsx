import React from 'react';

import classNames from 'classnames';
import { FormattedMessage, IntlShape, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import Kopier from 'app/components/kopier/Kopier';
import { RootStateType } from 'app/state/RootState';
import intlHelper from 'app/utils/intlUtils';
import { Heading } from '@navikt/ds-react';
import VisningAvPerioderSNSoknadKvittering from 'app/components/soknadKvittering/VisningAvPerioderSNSoknadKvittering';
import VisningAvPerioderSoknadKvittering from 'app/components/soknadKvittering/VisningAvPerioderSoknadKvittering';
import { PunchFormPaneler } from 'app/models/enums/PunchFormPaneler';
import { IPSBSoknadKvittering, IPSBSoknadKvitteringUtenlandsopphold } from 'app/models/types/PSBSoknadKvittering';
import {
    formatDato,
    formattereDatoFraUTCTilGMT,
    formattereTidspunktFraUTCTilGMT,
    periodToFormattedString,
    sjekkPropertyEksistererOgIkkeErNull,
} from 'app/utils';

import './soknadKvittering.less';
import {
    endreLandkodeTilLandnavnIPerioder,
    formattereTimerForArbeidstakerPerioder,
    formattereTimerOgMinutterForOmsorgstilbudPerioder,
    genererIkkeSkalHaFerie,
    genererSkalHaFerie,
    sjekkHvisPerioderEksisterer,
} from './soknadKvitteringUtils';

interface Props {
    innsendtSøknad: IPSBSoknadKvittering;
}

const formaterUtenlandsopphold = (perioder: IPSBSoknadKvitteringUtenlandsopphold, intl: IntlShape) => {
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
        }, {});
    const perioderMedInnleggelse = Object.keys(perioder)
        .filter((key) => !!perioder[key].årsak)
        .reduce((obj, key) => {
            obj[key] = perioder[key];
            obj[key].årsak = årsaker.find((årsak) => årsak.value === obj[key].årsak)?.label;
            return obj;
        }, {} as IPSBSoknadKvitteringUtenlandsopphold);

    return (
        <>
            <VisningAvPerioderSoknadKvittering
                intl={intl}
                perioder={endreLandkodeTilLandnavnIPerioder(perioderUtenInnleggelse)}
                tittel={['skjema.periode.overskrift', 'skjema.utenlandsopphold.land']}
                properties={['land']}
            />
            {Object.keys(perioderMedInnleggelse).length > 0 ? (
                <div className={classNames('marginTop24')}>
                    <VisningAvPerioderSoknadKvittering
                        intl={intl}
                        perioder={endreLandkodeTilLandnavnIPerioder(perioderMedInnleggelse)}
                        tittel={[
                            'skjema.perioder.innleggelse.overskrift',
                            'skjema.utenlandsopphold.land',
                            'skjema.utenlandsopphold.utgifterTilInnleggelse',
                        ]}
                        properties={['land', 'årsak']}
                        lessClassForAdjustment="widerLastCell"
                    />
                </div>
            ) : null}
        </>
    );
};

export const PSBSoknadKvittering: React.FC<Props> = ({ innsendtSøknad }) => {
    const intl = useIntl();

    const { ytelse, begrunnelseForInnsending, mottattDato, journalposter } = innsendtSøknad;
    const annenSokerIdent = useSelector((state: RootStateType) => state.identState.annenSokerIdent);
    const kopierJournalpostSuccess = useSelector((state: RootStateType) => state.felles.kopierJournalpostSuccess);
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
        <div className={classNames('SoknadKvitteringContainer')} data-testid="kvitter">
            <Heading size="medium" level="2" data-testid="kvittering.oppsummering">
                <FormattedMessage id={'skjema.kvittering.oppsummering'} />
            </Heading>
            {kopierJournalpostSuccess && (
                <div>
                    <h3>
                        <FormattedMessage id={'skjema.soknadskvittering.opprettetKopi'} />
                    </h3>
                    <hr className={classNames('linje')} />
                    <p>
                        <FormattedMessage id={'skjema.soknadskvittering.opprettetKopi.innhold'} />
                    </p>
                    {annenSokerIdent && (
                        <p>
                            <FormattedMessage
                                id={'ident.identifikasjon.kvittering.annenSoker'}
                                values={{ fnr: annenSokerIdent }}
                            />
                            <Kopier verdi={annenSokerIdent} />
                        </p>
                    )}
                </div>
            )}
            {visSoknadsperiode && (
                <div data-testid="soknadsperiode">
                    <h3>
                        <FormattedMessage id={'skjema.soknadskvittering.soknadsperiode'} />
                    </h3>
                    <hr className={classNames('linje')} />
                    <p>{formaterSøknadsperioder()}</p>
                </div>
            )}

            {mottattDato && (
                <div data-testid="mottatt-dato">
                    <h3>
                        <FormattedMessage id={PunchFormPaneler.OPPLYSINGER_OM_SOKNAD} />
                    </h3>
                    <hr className={classNames('linje')} />
                    <p>
                        <b>
                            <FormattedMessage id={'skjema.mottakelsesdato'} />
                        </b>
                        {`${formattereDatoFraUTCTilGMT(mottattDato)} - ${formattereTidspunktFraUTCTilGMT(mottattDato)}`}
                    </p>
                    {visTrukkedePerioder && (
                        <p data-testid="perioderSomFjernet">
                            <b>
                                <FormattedMessage id={'skjema.perioderSomFjernet'} />
                            </b>
                            {ytelse.trekkKravPerioder.map((periode) => periodToFormattedString(periode)).join(', ')}
                        </p>
                    )}
                    {begrunnelseForInnsending && (
                        <p data-testid="begrunnelseForEndring">
                            <b>
                                <FormattedMessage id={'skjema.begrunnelseForEndring'} />
                            </b>
                            {begrunnelseForInnsending.tekst}
                        </p>
                    )}
                </div>
            )}

            {visUtenlandsopphold && (
                <div data-testid="utenlandsopphold">
                    <h3>
                        <FormattedMessage id={PunchFormPaneler.UTENLANDSOPPHOLD} />
                    </h3>
                    <hr className={classNames('linje')} />
                    {formaterUtenlandsopphold(ytelse.utenlandsopphold?.perioder, intl)}
                </div>
            )}

            {visFerie && (
                <div data-testid="ferie">
                    <h3>
                        <FormattedMessage id={PunchFormPaneler.FERIE} />
                    </h3>
                    <hr className={classNames('linje')} />
                    <VisningAvPerioderSoknadKvittering
                        intl={intl}
                        perioder={skalHaferieListe}
                        tittel={['skjema.periode.overskrift']}
                    />
                </div>
            )}

            {visFerieSomSkalSLettes && (
                <div data-testid="ferieSomSkalSlettes">
                    <h3>
                        <FormattedMessage id={'skjema.ferie.skalslettes'} />
                    </h3>
                    <hr className={classNames('linje')} />
                    <VisningAvPerioderSoknadKvittering
                        intl={intl}
                        perioder={skalIkkeHaFerieListe}
                        tittel={['skjema.periode.overskrift']}
                    />
                </div>
            )}

            {visOpplysningerOmSoker && (
                <div data-testid="opplysningerOmSoker">
                    <h3>
                        <FormattedMessage id={PunchFormPaneler.OPPLYSINGER_OM_SOKER} />
                    </h3>
                    <hr className={classNames('linje')} />
                    <p>
                        <b>
                            <FormattedMessage id={'skjema.relasjontilbarnet.kvittering'} />{' '}
                        </b>
                        {ytelse.omsorg.relasjonTilBarnet === 'ANNET'
                            ? `${ytelse.omsorg.beskrivelseAvOmsorgsrollen}`
                            : `${
                                  ytelse.omsorg.relasjonTilBarnet!.charAt(0) +
                                  ytelse.omsorg.relasjonTilBarnet!.slice(1).toLowerCase()
                              }`}
                    </p>
                </div>
            )}

            {(visArbeidsforhold || visFrilanserArbeidstidInfo || visSelvstendigNæringsdrivendeInfo) && (
                <div>
                    <h3>
                        <FormattedMessage id={PunchFormPaneler.ARBEID} />
                    </h3>
                    <hr className={classNames('linje')} />

                    {visArbeidsforhold && (
                        <div data-testid="arbeidsforhold">
                            <h3>
                                <FormattedMessage id={'arbeidstaker'} />
                            </h3>
                            {ytelse.arbeidstid?.arbeidstakerList.map((arbeidstakerperiode) => {
                                const skalOrgNummerVises = arbeidstakerperiode.organisasjonsnummer !== null;
                                return (
                                    <React.Fragment
                                        key={
                                            arbeidstakerperiode.norskIdentitetsnummer ||
                                            arbeidstakerperiode.organisasjonsnummer
                                        }
                                    >
                                        <p className={classNames('soknadKvitteringUnderTittel')}>
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
                                            {`${
                                                skalOrgNummerVises
                                                    ? arbeidstakerperiode.organisasjonsnummer
                                                    : arbeidstakerperiode.norskIdentitetsnummer
                                            }`}
                                        </p>

                                        <VisningAvPerioderSoknadKvittering
                                            intl={intl}
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
                            <h3>
                                <FormattedMessage id={'frilanser'} />
                            </h3>
                            {sjekkPropertyEksistererOgIkkeErNull('startdato', ytelse.opptjeningAktivitet.frilanser) &&
                                ytelse?.opptjeningAktivitet?.frilanser?.startdato &&
                                ytelse?.opptjeningAktivitet?.frilanser?.startdato?.length > 0 && (
                                    <p>
                                        <b>
                                            <FormattedMessage id={'skjema.frilanserdato'} />{' '}
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
                                    intl={intl}
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
                            <h3>
                                <FormattedMessage id={'selvstendig'} />
                            </h3>

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
                                    intl={intl}
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
                    <h3>
                        <FormattedMessage id={PunchFormPaneler.OMSORGSTILBUD} />
                    </h3>
                    <hr className={classNames('linje')} />
                    <VisningAvPerioderSoknadKvittering
                        intl={intl}
                        perioder={formattereTimerOgMinutterForOmsorgstilbudPerioder(ytelse.tilsynsordning.perioder)}
                        tittel={['skjema.periode.overskrift', 'skjema.omsorgstilbud.gjennomsnittlig']}
                        properties={['etablertTilsynTimerPerDag']}
                        lessClassForAdjustment="visningAvPerioderOmsorgstilbud"
                    />
                </div>
            )}

            {(visNattevak || visBeredskap) && (
                <div>
                    <h3 data-testid="beredskapnettevaak">
                        <FormattedMessage id={PunchFormPaneler.BEREDSKAPNATTEVAAK} />
                    </h3>
                    <hr className={classNames('linje')} />
                    {visBeredskap && (
                        <div data-testid="beredskap">
                            <h4 className="soknadKvitteringUnderTittel">
                                <FormattedMessage id={'skjema.beredskap.overskrift'} />
                            </h4>
                            <VisningAvPerioderSoknadKvittering
                                intl={intl}
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
                                <FormattedMessage id={'skjema.nattevaak.overskrift'} />
                            </h4>
                            <VisningAvPerioderSoknadKvittering
                                intl={intl}
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
                    <h3>
                        <FormattedMessage id={PunchFormPaneler.MEDLEMSKAP} />
                    </h3>
                    <hr className={classNames('linje')} />
                    <VisningAvPerioderSoknadKvittering
                        intl={intl}
                        perioder={endreLandkodeTilLandnavnIPerioder(ytelse.bosteder?.perioder)}
                        tittel={['skjema.periode.overskrift', 'skjema.utenlandsopphold.land']}
                        properties={['land']}
                    />
                </div>
            )}

            {!!journalposter && journalposter.length > 0 && (
                <div data-testid="tilleggsopplysninger">
                    <h3>
                        <FormattedMessage id={'skjema.soknadskvittering.tilleggsopplysninger'} />
                    </h3>
                    <hr className={classNames('linje')} />
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
                        {`${journalposter[0].inneholderInformasjonSomIkkeKanPunsjes ? 'Ja' : 'Nei'}`}
                    </p>
                </div>
            )}
        </div>
    );
};

export default PSBSoknadKvittering;
