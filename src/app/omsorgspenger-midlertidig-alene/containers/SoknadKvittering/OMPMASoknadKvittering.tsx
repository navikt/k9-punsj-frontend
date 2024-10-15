import classNames from 'classnames';
import countries from 'i18n-iso-countries';
import React from 'react';
import { connect } from 'react-redux';
import { useIntl } from 'react-intl';

import Kopier from 'app/components/kopier/Kopier';
import LabelValue from 'app/components/skjema/LabelValue';
import { RootStateType } from 'app/state/RootState';
import intlHelper from 'app/utils/intlUtils';

import { PunchFormPaneler } from '../../../models/enums/PunchFormPaneler';
import {
    formattereDatoFraUTCTilGMT,
    formattereTidspunktFraUTCTilGMT,
    periodToFormattedString,
    sjekkPropertyEksistererOgIkkeErNull,
} from '../../../utils';
import { IOMPMASoknadKvittering } from '../../types/OMPMASoknadKvittering';
import './ompMASoknadKvittering.less';

interface IOwnProps {
    response: IOMPMASoknadKvittering;
    kopierJournalpostSuccess?: boolean;
    annenSokerIdent?: string | null;
}

export const OMPMASoknadKvittering: React.FunctionComponent<IOwnProps> = ({
    response,
    kopierJournalpostSuccess,
    annenSokerIdent,
}) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    countries.registerLocale(require('i18n-iso-countries/langs/nb.json'));
    const intl = useIntl();
    const { journalposter, ytelse } = response;
    const visOpplysningerOmSoknad = sjekkPropertyEksistererOgIkkeErNull('mottattDato', response);

    return (
        <div className={classNames('OMPMASoknadKvitteringContainer')}>
            <h2>{intlHelper(intl, 'skjema.kvittering.oppsummering')}</h2>
            {kopierJournalpostSuccess && (
                <div>
                    <hr className={classNames('linje')} />
                    <h3>{intlHelper(intl, 'skjema.soknadskvittering.opprettetKopi')}</h3>
                    <p>{intlHelper(intl, 'skjema.soknadskvittering.opprettetKopi.innhold')}</p>
                    {annenSokerIdent && (
                        <p>
                            {`${intlHelper(intl, 'ident.identifikasjon.annenSoker')}: ${annenSokerIdent}`}
                            <Kopier verdi={annenSokerIdent} />
                        </p>
                    )}
                </div>
            )}

            {visOpplysningerOmSoknad && (
                <div>
                    <hr className={classNames('linje')} />
                    <h3>{intlHelper(intl, PunchFormPaneler.OPPLYSINGER_OM_SOKNAD)}</h3>
                    <p>
                        <b>{`${intlHelper(intl, 'skjema.mottakelsesdato')}: `}</b>
                        {`${formattereDatoFraUTCTilGMT(response.mottattDato)} - ${formattereTidspunktFraUTCTilGMT(
                            response.mottattDato,
                        )}`}
                    </p>
                </div>
            )}
            <div>
                <hr className={classNames('linje')} />
                <h3>{intlHelper(intl, 'skjema.kvittering.barn')}</h3>
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
                <h3>{intlHelper(intl, PunchFormPaneler.ANNEN_FORELDER)}</h3>
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
                        <h3>{intlHelper(intl, 'skjema.soknadskvittering.tilleggsopplysninger')}</h3>
                        <hr className={classNames('linje')} />
                        <p>
                            <b>{`${intlHelper(intl, 'skjema.medisinskeopplysninger')}: `}</b>
                            {`${journalposter[0].inneholderMedisinskeOpplysninger ? 'Ja' : 'Nei'}`}
                        </p>
                        <p>
                            <b>{`${intlHelper(intl, 'skjema.opplysningerikkepunsjet')}: `}</b>
                            {`${journalposter[0].inneholderInformasjonSomIkkeKanPunsjes ? 'Ja' : 'Nei'}`}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

const mapStateToProps = (state: RootStateType) => ({
    kopierJournalpostSuccess: state.felles.kopierJournalpostSuccess,
    annenSokerIdent: state.identState.annenSokerIdent,
});

export default connect(mapStateToProps)(OMPMASoknadKvittering);
