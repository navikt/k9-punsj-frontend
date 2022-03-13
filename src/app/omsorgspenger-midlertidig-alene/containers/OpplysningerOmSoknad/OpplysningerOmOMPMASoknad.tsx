/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { AlertStripeAdvarsel } from 'nav-frontend-alertstriper';
import Panel from 'nav-frontend-paneler';
import { Input, RadioPanelGruppe } from 'nav-frontend-skjema';
import { Heading, Alert } from '@navikt/ds-react';
import DateInput from 'app/components/skjema/DateInput';
import { IntlShape } from 'react-intl';
import VerticalSpacer from 'app/components/VerticalSpacer';
import { JaNeiIkkeRelevant } from '../../../models/enums/JaNeiIkkeRelevant';
import intlHelper from '../../../utils/intlUtils';
import { OMPMASoknad } from '../../types/OMPMASoknad';
import './opplysningerOmOMPMASoknad.less';

interface IOwnProps {
    intl: IntlShape;
    changeAndBlurUpdatesSoknad: (event: any) => any;
    getErrorMessage: (attribute: string, indeks?: number) => any;
    setSignaturAction: (signert: JaNeiIkkeRelevant | null) => void;
    signert: JaNeiIkkeRelevant | null;
    soknad: OMPMASoknad;
}

const OpplysningerOmOMPMASoknad: React.FunctionComponent<IOwnProps> = ({
    intl,
    changeAndBlurUpdatesSoknad,
    getErrorMessage,
    setSignaturAction,
    signert,
    soknad,
}) => (
    <>
        <Heading size="small">Omsorgsdager - Midlertidig alene om omsorgen</Heading>
        <VerticalSpacer sixteenPx />
        <Panel border>
            <Alert variant="info" className="alert">
                {intlHelper(intl, 'skjema.mottakelsesdato.informasjon')}
            </Alert>
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
        </Panel>
    </>
);
export default OpplysningerOmOMPMASoknad;
