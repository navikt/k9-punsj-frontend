import React from 'react';

import { FormattedMessage } from 'react-intl';
import { BodyShort, CopyButton, Heading, VStack } from '@navikt/ds-react';

import { PunchFormPaneler } from '../../../../models/enums/PunchFormPaneler';
import {
    formattereDatoFraUTCTilGMT,
    formattereTidspunktFraUTCTilGMT,
    sjekkPropertyEksistererOgIkkeErNull,
} from '../../../../utils';
import { IOMPKSSoknadKvittering } from '../../types/OMPKSSoknadKvittering';

interface Props {
    response: IOMPKSSoknadKvittering;
    kopierJournalpostSuccess?: boolean;
    annenSokerIdent?: string | null;
}

export const OMPKSSoknadKvittering: React.FC<Props> = ({ response, kopierJournalpostSuccess, annenSokerIdent }) => {
    const { journalposter } = response;

    const visOpplysningerOmSoknad = sjekkPropertyEksistererOgIkkeErNull('mottattDato', response);

    const mottakelsesdato = `${formattereDatoFraUTCTilGMT(response.mottattDato)} - ${formattereTidspunktFraUTCTilGMT(
        response.mottattDato,
    )}`;

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

            {!!journalposter && journalposter.length > 0 && (
                <div className="mb-4">
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
        </>
    );
};

export default OMPKSSoknadKvittering;
