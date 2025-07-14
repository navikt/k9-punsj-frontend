import React from 'react';

import { FormattedMessage } from 'react-intl';
import { Alert, BodyShort, Heading, VStack } from '@navikt/ds-react';

import { aktivitetsFravær } from 'app/søknader/omsorgspenger-utbetaling/konstanter';
import { PunchFormPaneler } from '../../../../models/enums/PunchFormPaneler';
import { formattereTidspunktFraUTCTilGMT, periodToFormattedString } from '../../../../utils';
import { IOMPUTSoknadKvittering } from '../../types/OMPUTSoknadKvittering';
import OMPUTFravaersperiodeKvittering from './OMPUTFravaersperiodeKvittering';

interface Props {
    kvittering?: IOMPUTSoknadKvittering;
}

export const OMPUTSoknadKvittering: React.FC<Props> = ({ kvittering }) => {
    const { journalposter, mottattDato } = kvittering || {};

    if (!kvittering) {
        return <Alert variant="error">Noe gikk galt ved visning av kvittering</Alert>;
    }
    const arbeidstakerFravaersperioder = kvittering.ytelse.fraværsperioder.filter((periode) =>
        periode.aktivitetFravær.includes(aktivitetsFravær.ARBEIDSTAKER),
    );
    const frilanserFravaersperioder = kvittering.ytelse.fraværsperioder.filter((periode) =>
        periode.aktivitetFravær.includes(aktivitetsFravær.FRILANSER),
    );
    const selvstendigNaeringsdrivendeFravaersperioder = kvittering.ytelse.fraværsperioder.filter((periode) =>
        periode.aktivitetFravær.includes(aktivitetsFravær.SELVSTENDIG_NÆRINGSDRIVENDE),
    );

    const mottakelsesdato = `${periodToFormattedString(
        kvittering.mottattDato.substr(0, 10),
    )}  ${formattereTidspunktFraUTCTilGMT(kvittering.mottattDato)}`;

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

            <div className="mb-4">
                <Heading size="small" level="3">
                    <FormattedMessage id={PunchFormPaneler.ARBEID} />
                </Heading>

                <div className="h-px bg-gray-300 mb-4" />

                {!!arbeidstakerFravaersperioder.length && (
                    <>
                        <div className="mb-4">
                            <Heading size="small" level="4">
                                <FormattedMessage id="arbeidstaker" />
                            </Heading>
                        </div>

                        {arbeidstakerFravaersperioder.map((periode) => (
                            <OMPUTFravaersperiodeKvittering key={periode.periode} periode={periode} />
                        ))}
                    </>
                )}

                {!!frilanserFravaersperioder.length && (
                    <>
                        <div className="mt-4">
                            <Heading size="small" level="4">
                                <FormattedMessage id="frilanser" />
                            </Heading>
                        </div>

                        {frilanserFravaersperioder.map((periode) => (
                            <OMPUTFravaersperiodeKvittering key={periode.periode} periode={periode} />
                        ))}
                    </>
                )}

                {!!selvstendigNaeringsdrivendeFravaersperioder.length && (
                    <>
                        <div className="mt-4">
                            <Heading size="small" level="4">
                                <FormattedMessage id="selvstendig" />
                            </Heading>
                        </div>

                        {selvstendigNaeringsdrivendeFravaersperioder.map((periode) => (
                            <OMPUTFravaersperiodeKvittering key={periode.periode} periode={periode} />
                        ))}
                    </>
                )}
            </div>

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

export default OMPUTSoknadKvittering;
