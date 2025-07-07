import React from 'react';

import { FormattedMessage, useIntl } from 'react-intl';
import { BodyShort, CopyButton, Heading, VStack } from '@navikt/ds-react';
// import classNames from 'classnames';

import intlHelper from 'app/utils/intlUtils';
import { PunchFormPaneler } from '../../../../models/enums/PunchFormPaneler';
import {
    formattereDatoFraUTCTilGMT,
    formattereTidspunktFraUTCTilGMT,
    periodToFormattedString,
    sjekkPropertyEksistererOgIkkeErNull,
} from '../../../../utils';
import { IOMPMASoknadKvittering } from '../../types/OMPMASoknadKvittering';

// import './ompMASoknadKvittering.less';

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
        <>
            {kopierJournalpostSuccess && (
                <div className="mb-4">
                    <Heading size="small" level="3">
                        <FormattedMessage id="skjema.soknadskvittering.opprettetKopi" />
                    </Heading>

                    <div className="h-px bg-gray-300 mb-4" />

                    <VStack gap="4">
                        <BodyShort size="small">
                            <FormattedMessage id="skjema.soknadskvittering.opprettetKopi.innhold" />
                        </BodyShort>

                        {annenSokerIdent && (
                            <BodyShort size="small" className="flex gap-1">
                                <FormattedMessage
                                    id="ident.identifikasjon.kvittering.annenSoker"
                                    values={{ fnr: annenSokerIdent, b: (chunks) => <strong>{chunks}</strong> }}
                                />

                                <CopyButton size="xsmall" copyText={annenSokerIdent} />
                            </BodyShort>
                        )}
                    </VStack>
                </div>
            )}

            {visOpplysningerOmSoknad && (
                <div className="mb-4">
                    <Heading size="small" level="3">
                        <FormattedMessage id={PunchFormPaneler.OPPLYSINGER_OM_SOKNAD} />
                    </Heading>

                    <div className="h-px bg-gray-300 mb-4" />

                    <BodyShort size="small">
                        <FormattedMessage
                            id="skjema.kvittering.mottakelsesdato"
                            values={{
                                mottakelsesdato,
                                b: (chunks) => <strong>{chunks}</strong>,
                            }}
                        />
                    </BodyShort>
                </div>
            )}

            <div className="mb-4">
                <Heading size="small" level="3">
                    <FormattedMessage id="skjema.kvittering.barn" />
                </Heading>

                <div className="h-px bg-gray-300 mb-4" />

                <VStack gap="4">
                    {ytelse.barn?.map((barn) => (
                        <BodyShort size="small" spacing key={barn.norskIdentitetsnummer} as="p">
                            <FormattedMessage
                                id="skjema.kvittering.identitetsnummer"
                                values={{
                                    fnr: barn.norskIdentitetsnummer,
                                    b: (chunks) => <strong>{chunks}</strong>,
                                }}
                            />
                        </BodyShort>
                    ))}
                </VStack>
            </div>

            <div className="mb-4">
                <Heading size="small" level="3">
                    <FormattedMessage id={PunchFormPaneler.ANNEN_FORELDER} />
                </Heading>

                <div className="h-px bg-gray-300 mb-4" />

                <VStack gap="4">
                    <BodyShort size="small">
                        <FormattedMessage
                            id="skjema.kvittering.identitetsnummer"
                            values={{
                                fnr: ytelse.annenForelder.norskIdentitetsnummer,
                                b: (chunks) => <strong>{chunks}</strong>,
                            }}
                        />
                    </BodyShort>

                    <BodyShort size="small">
                        <FormattedMessage
                            id="skjema.kvittering.annenForelder.situasjonstype"
                            values={{
                                situasjonstype,
                                b: (chunks) => <strong>{chunks}</strong>,
                            }}
                        />
                    </BodyShort>

                    <BodyShort size="small">
                        <FormattedMessage
                            id="skjema.kvittering.annenForelder.situasjonsbeskrivelse"
                            values={{
                                situasjonsbeskrivelse,
                                b: (chunks) => <strong>{chunks}</strong>,
                            }}
                        />
                    </BodyShort>

                    <BodyShort size="small">
                        <FormattedMessage
                            id="skjema.kvittering.annenForelder.periode"
                            values={{
                                periode: formattedPeriode,
                                b: (chunks) => <strong>{chunks}</strong>,
                            }}
                        />
                    </BodyShort>
                </VStack>
            </div>

            {!!journalposter && journalposter.length > 0 && (
                <div className="mb-4">
                    <Heading size="small" level="3">
                        <FormattedMessage id={'skjema.soknadskvittering.tilleggsopplysninger'} />
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

export default OMPMASoknadKvittering;
