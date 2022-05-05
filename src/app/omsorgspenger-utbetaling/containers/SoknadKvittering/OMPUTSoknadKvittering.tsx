/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { connect } from 'react-redux';
import intlHelper from 'app/utils/intlUtils';
import classNames from 'classnames';
import './ompUtSoknadKvittering.less';
import countries from 'i18n-iso-countries';
import { RootStateType } from 'app/state/RootState';
import Kopier from 'app/components/kopier/Kopier';
import LabelValue from 'app/components/skjema/LabelValue';
import { IOMPUTSoknadKvittering } from '../../types/OMPUTSoknadKvittering';
import {
    formattereTidspunktFraUTCTilGMT,
    periodToFormattedString,
    sjekkPropertyEksistererOgIkkeErNull,
} from '../../../utils';
import { PunchFormPaneler } from '../../../models/enums/PunchFormPaneler';

interface IOwnProps {
    intl: any;
    response: IOMPUTSoknadKvittering;
    kopierJournalpostSuccess?: boolean;
    annenSokerIdent?: string | null;
}

export const OMPUTSoknadKvittering: React.FunctionComponent<IOwnProps> = ({
    intl,
    response,
    kopierJournalpostSuccess,
    annenSokerIdent,
}) => {
    countries.registerLocale(require('i18n-iso-countries/langs/nb.json'));

    const { journalposter, ytelse } = response;
    const visOpplysningerOmSoknad = sjekkPropertyEksistererOgIkkeErNull('mottattDato', response);

    return (
        <div className={classNames('OMPUTSoknadKvitteringContainer')}>
            <h2>{intlHelper(intl, 'skjema.kvittering.oppsummering')}</h2>
            {kopierJournalpostSuccess && (
                <div>
                    <h3>{intlHelper(intl, 'skjema.soknadskvittering.opprettetKopi')}</h3>
                    <hr className={classNames('linje')} />
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
                    <h3>{intlHelper(intl, PunchFormPaneler.OPPLYSINGER_OM_SOKNAD)}</h3>
                    <hr className={classNames('linje')} />
                    <p>
                        <b>{`${intlHelper(intl, 'skjema.mottakelsesdato')}: `}</b>
                        {`${periodToFormattedString(
                            response.mottattDato.substr(0, 10)
                        )}  ${formattereTidspunktFraUTCTilGMT(response.mottattDato)}`}
                    </p>
                </div>
            )}
            <div>
                <h3>{intlHelper(intl, PunchFormPaneler.ANNEN_FORELDER)}</h3>
                <hr className={classNames('linje')} />
                <p>
                    <LabelValue
                        text={`${intlHelper(intl, 'skjema.identitetsnummer')}:`}
                        value={ytelse.annenForelder.norskIdentitetsnummer}
                        retning="horisontal"
                    />
                </p>
                <p>
                    <LabelValue
                        text={`${intlHelper(intl, 'skjema.annenForelder.situasjonstype')}:`}
                        value={intlHelper(
                            intl,
                            `omsorgspenger.midlertidigAlene.situasjonstyper.${ytelse.annenForelder.situasjon}`
                        )}
                        retning="horisontal"
                    />
                </p>
                <p>
                    <LabelValue
                        text={`${intlHelper(intl, 'skjema.annenForelder.situasjonsbeskrivelse')}:`}
                        value={ytelse.annenForelder.situasjonBeskrivelse}
                        retning="horisontal"
                    />
                </p>
                <p>
                    <LabelValue
                        text={`${intlHelper(intl, 'skjema.annenForelder.periode')}:`}
                        value={periodToFormattedString(ytelse.annenForelder.periode)}
                        retning="horisontal"
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

export default connect(mapStateToProps)(OMPUTSoknadKvittering);
