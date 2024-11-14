import React from 'react';

import classNames from 'classnames';
import dayjs from 'dayjs';
import countries from 'i18n-iso-countries';
import { FormattedMessage } from 'react-intl';
import { Alert, Heading } from '@navikt/ds-react';

import { formattereTidspunktFraUTCTilGMT, periodToFormattedString } from '../../../../utils';
import { IOMPAOSoknadKvittering } from '../../types/OMPAOSoknadKvittering';
import { PunchFormPaneler } from 'app/models/enums/PunchFormPaneler';
import LabelValue from 'app/components/skjema/LabelValue';

import './OMPAOSoknadKvittering.less';

interface Props {
    kvittering?: IOMPAOSoknadKvittering;
}

const OMPAOSoknadKvittering: React.FunctionComponent<Props> = ({ kvittering }: Props) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    countries.registerLocale(require('i18n-iso-countries/langs/nb.json'));

    const { journalposter, mottattDato, ytelse } = kvittering || {};
    const { barn, periode } = ytelse || {};

    if (!kvittering) {
        return (
            <Alert variant="error">
                <FormattedMessage id="skjema.kvittering.ingenKvittering" />
            </Alert>
        );
    }

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
                            <LabelValue
                                labelTextId="skjema.mottakelsesdato"
                                value={`${periodToFormattedString(
                                    kvittering.mottattDato.substr(0, 10),
                                )}  ${formattereTidspunktFraUTCTilGMT(kvittering.mottattDato)}`}
                                gap
                            />
                        </p>
                    </div>
                )}

                {periode && (
                    <p>
                        <LabelValue
                            labelTextId="skjema.kvittering.OMPAO.fraOgMed"
                            value={periode ? dayjs(periode).format('DD.MM.YYYY') : ''}
                            gap
                        />
                    </p>
                )}

                {barn?.norskIdentitetsnummer && (
                    <p>
                        <LabelValue
                            labelTextId="skjema.kvittering.barn.tittel"
                            value={barn ? barn.norskIdentitetsnummer : ''}
                            gap
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
                                <LabelValue
                                    labelTextId="skjema.medisinskeopplysninger.kvittering"
                                    value={journalposter[0].inneholderMedisinskeOpplysninger ? 'Ja' : 'Nei'}
                                    gap
                                />
                            </p>

                            <p>
                                <LabelValue
                                    labelTextId="skjema.opplysningerikkepunsjet.kvittering"
                                    value={journalposter[0].inneholderInformasjonSomIkkeKanPunsjes ? 'Ja' : 'Nei'}
                                    gap
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
