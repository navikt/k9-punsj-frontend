/* eslint-disable global-require */

/* eslint-disable @typescript-eslint/no-var-requires */
import classNames from 'classnames';
import React from 'react';
import { IntlShape, useIntl } from 'react-intl';
import { connect } from 'react-redux';

import Kopier from 'app/components/kopier/Kopier';
import { RootStateType } from 'app/state/RootState';
import intlHelper from 'app/utils/intlUtils';

import { Heading } from '@navikt/ds-react';
import VisningAvPerioderSNSoknadKvittering from '../../../components/soknadKvittering/VisningAvPerioderSNSoknadKvittering';
import VisningAvPerioderSoknadKvittering from '../../../components/soknadKvittering/VisningAvPerioderSoknadKvittering';
import { PunchFormPaneler } from '../../../models/enums/PunchFormPaneler';
import {
    IPSBSoknadKvittering,
    IPSBSoknadKvitteringArbeidstidInfo,
    IPSBSoknadKvitteringBosteder,
    IPSBSoknadKvitteringLovbestemtFerie,
    IPSBSoknadKvitteringTilsynsordning,
    IPSBSoknadKvitteringUtenlandsopphold,
} from '../../../models/types/PSBSoknadKvittering';
import {
    formatDato,
    formatereTekstMedTimerOgMinutter,
    formattereDatoFraUTCTilGMT,
    formattereTidspunktFraUTCTilGMT,
    getCountryList,
    periodToFormattedString,
    sjekkPropertyEksistererOgIkkeErNull,
} from '../../../utils';
import './soknadKvittering.less';

interface IOwnProps {
    innsendtSøknad: IPSBSoknadKvittering;
    kopierJournalpostSuccess?: boolean;
    annenSokerIdent?: string | null;
}

const sjekkHvisPerioderEksisterer = (property: string, object: any) =>
    sjekkPropertyEksistererOgIkkeErNull(property, object) && Object.keys(object[property].perioder).length > 0;

const endreLandkodeTilLandnavnIPerioder = (
    perioder: IPSBSoknadKvitteringBosteder | IPSBSoknadKvitteringUtenlandsopphold,
) => {
    const kopiAvPerioder = JSON.parse(JSON.stringify(perioder));
    Object.keys(perioder).forEach((periode) => {
        const landNavn = getCountryList().find((country) => country.code === perioder[periode].land);
        if (landNavn) kopiAvPerioder[periode].land = landNavn?.name;
    });
    return kopiAvPerioder;
};

export const formattereTimerForArbeidstakerPerioder = (perioder: IPSBSoknadKvitteringArbeidstidInfo) => {
    const kopiAvPerioder = JSON.parse(JSON.stringify(perioder));
    Object.keys(perioder).forEach((periode) => {
        kopiAvPerioder[periode].jobberNormaltTimerPerDag = kopiAvPerioder[periode].jobberNormaltTimerPerDag
            ? formatereTekstMedTimerOgMinutter(kopiAvPerioder[periode].jobberNormaltTimerPerDag)
            : '0';
        kopiAvPerioder[periode].faktiskArbeidTimerPerDag = kopiAvPerioder[periode].faktiskArbeidTimerPerDag
            ? formatereTekstMedTimerOgMinutter(kopiAvPerioder[periode].faktiskArbeidTimerPerDag)
            : '0';
    });
    return kopiAvPerioder;
};

const formattereTimerOgMinutterForOmsorgstilbudPerioder = (perioder: IPSBSoknadKvitteringTilsynsordning) => {
    const kopiAvPerioder = JSON.parse(JSON.stringify(perioder));
    Object.keys(perioder).forEach((periode) => {
        kopiAvPerioder[periode].etablertTilsynTimerPerDag = formatereTekstMedTimerOgMinutter(
            kopiAvPerioder[periode].etablertTilsynTimerPerDag,
        );
    });
    return kopiAvPerioder;
};

export const genererSkalHaFerie = (perioder: IPSBSoknadKvitteringLovbestemtFerie) =>
    Object.entries(perioder).reduce((acc, [key, value]) => {
        if (value.skalHaFerie) {
            acc[key] = value;
        }
        return acc;
    }, {});

export const genererIkkeSkalHaFerie = (perioder: IPSBSoknadKvitteringLovbestemtFerie) =>
    Object.entries(perioder).reduce((acc, [key, value]) => {
        if (!value.skalHaFerie) {
            acc[key] = value;
        }
        return acc;
    }, {});

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
            no - param - reassign;
            obj[key] = perioder[key];
            return obj;
        }, {});
    const perioderMedInnleggelse = Object.keys(perioder)
        .filter((key) => !!perioder[key].årsak)
        .reduce((obj, key) => {
            no - param - reassign;
            obj[key] = perioder[key];
            no - param - reassign;
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

export const PSBSoknadKvittering: React.FunctionComponent<IOwnProps> = ({
    innsendtSøknad,
    kopierJournalpostSuccess,
    annenSokerIdent,
}) => {
    const { ytelse, begrunnelseForInnsending, mottattDato, journalposter } = innsendtSøknad;
    const intl = useIntl();
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
        <div className={classNames('SoknadKvitteringContainer')}>
            <Heading size="medium" level="2">
                {intlHelper(intl, 'skjema.kvittering.oppsummering')}
            </Heading>
            {kopierJournalpostSuccess && (
                <div>
                    <h3>{intlHelper(intl, 'skjema.soknadskvittering.opprettetKopi')}</h3>
                    <hr className={classNames('linje')} />
                    <p>{intlHelper(intl, 'skjema.soknadskvittering.opprettetKopi.innhold')}</p>
                    {annenSokerIdent && (
                        <p>
                            {`${intlHelper(intl, 'ident.identifikasjon.annenSoker')}: ${annenSokerIdent}`}
                            <Kopier verdi={annenSokerIdent} />
                        </p>
                    )}
                </div>
            )}
            {visSoknadsperiode && (
                <div>
                    <h3>{intlHelper(intl, 'skjema.soknadskvittering.soknadsperiode')}</h3>
                    <hr className={classNames('linje')} />
                    <p>{formaterSøknadsperioder()}</p>
                </div>
            )}

            {mottattDato && (
                <div>
                    <h3>{intlHelper(intl, PunchFormPaneler.OPPLYSINGER_OM_SOKNAD)}</h3>
                    <hr className={classNames('linje')} />
                    <p>
                        <b>{`${intlHelper(intl, 'skjema.mottakelsesdato')}: `}</b>
                        {`${formattereDatoFraUTCTilGMT(mottattDato)} - ${formattereTidspunktFraUTCTilGMT(mottattDato)}`}
                    </p>
                    {visTrukkedePerioder && (
                        <p>
                            <b>Perioder som er fjernet fra søknadsperioden: </b>
                            {ytelse.trekkKravPerioder.map((periode) => periodToFormattedString(periode)).join(', ')}
                        </p>
                    )}
                    {begrunnelseForInnsending && (
                        <p>
                            <b>Begrunnelse for endring: </b>
                            {begrunnelseForInnsending.tekst}
                        </p>
                    )}
                </div>
            )}

            {visUtenlandsopphold && (
                <div>
                    <h3>{intlHelper(intl, PunchFormPaneler.UTENLANDSOPPHOLD)}</h3>
                    <hr className={classNames('linje')} />
                    {formaterUtenlandsopphold(ytelse.utenlandsopphold?.perioder, intl)}
                </div>
            )}

            {visFerie && (
                <div>
                    <h3>{intlHelper(intl, PunchFormPaneler.FERIE)}</h3>
                    <hr className={classNames('linje')} />
                    <VisningAvPerioderSoknadKvittering
                        intl={intl}
                        perioder={skalHaferieListe}
                        tittel={['skjema.periode.overskrift']}
                    />
                </div>
            )}

            {visFerieSomSkalSLettes && (
                <div>
                    <h3>{intlHelper(intl, 'skjema.ferie.skalslettes')}</h3>
                    <hr className={classNames('linje')} />
                    <VisningAvPerioderSoknadKvittering
                        intl={intl}
                        perioder={skalIkkeHaFerieListe}
                        tittel={['skjema.periode.overskrift']}
                    />
                </div>
            )}

            {visOpplysningerOmSoker && (
                <div>
                    <h3>{intlHelper(intl, PunchFormPaneler.OPPLYSINGER_OM_SOKER)}</h3>
                    <hr className={classNames('linje')} />
                    <p>
                        <b>{`${intlHelper(intl, 'skjema.relasjontilbarnet')}: `}</b>
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
                    <h3>{intlHelper(intl, PunchFormPaneler.ARBEID)}</h3>
                    <hr className={classNames('linje')} />

                    {visArbeidsforhold && (
                        <div>
                            <h3>{intlHelper(intl, 'arbeidstaker')}</h3>
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
                                                {`${intlHelper(
                                                    intl,
                                                    skalOrgNummerVises
                                                        ? 'skjema.arbeid.arbeidstaker.orgnr'
                                                        : 'skjema.arbeid.arbeidstaker.ident',
                                                )}: `}
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
                        <div>
                            <h3>{intlHelper(intl, 'frilanser')}</h3>
                            {sjekkPropertyEksistererOgIkkeErNull('startdato', ytelse.opptjeningAktivitet.frilanser) &&
                                ytelse?.opptjeningAktivitet?.frilanser?.startdato &&
                                ytelse?.opptjeningAktivitet?.frilanser?.startdato?.length > 0 && (
                                    <p>
                                        <b>{`${intlHelper(intl, 'skjema.frilanserdato')} `}</b>
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
                                        <b>{`${intlHelper(intl, 'skjema.frilanserdato.slutt')} `}</b>
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
                        <div>
                            <h3>{intlHelper(intl, 'selvstendig')}</h3>

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
                <div>
                    <h3>{intlHelper(intl, PunchFormPaneler.OMSORGSTILBUD)}</h3>
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
                    <h3>{intlHelper(intl, PunchFormPaneler.BEREDSKAPNATTEVAAK)}</h3>
                    <hr className={classNames('linje')} />
                    {visBeredskap && (
                        <>
                            <h4 className="soknadKvitteringUnderTittel">
                                {intlHelper(intl, 'skjema.beredskap.overskrift')}
                            </h4>
                            <VisningAvPerioderSoknadKvittering
                                intl={intl}
                                perioder={ytelse.beredskap.perioder}
                                tittel={['skjema.periode.overskrift', 'skjema.beredskap.tilleggsinfo.kvittering']}
                                properties={['tilleggsinformasjon']}
                                lessClassForAdjustment="visningAvPerioderSoknadBeredskap"
                            />
                        </>
                    )}

                    {visNattevak && (
                        <div>
                            <h4 className="soknadKvitteringUnderTittel">
                                {intlHelper(intl, 'skjema.nattevaak.overskrift')}
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
                <div>
                    <h3>{intlHelper(intl, PunchFormPaneler.MEDLEMSKAP)}</h3>
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
                <div>
                    <h3>{intlHelper(intl, 'skjema.soknadskvittering.tilleggsopplysninger')}</h3>
                    <hr className={classNames('linje')} />
                    <p>
                        <b>{`${intlHelper(intl, 'skjema.medisinskeopplysninger')}: `}</b>
                        {`${journalposter[0].inneholderMedisinskeOpplysninger ? 'Ja' : 'Nei'}`}
                    </p>
                    <p>
                        <b>{`${intlHelper(intl, 'skjema.opplysningerikkepunsjet')}: `}</b>
                        {`${journalposter[0].inneholderInformasjonSomIkkeKanPunsjes ? 'Ja' : 'Nei'}`}
                    </p>
                </div>
            )}
        </div>
    );
};

const mapStateToProps = (state: RootStateType) => ({
    kopierJournalpostSuccess: state.felles.kopierJournalpostSuccess,
    annenSokerIdent: state.identState.annenSokerIdent,
});

export default connect(mapStateToProps)(PSBSoknadKvittering);
