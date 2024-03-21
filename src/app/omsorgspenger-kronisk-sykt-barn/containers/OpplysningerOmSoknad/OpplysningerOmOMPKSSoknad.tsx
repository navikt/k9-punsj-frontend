import React from 'react';

import { RadioPanelGruppe } from 'nav-frontend-skjema';
import { IntlShape } from 'react-intl';
import { Alert, Panel, TextField } from '@navikt/ds-react';
import DateInput from 'app/components/skjema/DateInput';
import { JaNeiIkkeRelevant } from '../../../models/enums/JaNeiIkkeRelevant';
import { PunchFormPaneler } from '../../../models/enums/PunchFormPaneler';
import intlHelper from '../../../utils/intlUtils';
import { OMPKSSoknad } from '../../types/OMPKSSoknad';

import './opplysningerOmOMPKSSoknad.less';

interface IOwnProps {
    intl: IntlShape;
    changeAndBlurUpdatesSoknad: (event: any) => any;
    getErrorMessage: (attribute: string, indeks?: number) => any;
    setSignaturAction: (signert: JaNeiIkkeRelevant | null) => void;
    signert: JaNeiIkkeRelevant | null;
    soknad: OMPKSSoknad;
}

const OpplysningerOmOMPKSSoknad: React.FunctionComponent<IOwnProps> = ({
    intl,
    changeAndBlurUpdatesSoknad,
    getErrorMessage,
    setSignaturAction,
    signert,
    soknad,
}) => (
    <Panel className="opplysningerOmOMPKSSoknad">
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
                label={intlHelper(intl, 'skjema.mottatt.klokkeslett')}
                {...changeAndBlurUpdatesSoknad((event: any) => ({
                    klokkeslett: event.target.value,
                }))}
                error={getErrorMessage('klokkeslett')}
                size="small"
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
export default OpplysningerOmOMPKSSoknad;
