/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { connect } from 'react-redux';
import intlHelper from 'app/utils/intlUtils';
import classNames from 'classnames';
import { useIntl } from 'react-intl';
import { Alert } from '@navikt/ds-react';
import countries from 'i18n-iso-countries';
import { RootStateType } from 'app/state/RootState';
import Kopier from 'app/components/kopier/Kopier';
import { IOMPUTSoknadKvittering } from '../../types/OMPUTSoknadKvittering';
import {
    formattereTidspunktFraUTCTilGMT,
    periodToFormattedString,
    sjekkPropertyEksistererOgIkkeErNull,
} from '../../../utils';
import { PunchFormPaneler } from '../../../models/enums/PunchFormPaneler';
import './ompUtSoknadKvittering.less';

interface IOwnProps {
    kvittering?: IOMPUTSoknadKvittering;
    kopierJournalpostSuccess?: boolean;
    annenSokerIdent?: string | null;
}

export const OMPUTSoknadKvittering: React.FunctionComponent<IOwnProps> = ({
    kvittering,
    kopierJournalpostSuccess,
    annenSokerIdent,
}) => {
    countries.registerLocale(require('i18n-iso-countries/langs/nb.json'));
    const intl = useIntl();

    const { journalposter } = kvittering || {};
    const visOpplysningerOmSoknad = sjekkPropertyEksistererOgIkkeErNull('mottattDato', kvittering);

    if (!kvittering) {
        return <Alert variant="error">Noe gikk galt ved visning av kvittering</Alert>;
    }

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
                            kvittering.mottattDato.substr(0, 10)
                        )}  ${formattereTidspunktFraUTCTilGMT(kvittering.mottattDato)}`}
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

export default connect(mapStateToProps)(OMPUTSoknadKvittering);
