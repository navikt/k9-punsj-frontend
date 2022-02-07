/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { connect } from 'react-redux';
import intlHelper from 'app/utils/intlUtils';
import classNames from 'classnames';
import './plsSoknadKvittering.less';
import countries from 'i18n-iso-countries';
import { RootStateType } from 'app/state/RootState';
import Kopier from 'app/components/kopier/Kopier';
import { PunchFormPaneler } from '../../../models/enums/PunchFormPaneler';
import {
    formatereTekstMedTimerOgMinutter,
    formattereTidspunktFraUTCTilGMT,
    getLocaleFromSessionStorage,
    periodToFormattedString,
    sjekkPropertyEksistererOgIkkeErNull,
    formattereDatoIArray,
} from '../../../utils';
import VisningAvPerioderSoknadKvittering from './Komponenter/VisningAvPerioderPLSSoknadKvittering';
import { ICountry } from '../../../components/country-select/CountrySelect';

import VisningAvPerioderSNPLSSoknadKvittering from './Komponenter/VisningAvPerioderSNPLSSoknadKvittering';
import {
    IPLSSoknadKvittering, IPLSSoknadKvitteringArbeidstidInfo,
    IPLSSoknadKvitteringBosteder, IPLSSoknadKvitteringLovbestemtFerie,
    IPLSSoknadKvitteringUtenlandsopphold
} from '../../types/PLSSoknadKvittering';

interface IOwnProps {
    intl: any;
    response: IPLSSoknadKvittering;
    kopierJournalpostSuccess?: boolean;
    annenSokerIdent?: string | null;
}

const sjekkHvisPerioderEksisterer = (property: string, object: any) =>
    sjekkPropertyEksistererOgIkkeErNull(property, object) && Object.keys(object[property].perioder).length > 0;

const formattereLandTilNavnIObjekt = (
    perioder: IPLSSoknadKvitteringBosteder | IPLSSoknadKvitteringUtenlandsopphold,
    countryList: ICountry[]
) => {
    const kopiAvPerioder = JSON.parse(JSON.stringify(perioder));
    Object.keys(perioder).forEach((periode) => {
        const landNavn = countryList.find((country) => country.code === perioder[periode].land);
        if (typeof landNavn !== undefined) kopiAvPerioder[periode].land = landNavn?.name;
    });
    return kopiAvPerioder;
};

export const formattereTimerForArbeidstakerPerioder = (perioder: IPLSSoknadKvitteringArbeidstidInfo) => {
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

export const genererSkalHaFerie = (perioder: IPLSSoknadKvitteringLovbestemtFerie) =>
    Object.entries(perioder).reduce((acc, [key, value]) => {
        if (value.skalHaFerie) {
            acc[key] = value;
        }
        return acc;
    }, {});

export const genererIkkeSkalHaFerie = (perioder: IPLSSoknadKvitteringLovbestemtFerie) =>
    Object.entries(perioder).reduce((acc, [key, value]) => {
        if (!value.skalHaFerie) {
            acc[key] = value;
        }
        return acc;
    }, {});

export const PLSSoknadKvittering: React.FunctionComponent<IOwnProps> = ({
    intl,
    response,
    kopierJournalpostSuccess,
    annenSokerIdent,
}) => {
    const locale = getLocaleFromSessionStorage();
    countries.registerLocale(require('i18n-iso-countries/langs/nb.json'));

    const { ytelse, journalposter } = response;
    const visSoknadsperiode =
        sjekkPropertyEksistererOgIkkeErNull('søknadsperiode', ytelse) && ytelse.søknadsperiode.length > 0;
    const visTrukkedePerioder =
        sjekkPropertyEksistererOgIkkeErNull('trekkKravPerioder', ytelse) && ytelse.trekkKravPerioder.length > 0;
    const visBegrunnelseForInnsending =
        sjekkPropertyEksistererOgIkkeErNull('begrunnelseForInnsending', response) &&
        response.begrunnelseForInnsending.tekst;
    const visOpplysningerOmSoknad = sjekkPropertyEksistererOgIkkeErNull('mottattDato', response);
    const visUtenlandsopphold = sjekkHvisPerioderEksisterer('utenlandsopphold', ytelse);
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

    const countryList: ICountry[] = [];

    Object.keys(countries.getAlpha3Codes()).forEach((code) =>
        countryList.push({
            code,
            name: countries.getName(code, locale),
        })
    );

    const formaterSøknadsperioder = () =>
        ytelse.søknadsperiode.map((periode) => periodToFormattedString(periode)).join(', ');

    return (
        <div className={classNames('SoknadKvitteringContainer')}>
            <h2>{intlHelper(intl, 'skjema.kvittering.oppsummering')}</h2>
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
                    {visTrukkedePerioder && (
                        <p>
                            <b>Perioder som er fjernet fra søknadsperioden: </b>
                            {ytelse.trekkKravPerioder.map((periode) => periodToFormattedString(periode)).join(', ')}
                        </p>
                    )}
                    {visBegrunnelseForInnsending && (
                        <p>
                            <b>Begrunnelse for endring: </b>
                            {response.begrunnelseForInnsending.tekst}
                        </p>
                    )}
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
                                <VisningAvPerioderSNPLSSoknadKvittering
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

export default connect(mapStateToProps)(PLSSoknadKvittering);
