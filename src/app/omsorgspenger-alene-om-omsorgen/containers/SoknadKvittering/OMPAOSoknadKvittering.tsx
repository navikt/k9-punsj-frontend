/* eslint-disable global-require */

/* eslint-disable @typescript-eslint/no-var-requires */
import classNames from 'classnames';
import countries from 'i18n-iso-countries';
import React from 'react';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';

import { Alert } from '@navikt/ds-react';

import { RootStateType } from 'app/state/RootState';
import intlHelper from 'app/utils/intlUtils';

import { PunchFormPaneler } from '../../../models/enums/PunchFormPaneler';
import { formattereTidspunktFraUTCTilGMT, periodToFormattedString } from '../../../utils';
import { IOMPAOSoknadKvittering } from '../../types/OMPAOSoknadKvittering';
import './OMPAOSoknadKvittering.less';

interface IOwnProps {
    kvittering?: IOMPAOSoknadKvittering;
}

export const OMPAOSoknadKvittering: React.FunctionComponent<IOwnProps> = ({ kvittering }) => {
    countries.registerLocale(require('i18n-iso-countries/langs/nb.json'));
    const intl = useIntl();

    const { journalposter, mottattDato } = kvittering || {};

    if (!kvittering) {
        return <Alert variant="error">Noe gikk galt ved visning av kvittering</Alert>;
    }

    return (
        <div className={classNames('OMPAOSoknadKvitteringContainer')}>
            <h2>{intlHelper(intl, 'skjema.kvittering.oppsummering')}</h2>
            {mottattDato && (
                <div>
                    <h3>{intlHelper(intl, PunchFormPaneler.OPPLYSINGER_OM_SOKNAD)}</h3>
                    <hr className={classNames('linje')} />
                    <p>
                        <b>{`${intlHelper(intl, 'skjema.mottakelsesdato')}: `}</b>
                        {`${periodToFormattedString(
                            kvittering.mottattDato.substr(0, 10),
                        )}  ${formattereTidspunktFraUTCTilGMT(kvittering.mottattDato)}`}
                    </p>
                </div>
            )}
            <div>
                <h3>{intlHelper(intl, PunchFormPaneler.ARBEID)}</h3>
                <hr className={classNames('linje')} />
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

export default connect(mapStateToProps)(OMPAOSoknadKvittering);
