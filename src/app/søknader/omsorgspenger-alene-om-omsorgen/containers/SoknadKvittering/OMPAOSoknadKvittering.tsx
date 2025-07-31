import React from 'react';

import dayjs from 'dayjs';
import { FormattedMessage } from 'react-intl';
import { Alert, BodyShort, Heading, VStack } from '@navikt/ds-react';

import { formattereTidspunktFraUTCTilGMT, periodToFormattedString } from '../../../../utils';
import { IOMPAOSoknadKvittering } from '../../types/OMPAOSoknadKvittering';
import { PunchFormPaneler } from 'app/models/enums/PunchFormPaneler';

interface Props {
    kvittering?: IOMPAOSoknadKvittering;
}

const OMPAOSoknadKvittering: React.FC<Props> = ({ kvittering }: Props) => {
    const { journalposter, mottattDato, ytelse } = kvittering || {};
    const { barn, periode } = ytelse || {};

    if (!kvittering) {
        return (
            <Alert variant="error">
                <FormattedMessage id="skjema.kvittering.ingenKvittering" />
            </Alert>
        );
    }

    const mottakelsesdato = `${periodToFormattedString(
        kvittering.mottattDato.substr(0, 10),
    )}  ${formattereTidspunktFraUTCTilGMT(kvittering.mottattDato)}`;

    const aleneOmOmsorgenDato = periode ? dayjs(periode).format('DD.MM.YYYY') : '';
    const barnetsFnr = barn ? barn.norskIdentitetsnummer : '';
    const inneholderMedisinskeOpplysninger =
        journalposter && journalposter[0].inneholderMedisinskeOpplysninger ? 'Ja' : 'Nei';
    const inneholderInformasjonSomIkkeKanPunsjes =
        journalposter && journalposter[0].inneholderInformasjonSomIkkeKanPunsjes ? 'Ja' : 'Nei';

    return (
        <>
            {mottattDato && (
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

            {periode && (
                <div className="mb-4">
                    <BodyShort size="small">
                        <FormattedMessage
                            id="skjema.kvittering.OMPAO.aleneOmOmsorgen"
                            values={{ dato: aleneOmOmsorgenDato, b: (chunks) => <strong>{chunks}</strong> }}
                        />
                    </BodyShort>
                </div>
            )}

            {barn?.norskIdentitetsnummer && (
                <div className="mb-4">
                    <BodyShort size="small">
                        <FormattedMessage
                            id="skjema.kvittering.identitetsnummer.barn"
                            values={{ fnr: barnetsFnr, b: (chunks) => <strong>{chunks}</strong> }}
                        />
                    </BodyShort>
                </div>
            )}

            {!!journalposter && journalposter.length > 0 && (
                <>
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
                </>
            )}
        </>
    );
};

export default OMPAOSoknadKvittering;
