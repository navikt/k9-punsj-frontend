import { RadioPanelGruppe } from 'nav-frontend-skjema';
import React from 'react';
import { IntlShape } from 'react-intl';

import { Alert, Panel, TextField } from '@navikt/ds-react';

import DateInput from 'app/components/skjema/DateInput';

import { JaNeiIkkeRelevant } from '../../../../models/enums/JaNeiIkkeRelevant';
import { PunchFormPaneler } from '../../../../models/enums/PunchFormPaneler';
import intlHelper from '../../../../utils/intlUtils';
import { PLSSoknad } from '../../types/PLSSoknad';
import './opplysningerOmPLSSoknad.less';

interface IOwnProps {
    intl: IntlShape;
    changeAndBlurUpdatesSoknad: (event: any) => any;
    getErrorMessage: (attribute: string, indeks?: number) => any;
    setSignaturAction: (signert: JaNeiIkkeRelevant | null) => void;
    signert: JaNeiIkkeRelevant | null;
    soknad: PLSSoknad;
}

const OpplysningerOmPLSSoknad: React.FunctionComponent<IOwnProps> = ({
    intl,
    changeAndBlurUpdatesSoknad,
    getErrorMessage,
    setSignaturAction,
    signert,
    soknad,
}) => (
    <Panel className="opplysningerOmSoknad">
        <h3>{intlHelper(intl, PunchFormPaneler.OPPLYSINGER_OM_SOKNAD)}</h3>
        <Alert size="small" variant="info">
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
            <TextField
                value={soknad.klokkeslett || ''}
                type="time"
                className="klokkeslett"
                size="small"
                label={intlHelper(intl, 'skjema.mottatt.klokkeslett')}
                {...changeAndBlurUpdatesSoknad((event: any) => ({
                    klokkeslett: event.target.value,
                }))}
                error={getErrorMessage('klokkeslett')}
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
            <Alert size="small" variant="warning">
                {intlHelper(intl, 'skjema.usignert.info')}
            </Alert>
        )}
    </Panel>
);
export default OpplysningerOmPLSSoknad;
