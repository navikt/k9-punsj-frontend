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
import { aktivitetsFravær } from 'app/omsorgspenger-utbetaling/konstanter';
import { IOMPUTSoknadKvittering } from '../../types/OMPUTSoknadKvittering';
import { formattereTidspunktFraUTCTilGMT, periodToFormattedString } from '../../../utils';
import { PunchFormPaneler } from '../../../models/enums/PunchFormPaneler';
import './ompUtSoknadKvittering.less';
import FravaersperiodeKvittering from './FravaersperiodeKvittering';

interface IOwnProps {
    kvittering?: IOMPUTSoknadKvittering;
}

export const OMPUTSoknadKvittering: React.FunctionComponent<IOwnProps> = ({ kvittering }) => {
    countries.registerLocale(require('i18n-iso-countries/langs/nb.json'));
    const intl = useIntl();

    const { journalposter, mottattDato } = kvittering || {};

    if (!kvittering) {
        return <Alert variant="error">Noe gikk galt ved visning av kvittering</Alert>;
    }
    const arbeidstakerFravaersperioder = kvittering.ytelse.fraværsperioder.filter((periode) =>
        periode.aktivitetFravær.includes(aktivitetsFravær.ARBEIDSTAKER)
    );
    const frilanserFravaersperioder = kvittering.ytelse.fraværsperioder.filter((periode) =>
        periode.aktivitetFravær.includes(aktivitetsFravær.FRILANSER)
    );
    const selvstendigNaeringsdrivendeFravaersperioder = kvittering.ytelse.fraværsperioder.filter((periode) =>
        periode.aktivitetFravær.includes(aktivitetsFravær.SELVSTENDIG_NÆRINGSDRIVENDE)
    );

    return (
        <div className={classNames('OMPUTSoknadKvitteringContainer')}>
            <h2>{intlHelper(intl, 'skjema.kvittering.oppsummering')}</h2>
            {mottattDato && (
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
                <h3>{intlHelper(intl, PunchFormPaneler.ARBEID)}</h3>
                <hr className={classNames('linje')} />
                {!!arbeidstakerFravaersperioder.length && (
                    <>
                        <h3>{intlHelper(intl, 'arbeidstaker')}</h3>
                        {arbeidstakerFravaersperioder.map((periode) => (
                            <FravaersperiodeKvittering key={periode.periode} periode={periode} />
                        ))}
                    </>
                )}
                {!!frilanserFravaersperioder.length && (
                    <>
                        <h3>{intlHelper(intl, 'frilanser')}</h3>
                        {frilanserFravaersperioder.map((periode) => (
                            <FravaersperiodeKvittering key={periode.periode} periode={periode} />
                        ))}
                    </>
                )}
                {!!selvstendigNaeringsdrivendeFravaersperioder.length && (
                    <>
                        <h3>{intlHelper(intl, 'selvstendig')}</h3>
                        {selvstendigNaeringsdrivendeFravaersperioder.map((periode) => (
                            <FravaersperiodeKvittering key={periode.periode} periode={periode} />
                        ))}
                    </>
                )}
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
