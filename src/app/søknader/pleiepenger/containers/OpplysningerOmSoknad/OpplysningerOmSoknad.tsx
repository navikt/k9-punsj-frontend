import React from 'react';

import { RadioPanelGruppe } from 'nav-frontend-skjema';
import { IntlShape } from 'react-intl';
import { Alert, Box, Fieldset, TextField } from '@navikt/ds-react';
import { JaNeiIkkeRelevant } from '../../../../models/enums/JaNeiIkkeRelevant';
import { PunchFormPaneler } from '../../../../models/enums/PunchFormPaneler';
import { PSBSoknad } from '../../../../models/types';
import intlHelper from '../../../../utils/intlUtils';
import NewDateInput from 'app/components/skjema/NewDateInput/NewDateInput';

import './opplysningerOmSoknad.less';

interface IOwnProps {
    intl: IntlShape;
    changeAndBlurUpdatesSoknad: (event: any) => any;
    getErrorMessage: (attribute: string, indeks?: number) => any;
    setSignaturAction: (signert: JaNeiIkkeRelevant | null) => void;
    signert: JaNeiIkkeRelevant | null;
    soknad: PSBSoknad;
}

const OpplysningerOmSoknad: React.FunctionComponent<IOwnProps> = ({
    intl,
    changeAndBlurUpdatesSoknad,
    getErrorMessage,
    setSignaturAction,
    signert,
    soknad,
}) => (
    <Box padding="4" borderWidth="1" borderRadius="small" className="opplysningerOmSoknad">
        <h3>{intlHelper(intl, PunchFormPaneler.OPPLYSINGER_OM_SOKNAD)}</h3>
        <Alert size="small" variant="info">
            {intlHelper(intl, 'skjema.mottakelsesdato.informasjon')}
        </Alert>
        <Fieldset legend="">
            <div className="input-row">
                <NewDateInput
                    value={soknad.mottattDato}
                    id="soknad-dato"
                    errorMessage={getErrorMessage('mottattDato')}
                    label={intlHelper(intl, 'skjema.mottakelsesdato')}
                    {...changeAndBlurUpdatesSoknad((selectedDate: any) => ({
                        mottattDato: selectedDate,
                    }))}
                    dataTestId="mottattDato"
                />
                <div>
                    <TextField
                        value={soknad.klokkeslett || ''}
                        type="time"
                        className="klokkeslett"
                        // size="small"
                        label={intlHelper(intl, 'skjema.mottatt.klokkeslett')}
                        {...changeAndBlurUpdatesSoknad((event: any) => ({
                            klokkeslett: event.target.value,
                        }))}
                        error={getErrorMessage('klokkeslett')}
                    />
                </div>
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
        </Fieldset>
    </Box>
);
export default OpplysningerOmSoknad;
