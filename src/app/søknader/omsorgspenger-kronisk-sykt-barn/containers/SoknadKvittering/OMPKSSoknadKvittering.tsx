import classNames from 'classnames';
import countries from 'i18n-iso-countries';
import React from 'react';
import { connect } from 'react-redux';
import { useIntl } from 'react-intl';

import Kopier from 'app/components/kopier/Kopier';
import { RootStateType } from 'app/state/RootState';
import intlHelper from 'app/utils/intlUtils';

import { PunchFormPaneler } from '../../../../models/enums/PunchFormPaneler';
import {
    formattereDatoFraUTCTilGMT,
    formattereTidspunktFraUTCTilGMT,
    sjekkPropertyEksistererOgIkkeErNull,
} from '../../../../utils';
import { IOMPKSSoknadKvittering } from '../../types/OMPKSSoknadKvittering';
import './ompKSSoknadKvittering.less';

interface IOwnProps {
    response: IOMPKSSoknadKvittering;
    kopierJournalpostSuccess?: boolean;
    annenSokerIdent?: string | null;
}

export const OMPKSSoknadKvittering: React.FunctionComponent<IOwnProps> = ({
    response,
    kopierJournalpostSuccess,
    annenSokerIdent,
}) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    countries.registerLocale(require('i18n-iso-countries/langs/nb.json'));

    const { journalposter } = response;
    const visOpplysningerOmSoknad = sjekkPropertyEksistererOgIkkeErNull('mottattDato', response);
    const intl = useIntl();

    return (
        <div className={classNames('OMPKSSoknadKvitteringContainer')}>
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
                        {`${formattereDatoFraUTCTilGMT(response.mottattDato)} - ${formattereTidspunktFraUTCTilGMT(
                            response.mottattDato,
                        )}`}
                    </p>
                </div>
            )}

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

export default connect(mapStateToProps)(OMPKSSoknadKvittering);
