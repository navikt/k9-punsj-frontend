import React from 'react';

import classNames from 'classnames';
import dayjs from 'dayjs';
import { FormattedMessage } from 'react-intl';
import { Alert, Heading } from '@navikt/ds-react';

import { formattereTidspunktFraUTCTilGMT, periodToFormattedString } from '../../../../utils';
import { IOMPAOSoknadKvittering } from '../../types/OMPAOSoknadKvittering';
import { PunchFormPaneler } from 'app/models/enums/PunchFormPaneler';

import './OMPAOSoknadKvittering.less';

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
        <div className={classNames('OMPAOSoknadKvitteringContainer')}>
            <Heading size="medium" level="2">
                <FormattedMessage id="skjema.kvittering.oppsummering" />
            </Heading>

            <div className="mt-4">
                {mottattDato && (
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

                {periode && (
                    <p>
                        <FormattedMessage
                            id="skjema.kvittering.OMPAO.fraOgMed"
                            values={{ aleneOmOmsorgenDato, b: (chunks) => <strong>{chunks}</strong> }}
                        />
                    </p>
                )}

                {barn?.norskIdentitetsnummer && (
                    <p>
                        <FormattedMessage
                            id="skjema.kvittering.OMPAO.fraOgMed"
                            values={{ fnr: barnetsFnr, b: (chunks) => <strong>{chunks}</strong> }}
                        />
                    </p>
                )}

                <div>
                    {!!journalposter && journalposter.length > 0 && (
                        <div>
                            <Heading size="small" level="3">
                                <FormattedMessage id="skjema.soknadskvittering.tilleggsopplysninger" />
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

export default OMPAOSoknadKvittering;
