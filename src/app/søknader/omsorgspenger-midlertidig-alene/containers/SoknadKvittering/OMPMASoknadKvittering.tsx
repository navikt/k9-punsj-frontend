import React from 'react';

import { FormattedMessage, useIntl } from 'react-intl';
import { Heading } from '@navikt/ds-react';
import classNames from 'classnames';

import Kopier from 'app/components/kopier/Kopier';
import intlHelper from 'app/utils/intlUtils';
import { PunchFormPaneler } from '../../../../models/enums/PunchFormPaneler';
import {
    formattereDatoFraUTCTilGMT,
    formattereTidspunktFraUTCTilGMT,
    periodToFormattedString,
    sjekkPropertyEksistererOgIkkeErNull,
} from '../../../../utils';
import { IOMPMASoknadKvittering } from '../../types/OMPMASoknadKvittering';

import './ompMASoknadKvittering.less';

interface Props {
    response: IOMPMASoknadKvittering;
    kopierJournalpostSuccess?: boolean;
    annenSokerIdent?: string | null;
}

const OMPMASoknadKvittering: React.FC<Props> = ({ response, kopierJournalpostSuccess, annenSokerIdent }) => {
    const intl = useIntl();

    const { journalposter, ytelse } = response;

    const visOpplysningerOmSoknad = sjekkPropertyEksistererOgIkkeErNull('mottattDato', response);

    const mottakelsesdato = `${formattereDatoFraUTCTilGMT(response.mottattDato)} - ${formattereTidspunktFraUTCTilGMT(
        response.mottattDato,
    )}`;
    const situasjonstype = intlHelper(
        intl,
        `omsorgspenger.midlertidigAlene.situasjonstyper.${ytelse.annenForelder.situasjon}`,
    );
    const situasjonsbeskrivelse = ytelse.annenForelder.situasjonBeskrivelse;
    const formattedPeriode = periodToFormattedString(ytelse.annenForelder.periode);
    const inneholderMedisinskeOpplysninger =
        journalposter && journalposter[0].inneholderMedisinskeOpplysninger ? 'Ja' : 'Nei';
    const inneholderInformasjonSomIkkeKanPunsjes =
        journalposter && journalposter[0].inneholderInformasjonSomIkkeKanPunsjes ? 'Ja' : 'Nei';

    return (
        <div className={classNames('OMPMASoknadKvitteringContainer')}>
            <Heading size="medium" level="2">
                <FormattedMessage id="skjema.kvittering.oppsummering" />
            </Heading>

            <div className="mt-4">
                {kopierJournalpostSuccess && (
                    <div>
                        <Heading size="small" level="3">
                            <FormattedMessage id="skjema.soknadskvittering.opprettetKopi" />
                        </Heading>

                        <hr className={classNames('linje')} />

                        <p>
                            <FormattedMessage id="skjema.soknadskvittering.opprettetKopi.innhold" />
                        </p>

                        {annenSokerIdent && (
                            <p>
                                <FormattedMessage
                                    id="ident.identifikasjon.kvittering.annenSoker"
                                    values={{ fnr: annenSokerIdent, b: (chunks) => <strong>{chunks}</strong> }}
                                />

                                <Kopier verdi={annenSokerIdent} />
                            </p>
                        )}
                    </div>
                )}

                {visOpplysningerOmSoknad && (
                    <div>
                        <Heading size="small" level="3">
                            <FormattedMessage id={PunchFormPaneler.OPPLYSINGER_OM_SOKNAD} />
                        </Heading>

                        <hr className={classNames('linje')} />

                        <p>
                            <FormattedMessage
                                id="skjema.kvittering.mottakelsesdato"
                                values={{
                                    mottakelsesdato,
                                    b: (chunks) => <strong>{chunks}</strong>,
                                }}
                            />
                        </p>
                    </div>
                )}

                <div>
                    <Heading size="small" level="3">
                        <FormattedMessage id="skjema.kvittering.barn" />
                    </Heading>

                    <hr className={classNames('linje')} />

                    {ytelse.barn?.map((barn) => (
                        <p key={barn.norskIdentitetsnummer}>
                            <FormattedMessage
                                id="skjema.kvittering.identitetsnummer"
                                values={{
                                    fnr: barn.norskIdentitetsnummer,
                                    b: (chunks) => <strong>{chunks}</strong>,
                                }}
                            />
                        </p>
                    ))}
                </div>

                <div>
                    <Heading size="small" level="3">
                        <FormattedMessage id={PunchFormPaneler.ANNEN_FORELDER} />
                    </Heading>

                    <hr className={classNames('linje')} />

                    <p>
                        <FormattedMessage
                            id="skjema.kvittering.identitetsnummer"
                            values={{
                                fnr: ytelse.annenForelder.norskIdentitetsnummer,
                                b: (chunks) => <strong>{chunks}</strong>,
                            }}
                        />
                    </p>

                    <p>
                        <FormattedMessage
                            id="skjema.kvittering.annenForelder.situasjonstype"
                            values={{
                                situasjonstype,
                                b: (chunks) => <strong>{chunks}</strong>,
                            }}
                        />
                    </p>

                    <p>
                        <FormattedMessage
                            id="skjema.kvittering.annenForelder.situasjonsbeskrivelse"
                            values={{
                                situasjonsbeskrivelse,
                                b: (chunks) => <strong>{chunks}</strong>,
                            }}
                        />
                    </p>

                    <p>
                        <FormattedMessage
                            id="skjema.kvittering.annenForelder.periode"
                            values={{
                                periode: formattedPeriode,
                                b: (chunks) => <strong>{chunks}</strong>,
                            }}
                        />
                    </p>
                </div>

                <div>
                    {!!journalposter && journalposter.length > 0 && (
                        <div>
                            <Heading size="small" level="3">
                                <FormattedMessage id={'skjema.soknadskvittering.tilleggsopplysninger'} />
                            </Heading>

                            <hr className={classNames('linje')} />

                            <p>
                                <FormattedMessage
                                    id="skjema.kvittering.medisinskeopplysninger"
                                    values={{
                                        jaNei: inneholderMedisinskeOpplysninger,
                                        b: (chunks) => <strong>{chunks}</strong>,
                                    }}
                                />
                            </p>

                            <p>
                                <FormattedMessage
                                    id="skjema.kvittering.opplysningerikkepunsjet"
                                    values={{
                                        jaNei: inneholderInformasjonSomIkkeKanPunsjes,
                                        b: (chunks) => <strong>{chunks}</strong>,
                                    }}
                                />
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OMPMASoknadKvittering;
