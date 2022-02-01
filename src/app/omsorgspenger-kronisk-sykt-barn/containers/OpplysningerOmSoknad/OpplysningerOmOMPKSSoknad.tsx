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
import './opplysningerOmOMPKSSoknad.less';
import {OMPKSSoknad} from '../../../models/types/omsorgspenger-kronisk-sykt-barn/OMPKSSoknad';
import {JaNei} from '../../../models/enums';

interface IOwnProps {
    intl: IntlShape;
    changeAndBlurUpdatesSoknad: (event: any) => any;
    getErrorMessage: (attribute: string, indeks?: number) => any;
    setSignaturAction: (signert: JaNeiIkkeRelevant | null) => void;
    signert: JaNeiIkkeRelevant | null;
    soknad: OMPKSSoknad;
}

const OpplysningerOmOMPKSSoknad: React.FunctionComponent<IOwnProps> = (
    {
        intl,
        changeAndBlurUpdatesSoknad,
        getErrorMessage,
        setSignaturAction,
        signert,
        soknad
    }) => (
    <Panel className="opplysningerOmOMPKSSoknad">
        <h3>Omsorgspenger KS!!!!</h3>
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
            <div className="input-row">
                <RadioPanelGruppe
                    className="horizontalRadios"
                    radios={Object.values(JaNei).map((jn) => ({
                        label: intlHelper(intl, jn),
                        value: jn,
                    }))}
                    name="kroniskEllerFunksjonshemming"
                    legend={intlHelper(intl, 'skjema.felt.kroniskEllerFunksjonshemming')}
                    checked={
                        soknad.kroniskEllerFunksjonshemming && soknad.kroniskEllerFunksjonshemming ? JaNei.JA : JaNei.NEI
                    }
                    {...changeAndBlurUpdatesSoknad((event: any) => {
                        const jaNei = (event.target as HTMLInputElement).value as JaNei;
                        return ({kroniskEllerFunksjonshemming: jaNei === JaNei.JA});
                    })}
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
export default OpplysningerOmOMPKSSoknad;
