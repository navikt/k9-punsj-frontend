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

export const OMPMASoknadKvittering: React.FunctionComponent<Props> = ({
    response,
    kopierJournalpostSuccess,
    annenSokerIdent,
}) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    countries.registerLocale(require('i18n-iso-countries/langs/nb.json')); // Why is this here?

    const intl = useIntl();

    const { journalposter, ytelse } = response;

    const visOpplysningerOmSoknad = sjekkPropertyEksistererOgIkkeErNull('mottattDato', response);

    return (
        <div className={classNames('OMPMASoknadKvitteringContainer')}>
            <Heading size="medium" level="2">
                <FormattedMessage id={'skjema.kvittering.oppsummering'} />
            </Heading>

            {kopierJournalpostSuccess && (
                <div>
                    <hr className={classNames('linje')} />

                    <Heading size="small" level="3">
                        <FormattedMessage id={'skjema.soknadskvittering.opprettetKopi'} />
                    </Heading>

                    <p>
                        <FormattedMessage id={'skjema.soknadskvittering.opprettetKopi.innhold'} />
                    </p>

                    {annenSokerIdent && (
                        <p>
                            <FormattedMessage
                                id={'ident.identifikasjon.kvittering.annenSoker'}
                                values={{ fnr: annenSokerIdent }}
                            />

                            <Kopier verdi={annenSokerIdent} />
                        </p>
                    )}
                </div>
            )}

            {visOpplysningerOmSoknad && (
                <div>
                    <hr className={classNames('linje')} />
                    <Heading size="small" level="3">
                        <FormattedMessage id={PunchFormPaneler.OPPLYSINGER_OM_SOKNAD} />
                    </Heading>

                    <p>
                        <LabelValue
                            text={`${intlHelper(intl, 'skjema.mottakelsesdato')}`}
                            value={`${formattereDatoFraUTCTilGMT(response.mottattDato)} - ${formattereTidspunktFraUTCTilGMT(
                                response.mottattDato,
                            )}`}
                        />
                    </p>
                </div>
            )}

            <div>
                <hr className={classNames('linje')} />

                <Heading size="small" level="3">
                    <FormattedMessage id={'skjema.kvittering.barn'} />
                </Heading>

                {ytelse.barn?.map((barn) => (
                    <p key={barn.norskIdentitetsnummer}>
                        <LabelValue
                            text={`${intlHelper(intl, 'skjema.identitetsnummer')}:`}
                            value={barn.norskIdentitetsnummer}
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
                    <LabelValue
                        text={`${intlHelper(intl, 'skjema.identitetsnummer')}:`}
                        value={ytelse.annenForelder.norskIdentitetsnummer}
                    />
                </p>

                <p>
                    <LabelValue
                        text={`${intlHelper(intl, 'skjema.annenForelder.situasjonstype')}:`}
                        value={intlHelper(
                            intl,
                            `omsorgspenger.midlertidigAlene.situasjonstyper.${ytelse.annenForelder.situasjon}`,
                        )}
                    />
                </p>

                <p>
                    <LabelValue
                        text={`${intlHelper(intl, 'skjema.annenForelder.situasjonsbeskrivelse')}:`}
                        value={ytelse.annenForelder.situasjonBeskrivelse}
                    />
                </p>

                <p>
                    <LabelValue
                        text={`${intlHelper(intl, 'skjema.annenForelder.periode')}:`}
                        value={periodToFormattedString(ytelse.annenForelder.periode)}
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
                                text={`${intlHelper(intl, 'skjema.medisinskeopplysninger.kvittering')}`}
                                value={`${journalposter[0].inneholderMedisinskeOpplysninger ? 'Ja' : 'Nei'}`}
                            />
                        </p>

                        <p>
                            <LabelValue
                                text={`${intlHelper(intl, 'skjema.opplysningerikkepunsjet.kvittering')}`}
                                value={`${journalposter[0].inneholderInformasjonSomIkkeKanPunsjes ? 'Ja' : 'Nei'}`}
                            />
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OMPMASoknadKvittering;
