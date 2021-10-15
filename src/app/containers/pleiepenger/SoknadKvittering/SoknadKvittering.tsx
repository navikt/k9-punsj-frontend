/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { connect } from 'react-redux';
import intlHelper from 'app/utils/intlUtils';
import classNames from 'classnames';
import './soknadKvittering.less';
import countries from 'i18n-iso-countries';
import { RootStateType } from 'app/state/RootState';
import { PunchFormPaneler } from '../../../models/enums/PunchFormPaneler';
import {
    formatereTekstMedTimerOgMinutter,
    formattereTidspunktFraUTCTilGMT,
    getLocaleFromSessionStorage,
    periodToFormattedString,
} from '../../../utils';
import VisningAvPerioderSoknadKvittering from './Komponenter/VisningAvPerioderSoknadKvittering';
import { ICountry } from '../../../components/country-select/CountrySelect';
import {
    IPSBSoknadKvittering,
    IPSBSoknadKvitteringArbeidstidInfo,
    IPSBSoknadKvitteringBosteder,
    IPSBSoknadKvitteringLovbestemtFerie,
    IPSBSoknadKvitteringTilsynsordning,
    IPSBSoknadKvitteringUtenlandsopphold,
} from '../../../models/types/PSBSoknadKvittering';
import VisningAvPerioderSNSoknadKvittering from './Komponenter/VisningAvPerioderSNSoknadKvittering';

interface IOwnProps {
    intl: any;
    response: IPSBSoknadKvittering;
    kopierJournalpostSuccess?: boolean;
}

export const sjekkPropertyEksistererOgIkkeErNull = (property: string, object: any) => {
    if (property in object && object[property] !== null) {
        return true;
    }
    return false;
};

const sjekkHvisPerioderEksisterer = (property: string, object: any) =>
    sjekkPropertyEksistererOgIkkeErNull(property, object) && Object.keys(object[property].perioder).length > 0;

const formattereLandTilNavnIObjekt = (
    perioder: IPSBSoknadKvitteringBosteder | IPSBSoknadKvitteringUtenlandsopphold,
    countryList: ICountry[]
) => {
    const kopiAvPerioder = JSON.parse(JSON.stringify(perioder));
    Object.keys(perioder).forEach((periode) => {
        const landNavn = countryList.find((country) => country.code === perioder[periode].land);
        if (typeof landNavn !== undefined) kopiAvPerioder[periode].land = landNavn?.name;
    });
    return kopiAvPerioder;
};

export const formattereLandTilNavn = (landskode: string, countryList: ICountry[]) => {
    const landNavn = countryList.find((country) => country.code === landskode);
    return typeof landNavn !== undefined ? landNavn?.name : '';
};

export const formattereTimerForArbeidstakerPerioder = (perioder: IPSBSoknadKvitteringArbeidstidInfo) => {
    const kopiAvPerioder = JSON.parse(JSON.stringify(perioder));
    Object.keys(perioder).forEach((periode) => {
        kopiAvPerioder[periode].jobberNormaltTimerPerDag = formatereTekstMedTimerOgMinutter(
            kopiAvPerioder[periode].jobberNormaltTimerPerDag
        );
        kopiAvPerioder[periode].faktiskArbeidTimerPerDag = formatereTekstMedTimerOgMinutter(
            kopiAvPerioder[periode].faktiskArbeidTimerPerDag
        );
    });
    return kopiAvPerioder;
};

const formattereTimerOgMinutterForOmsorgstilbudPerioder = (perioder: IPSBSoknadKvitteringTilsynsordning) => {
    const kopiAvPerioder = JSON.parse(JSON.stringify(perioder));
    Object.keys(perioder).forEach((periode) => {
        kopiAvPerioder[periode].etablertTilsynTimerPerDag = formatereTekstMedTimerOgMinutter(
            kopiAvPerioder[periode].etablertTilsynTimerPerDag
        );
    });
    return kopiAvPerioder;
};

export const formattereDatoIArray = (dato: number[]) => {
    const formatertDato: string[] = [];
    for (let i = dato.length - 1; i >= 0; i -= 1) {
        formatertDato.push(i > 0 ? `${dato[i]}.` : `${dato[i]}`);
    }
    return formatertDato.join('');
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

export const SoknadKvittering: React.FunctionComponent<IOwnProps> = ({ intl, response, kopierJournalpostSuccess }) => {
    const locale = getLocaleFromSessionStorage();
    countries.registerLocale(require('i18n-iso-countries/langs/nb.json'));

    const { ytelse, journalposter } = response;
    const skalHaferieListe = genererSkalHaFerie(ytelse.lovbestemtFerie.perioder);
    const skalIkkeHaFerieListe = genererIkkeSkalHaFerie(ytelse.lovbestemtFerie.perioder);
    const visSoknadsperiode =
        sjekkPropertyEksistererOgIkkeErNull('søknadsperiode', ytelse) && ytelse.søknadsperiode.length > 0;
    const visOpplysningerOmSoknad = sjekkPropertyEksistererOgIkkeErNull('mottattDato', response);
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

    const countryList: ICountry[] = [];

    Object.keys(countries.getAlpha3Codes()).forEach((code) =>
        countryList.push({
            code,
            name: countries.getName(code, locale),
        })
    );

    return (
        <div className={classNames('SoknadKvitteringContainer')}>
            <h2>{intlHelper(intl, 'skjema.kvittering.oppsummering')}</h2>
            {kopierJournalpostSuccess && (
                <div>
                    <h3>{intlHelper(intl, 'skjema.soknadskvittering.opprettetKopi')}</h3>
                    <hr className={classNames('linje')} />
                    <p>{intlHelper(intl, 'skjema.soknadskvittering.opprettetKopi.innhold')}</p>
                </div>
            )}
            {visSoknadsperiode && (
                <div>
                    <h3>{intlHelper(intl, 'skjema.soknadskvittering.soknadsperiode')}</h3>
                    <hr className={classNames('linje')} />
                    <p>{periodToFormattedString(ytelse.søknadsperiode[0])}</p>
                </div>
            )}

            {visOpplysningerOmSoknad && (
                <div>
                    <h3>{intlHelper(intl, PunchFormPaneler.OPPLYSINGER_OM_SOKNAD)}</h3>
                    <hr className={classNames('linje')} />
                    <p>
                        <b>{`${intlHelper(intl, 'skjema.mottakelsesdato')}: `}</b>
                        {`${periodToFormattedString(
                            response.mottattDato.substr(0, 10)
                        )}  ${formattereTidspunktFraUTCTilGMT(response.mottattDato)}`}
                    </p>
                </div>
            )}

            {visUtenlandsopphold && (
                <div>
                    <h3>{intlHelper(intl, PunchFormPaneler.UTENLANDSOPPHOLD)}</h3>
                    <hr className={classNames('linje')} />
                    <VisningAvPerioderSoknadKvittering
                        intl={intl}
                        perioder={formattereLandTilNavnIObjekt(ytelse.utenlandsopphold?.perioder, countryList)}
                        tittel={['skjema.periode.overskrift', 'skjema.utenlandsopphold.land']}
                        properties={['land']}
                    />
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
                                    <>
                                        <p className={classNames('soknadKvitteringUnderTittel')}>
                                            <b>
                                                {`${intlHelper(
                                                    intl,
                                                    skalOrgNummerVises
                                                        ? 'skjema.arbeid.arbeidstaker.orgnr'
                                                        : 'skjema.arbeid.arbeidstaker.ident'
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
                                                arbeidstakerperiode.arbeidstidInfo.perioder
                                            )}
                                            tittel={[
                                                'skjema.periode.overskrift',
                                                'skjema.arbeid.arbeidstaker.timernormalt',
                                                'skjema.arbeid.arbeidstaker.timerfaktisk',
                                            ]}
                                            properties={['jobberNormaltTimerPerDag', 'faktiskArbeidTimerPerDag']}
                                        />
                                    </>
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
                                        {formattereDatoIArray(ytelse.opptjeningAktivitet.frilanser?.startdato)}
                                    </p>
                                )}

                            {!ytelse.opptjeningAktivitet.frilanser?.jobberFortsattSomFrilans &&
                                sjekkPropertyEksistererOgIkkeErNull(
                                    'sluttdato',
                                    ytelse.opptjeningAktivitet.frilanser
                                ) &&
                                ytelse.opptjeningAktivitet.frilanser?.sluttdato &&
                                ytelse.opptjeningAktivitet.frilanser?.sluttdato?.length > 0 && (
                                    <p>
                                        <b>{`${intlHelper(intl, 'skjema.frilanserdato.slutt')} `}</b>
                                        {formattereDatoIArray(ytelse.opptjeningAktivitet.frilanser?.sluttdato)}
                                    </p>
                                )}

                            {ytelse.arbeidstid.frilanserArbeidstidInfo !== null && (
                                <VisningAvPerioderSoknadKvittering
                                    intl={intl}
                                    perioder={formattereTimerForArbeidstakerPerioder(
                                        ytelse.arbeidstid.frilanserArbeidstidInfo?.perioder
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
                                ytelse.opptjeningAktivitet
                            ) && (
                                <VisningAvPerioderSNSoknadKvittering
                                    intl={intl}
                                    perioder={ytelse.opptjeningAktivitet.selvstendigNæringsdrivende!}
                                    countryList={countryList}
                                />
                            )}

                            {ytelse.arbeidstid.selvstendigNæringsdrivendeArbeidstidInfo !== null && (
                                <VisningAvPerioderSoknadKvittering
                                    intl={intl}
                                    perioder={formattereTimerForArbeidstakerPerioder(
                                        ytelse.arbeidstid.selvstendigNæringsdrivendeArbeidstidInfo?.perioder
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
                        perioder={formattereLandTilNavnIObjekt(ytelse.bosteder?.perioder, countryList)}
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
                        {`${
                            journalposter[0].inneholderMedisinskeOpplysninger
                                ? 'Ja'
                                : 'Nei'
                        }`}
                    </p>
                    <p>
                        <b>{`${intlHelper(intl, 'skjema.opplysningerikkepunsjet')}: `}</b>
                        {`${
                            journalposter[0].inneholderInfomasjonSomIkkeKanPunsjes
                                ? 'Ja'
                                : 'Nei'
                        }`}
                    </p>
                </div>
            )}
        </div>
    );
};

const mapStateToProps = (state: RootStateType) => ({
    kopierJournalpostSuccess: state.felles.kopierJournalpostSuccess
})

export default connect(mapStateToProps)(SoknadKvittering);
