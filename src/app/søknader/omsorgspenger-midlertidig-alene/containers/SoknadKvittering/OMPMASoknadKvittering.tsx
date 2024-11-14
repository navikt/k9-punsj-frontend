import React from 'react';

import { FormattedMessage, useIntl } from 'react-intl';
import { Heading } from '@navikt/ds-react';
import classNames from 'classnames';
import countries from 'i18n-iso-countries';

import Kopier from 'app/components/kopier/Kopier';
import LabelValue from 'app/components/skjema/LabelValue';
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
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    countries.registerLocale(require('i18n-iso-countries/langs/nb.json')); // Why is this here?
    const intl = useIntl();

    const { journalposter, ytelse } = response;

    const visOpplysningerOmSoknad = sjekkPropertyEksistererOgIkkeErNull('mottattDato', response);

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
                                    values={{ fnr: annenSokerIdent }}
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
                            <LabelValue
                                labelTextId="skjema.mottakelsesdato"
                                value={`${formattereDatoFraUTCTilGMT(response.mottattDato)} - ${formattereTidspunktFraUTCTilGMT(
                                    response.mottattDato,
                                )}`}
                                gap
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
                            <LabelValue labelTextId="skjema.identitetsnummer" value={barn.norskIdentitetsnummer} gap />
                        </p>
                    ))}
                </div>

                <div>
                    <Heading size="small" level="3">
                        <FormattedMessage id={PunchFormPaneler.ANNEN_FORELDER} />
                    </Heading>

                    <hr className={classNames('linje')} />

                    <p>
                        <LabelValue
                            labelTextId="skjema.identitetsnummer"
                            value={ytelse.annenForelder.norskIdentitetsnummer}
                            gap
                        />
                    </p>

                    <p>
                        <LabelValue
                            labelTextId="skjema.annenForelder.situasjonstype"
                            value={intlHelper(
                                intl,
                                `omsorgspenger.midlertidigAlene.situasjonstyper.${ytelse.annenForelder.situasjon}`,
                            )}
                            gap
                        />
                    </p>

                    <p>
                        <LabelValue
                            labelTextId="skjema.annenForelder.situasjonsbeskrivelse"
                            value={ytelse.annenForelder.situasjonBeskrivelse}
                            gap
                        />
                    </p>

                    <p>
                        <LabelValue
                            labelTextId="skjema.annenForelder.periode"
                            value={periodToFormattedString(ytelse.annenForelder.periode)}
                            gap
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

export default OMPMASoknadKvittering;
