import classNames from 'classnames';
import React from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';

import { Alert, BodyShort, Label } from '@navikt/ds-react';

import Kopier from 'app/components/kopier/Kopier';
import VisningAvPerioderSNSoknadKvittering from 'app/components/soknadKvittering/VisningAvPerioderSNSoknadKvittering';
import VisningAvPerioderSoknadKvittering from 'app/components/soknadKvittering/VisningAvPerioderSoknadKvittering';
import {
    IOLPSoknadKvittering,
    IOLPSoknadKvitteringArbeidstidInfo,
} from 'app/søknader/opplæringspenger/OLPSoknadKvittering';
import { RootStateType } from 'app/state/RootState';
import { formattereTidspunktFraUTCTilGMT, getCountryList, periodToFormattedString } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import { formatereTekstMedTimerOgMinutter, formattereDatoFraUTCTilGMT } from 'app/utils/timeUtils';
import { formatDato, sjekkPropertyEksistererOgIkkeErNull } from 'app/utils/utils';

import { PunchFormPaneler } from '../../../../models/enums/PunchFormPaneler';
import VisningAvKursperioderSoknadKvittering from './VisningAvKursperioderSoknadKvittering';
import './soknadKvittering.less';
import { ISoknadKvitteringBosteder, ISoknadKvitteringLovbestemtFerie } from 'app/models/types/KvitteringTyper';

const sjekkHvisPerioderEksisterer = (property: string, object: any) =>
    sjekkPropertyEksistererOgIkkeErNull(property, object) && Object.keys(object[property].perioder).length > 0;

const endreLandkodeTilLandnavnIPerioder = (perioder: ISoknadKvitteringBosteder) => {
    const kopiAvPerioder = JSON.parse(JSON.stringify(perioder));
    Object.keys(perioder).forEach((periode) => {
        const landNavn = getCountryList().find((country) => country.code === perioder[periode].land);
        if (landNavn) kopiAvPerioder[periode].land = landNavn?.name;
    });
    return kopiAvPerioder;
};

export const formattereTimerForArbeidstakerPerioder = (perioder: IOLPSoknadKvitteringArbeidstidInfo) => {
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

export const genererSkalHaFerie = (perioder: ISoknadKvitteringLovbestemtFerie) =>
    Object.entries(perioder).reduce((acc, [key, value]) => {
        if (value.skalHaFerie) {
            acc[key] = value;
        }
        return acc;
    }, {});

export const genererIkkeSkalHaFerie = (perioder: ISoknadKvitteringLovbestemtFerie) =>
    Object.entries(perioder).reduce((acc, [key, value]) => {
        if (!value.skalHaFerie) {
            acc[key] = value;
        }
        return acc;
    }, {});

interface IOwnProps {
    kvittering: IOLPSoknadKvittering;
}

export const OLPSoknadKvittering: React.FunctionComponent<IOwnProps> = ({ kvittering }) => {
    const intl = useIntl();
    const kopierJournalpostSuccess = useSelector((state: RootStateType) => state.felles.kopierJournalpostSuccess);
    const annenSokerIdent = useSelector((state: RootStateType) => state.identState.annenSokerIdent);

    const { journalposter, ytelse } = kvittering || {};

    if (!ytelse) {
        return <Alert variant="error">Noe gikk galt ved visning av kvittering</Alert>;
    }

    const skalHaferieListe = genererSkalHaFerie(ytelse.lovbestemtFerie.perioder);
    const skalIkkeHaFerieListe = genererIkkeSkalHaFerie(ytelse.lovbestemtFerie.perioder);
    const visSoknadsperiode =
        sjekkPropertyEksistererOgIkkeErNull('søknadsperiode', ytelse) && ytelse.søknadsperiode.length > 0;
    const visBegrunnelseForInnsending =
        sjekkPropertyEksistererOgIkkeErNull('begrunnelseForInnsending', kvittering) &&
        kvittering?.begrunnelseForInnsending.tekst;
    const visOpplysningerOmSoknad = sjekkPropertyEksistererOgIkkeErNull('mottattDato', ytelse);
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
    const visMedlemskap = sjekkHvisPerioderEksisterer('bosteder', ytelse);
    const visKurs = ytelse.kurs && ytelse.kurs.kursperioder.length > 0;
    const visReise = ytelse.kurs && ytelse.kurs.reise && ytelse.kurs.reise.reisedager.length > 0;
    const visUtenlandsopphold = ytelse.utenlandsopphold && Object.keys(ytelse.utenlandsopphold.perioder).length > 0;
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
                    <BodyShort size="small">{formaterSøknadsperioder()}</BodyShort>
                </div>
            )}

            {visOpplysningerOmSoknad && (
                <div>
                    <h3>{intlHelper(intl, PunchFormPaneler.OPPLYSINGER_OM_SOKNAD)}</h3>
                    <hr className={classNames('linje')} />
                    <div className="flex flex-col gap-2">
                        <Label size="small">Mottakelsesdato</Label>
                        <BodyShort size="small">
                            {`${formattereDatoFraUTCTilGMT(kvittering.mottattDato)} - ${formattereTidspunktFraUTCTilGMT(
                                kvittering.mottattDato,
                            )}`}
                        </BodyShort>
                    </div>
                    {visBegrunnelseForInnsending && (
                        <div className="flex flex-col gap-2">
                            <Label size="small">Begrunnelse for endring</Label>
                            <BodyShort size="small">{kvittering.begrunnelseForInnsending.tekst}</BodyShort>
                        </div>
                    )}
                </div>
            )}
            {visKurs && (
                <div>
                    <h3>Opplæring</h3>
                    <hr className={classNames('linje')} />
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <Label size="small">Kursholder</Label>
                            <BodyShort size="small">{ytelse.kurs.kursholder.navn}</BodyShort>
                        </div>
                        <VisningAvKursperioderSoknadKvittering kursperioder={ytelse.kurs.kursperioder} />
                    </div>
                </div>
            )}

            {visReise && (
                <div>
                    <h3>Reise</h3>
                    <hr className={classNames('linje')} />
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <Label size="small">Reisedager</Label>
                            {ytelse.kurs.reise.reisedager.map((reisedag) => (
                                <BodyShort size="small" key={reisedag}>
                                    {dayjs(reisedag).format('DD.MM.YYYY')}
                                </BodyShort>
                            ))}
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label size="small">Beskrivelse</Label>
                            <BodyShort size="small">{ytelse.kurs.reise.reisedagerBeskrivelse}</BodyShort>
                        </div>
                    </div>
                </div>
            )}
            {visUtenlandsopphold && (
                <div>
                    <h3>{intlHelper(intl, PunchFormPaneler.UTENLANDSOPPHOLD)}</h3>
                    <hr className={classNames('linje')} />
                    <VisningAvPerioderSoknadKvittering
                        perioder={endreLandkodeTilLandnavnIPerioder(ytelse.utenlandsopphold?.perioder)}
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
                                  ytelse.omsorg.relasjonTilBarnet.charAt(0) +
                                  ytelse.omsorg.relasjonTilBarnet.slice(1).toLowerCase()
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
                <div>
                    <h3>{intlHelper(intl, PunchFormPaneler.MEDLEMSKAP)}</h3>
                    <hr className={classNames('linje')} />
                    <VisningAvPerioderSoknadKvittering
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

export default OLPSoknadKvittering;
