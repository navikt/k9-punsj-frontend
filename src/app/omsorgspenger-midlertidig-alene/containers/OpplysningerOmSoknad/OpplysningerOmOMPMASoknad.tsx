/* eslint-disable react/jsx-props-no-spreading */
import DateInput from 'app/components/skjema/DateInput';
import {AlertStripeAdvarsel, AlertStripeInfo} from 'nav-frontend-alertstriper';
import Panel from 'nav-frontend-paneler';
import {Input, RadioPanelGruppe, SkjemaGruppe} from 'nav-frontend-skjema';
import React from 'react';
import {IntlShape} from 'react-intl';
import {JaNeiIkkeRelevant} from '../../../models/enums/JaNeiIkkeRelevant';
import {PunchFormPaneler} from '../../../models/enums/PunchFormPaneler';
import intlHelper from '../../../utils/intlUtils';
import './opplysningerOmOMPMASoknad.less';
import {OMPMASoknad} from '../../types/OMPMASoknad';

interface IOwnProps {
    intl: IntlShape;
    changeAndBlurUpdatesSoknad: (event: any) => any;
    getErrorMessage: (attribute: string, indeks?: number) => any;
    setSignaturAction: (signert: JaNeiIkkeRelevant | null) => void;
    signert: JaNeiIkkeRelevant | null;
    soknad: OMPMASoknad;
}

const OpplysningerOmOMPMASoknad: React.FunctionComponent<IOwnProps> = (
    {
        intl,
        changeAndBlurUpdatesSoknad,
        getErrorMessage,
        setSignaturAction,
        signert,
        soknad
    }) => (
    <Panel className="opplysningerOmOMPMASoknad">
        <h3>{intlHelper(intl, PunchFormPaneler.OPPLYSINGER_OM_SOKNAD)}</h3>
        <AlertStripeInfo>{intlHelper(intl, 'skjema.mottakelsesdato.informasjon')}</AlertStripeInfo>
        <SkjemaGruppe>
            <div className="input-row">
                <DateInput
                    value={soknad.mottattDato}
                    id="soknad-dato"
                    errorMessage={getErrorMessage('mottattDato')}
                    label={intlHelper(intl, 'skjema.mottakelsesdato')}
                    {...changeAndBlurUpdatesSoknad((selectedDate: any) => ({
                        mottattDato: selectedDate,
                    }))}
                />
                <Input
                    value={soknad.klokkeslett || ''}
                    type="time"
                    className="klokkeslett"
                    label={intlHelper(intl, 'skjema.mottatt.klokkeslett')}
                    {...changeAndBlurUpdatesSoknad((event: any) => ({
                        klokkeslett: event.target.value,
                    }))}
                    feil={getErrorMessage('klokkeslett')}
                />
            </div>
            <RadioPanelGruppe
                className="horizontalRadios"
                radios={Object.values(JaNeiIkkeRelevant).map((jn) => ({
                    label: intlHelper(intl, jn),
                    value: jn,
                }))}
                name="signatur"
                legend={intlHelper(intl, 'ident.signatur.etikett')}
                checked={signert || undefined}
                onChange={(event) =>
                    setSignaturAction(((event.target as HTMLInputElement).value as JaNeiIkkeRelevant) || null)
                }
            />
            {signert === JaNeiIkkeRelevant.NEI && (
                <AlertStripeAdvarsel>{intlHelper(intl, 'skjema.usignert.info')}</AlertStripeAdvarsel>
            )}
        </SkjemaGruppe>
    </Panel>
);
export default OpplysningerOmOMPMASoknad;
