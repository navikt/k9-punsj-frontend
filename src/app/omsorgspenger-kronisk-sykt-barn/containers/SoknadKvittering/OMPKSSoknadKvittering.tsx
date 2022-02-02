/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import {connect} from 'react-redux';
import intlHelper from 'app/utils/intlUtils';
import classNames from 'classnames';
import './ompKSSoknadKvittering.less';
import countries from 'i18n-iso-countries';
import {RootStateType} from 'app/state/RootState';
import Kopier from 'app/components/kopier/Kopier';
import {IOMPKSSoknadKvittering} from '../../types/OMPKSSoknadKvittering';
import {
    formattereTidspunktFraUTCTilGMT,
    periodToFormattedString,
    sjekkPropertyEksistererOgIkkeErNull
} from '../../../utils';
import {PunchFormPaneler} from '../../../models/enums/PunchFormPaneler';

interface IOwnProps {
    intl: any;
    response: IOMPKSSoknadKvittering;
    kopierJournalpostSuccess?: boolean;
    annenSokerIdent?: string | null;
}

export const OMPKSSoknadKvittering: React.FunctionComponent<IOwnProps> = (
    {
        intl,
        response,
        kopierJournalpostSuccess,
        annenSokerIdent,
    }) => {

    countries.registerLocale(require('i18n-iso-countries/langs/nb.json'));

    const {ytelse, journalposter} = response;
    const visOpplysningerOmSoknad = sjekkPropertyEksistererOgIkkeErNull('mottattDato', response);

    const visBarn = ytelse.barn !== null;

    return (
        <div className={classNames('OMPKSSoknadKvitteringContainer')}>
            <h2>{intlHelper(intl, 'skjema.kvittering.oppsummering')}</h2>
            {kopierJournalpostSuccess && (
                <div>
                    <h3>{intlHelper(intl, 'skjema.soknadskvittering.opprettetKopi')}</h3>
                    <hr className={classNames('linje')}/>
                    <p>{intlHelper(intl, 'skjema.soknadskvittering.opprettetKopi.innhold')}</p>
                    {annenSokerIdent && (
                        <p>
                            {`${intlHelper(intl, 'ident.identifikasjon.annenSoker')}: ${annenSokerIdent}`}
                            <Kopier verdi={annenSokerIdent}/>
                        </p>
                    )}
                </div>
            )}

            {visOpplysningerOmSoknad && (
                <div>
                    <h3>{intlHelper(intl, PunchFormPaneler.OPPLYSINGER_OM_SOKNAD)}</h3>
                    <hr className={classNames('linje')}/>
                    <p>
                        <b>{`${intlHelper(intl, 'skjema.mottakelsesdato')}: `}</b>
                        {`${periodToFormattedString(
                            response.mottattDato.substr(0, 10)
                        )}  ${formattereTidspunktFraUTCTilGMT(response.mottattDato)}`}
                    </p>
                </div>
            )}

            {visBarn && (
                <div>
                    <h3>{intlHelper(intl, PunchFormPaneler.OPPLYSNINGER_OM_BARN)}</h3>
                    <hr className={classNames('linje')} />
                    <p>
                        <b>{intlHelper(intl, 'skjema.barn.ident')} </b>
                        {ytelse.barn.norskIdentitetsnummer}
                    </p>
                    <p>
                        <b>{intlHelper(intl, 'skjema.felt.kroniskEllerFunksjonshemming')}</b>
                        {ytelse.kroniskEllerFunksjonshemming ? 'Ja' : 'Nei'}
                    </p>
                </div>
            )}

            <div>
                {!!journalposter && journalposter.length > 0 && (
                    <div>
                        <h3>{intlHelper(intl, 'skjema.soknadskvittering.tilleggsopplysninger')}</h3>
                        <hr className={classNames('linje')}/>
                        <p>
                            <b>{`${intlHelper(intl, 'skjema.medisinskeopplysninger')}: `}</b>
                            {`${journalposter[0].inneholderMedisinskeOpplysninger ? 'Ja' : 'Nei'}`}
                        </p>
                        <p>
                            <b>{`${intlHelper(intl, 'skjema.opplysningerikkepunsjet')}: `}</b>
                            {`${journalposter[0].inneholderInfomasjonSomIkkeKanPunsjes ? 'Ja' : 'Nei'}`}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
};

const mapStateToProps = (state: RootStateType) => ({
    kopierJournalpostSuccess: state.felles.kopierJournalpostSuccess,
    annenSokerIdent: state.identState.annenSokerIdent,
});

export default connect(mapStateToProps)(OMPKSSoknadKvittering);
