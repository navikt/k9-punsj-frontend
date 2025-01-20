import React from 'react';

import { Heading } from '@navikt/ds-react';
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

import './plsSoknadKvittering.less';

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

    return (
        <div className="SoknadKvitteringContainer">
            <Heading size="medium" level="2" data-testid="kvittering.oppsummering">
                <FormattedMessage id="skjema.kvittering.oppsummering" />
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

            {visOpplysningerOmSoknad && (
                <div>
                    <Heading size="xsmall" level="3">
                        <FormattedMessage id={PunchFormPaneler.OPPLYSINGER_OM_SOKNAD} />
                    </Heading>

                    <hr className="linje" />

                    <p>
                        <b>
                            <FormattedMessage id="skjema.mottakelsesdato" />{' '}
                        </b>
                        {`${formattereDatoFraUTCTilGMT(response.mottattDato)} - ${formattereTidspunktFraUTCTilGMT(
                            response.mottattDato,
                        )}`}
                    </p>

                    {visTrukkedePerioder && (
                        <p data-testid="perioderSomFjernet">
                            <b>
                                <FormattedMessage id="skjema.perioderSomFjernet" />{' '}
                            </b>
                            {ytelse.trekkKravPerioder.map((periode) => periodToFormattedString(periode)).join(', ')}
                        </p>
                    )}

                    {visBegrunnelseForInnsending && (
                        <p data-testid="begrunnelseForEndring">
                            <b>
                                <FormattedMessage id="skjema.begrunnelseForEndring" />{' '}
                            </b>
                            {response.begrunnelseForInnsending.tekst}
                        </p>
                    )}
                </div>
            )}

            {visUtenlandsopphold && (
                <div>
                    <Heading size="xsmall" level="3">
                        <FormattedMessage id={PunchFormPaneler.UTENLANDSOPPHOLD} />
                    </Heading>

                    <hr className="linje" />

                    <VisningAvPerioderSoknadKvittering
                        perioder={endreLandkodeTilLandnavnIPerioder(ytelse.utenlandsopphold?.perioder)}
                        tittel={['skjema.periode.overskrift', 'skjema.utenlandsopphold.land']}
                        properties={['land']}
                    />
                </div>
            )}

            {visFerie && (
                <div>
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

            {visFerieSomSkalSlettes && (
                <div>
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

            {(visArbeidsforhold || visFrilanserArbeidstidInfo || visSelvstendigNæringsdrivendeInfo) && (
                <div>
                    <Heading size="xsmall" level="3">
                        <FormattedMessage id={PunchFormPaneler.ARBEID} />
                    </Heading>

                    <hr className="linje" />

                    {visArbeidsforhold && (
                        <div>
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
                                    </div>
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
                <div>
                    <Heading size="xsmall" level="3">
                        <FormattedMessage id="skjema.soknadskvittering.tilleggsopplysninger" />
                    </Heading>

                    <hr className="linje" />

                    <p>
                        <b>
                            <FormattedMessage id="skjema.medisinskeopplysninger.kvittering" />
                        </b>{' '}
                        {journalposter[0].inneholderMedisinskeOpplysninger ? 'Ja' : 'Nei'}
                    </p>

                    <p>
                        <b>
                            <FormattedMessage id="skjema.opplysningerikkepunsjet.kvittering" />{' '}
                        </b>
                        {journalposter[0].inneholderInformasjonSomIkkeKanPunsjes ? 'Ja' : 'Nei'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default PLSSoknadKvittering;
