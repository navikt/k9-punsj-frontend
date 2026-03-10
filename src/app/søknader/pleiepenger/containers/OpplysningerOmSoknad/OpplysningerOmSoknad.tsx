import React from 'react';

import { FormattedMessage } from 'react-intl';
import { Alert, Box, Heading, TextField } from '@navikt/ds-react';

import { LegacyJaNeiIkkeRelevantRadioGroup } from 'app/components/legacy-form-compat/radio';
import { JaNeiIkkeRelevant } from '../../../../models/enums/JaNeiIkkeRelevant';
import { PunchFormPaneler } from '../../../../models/enums/PunchFormPaneler';
import { PSBSoknad } from '../../../../models/types';
import NewDateInput from 'app/components/skjema/NewDateInput/NewDateInput';

interface Props {
    signert: JaNeiIkkeRelevant | null;
    soknad: PSBSoknad;

    changeAndBlurUpdatesSoknad: (event: any) => any;
    getErrorMessage: (attribute: string, indeks?: number) => any;
    setSignaturAction: (signert: JaNeiIkkeRelevant | null) => void;
}

const OpplysningerOmSoknad: React.FC<Props> = ({
    signert,
    soknad,
    changeAndBlurUpdatesSoknad,
    getErrorMessage,
    setSignaturAction,
}) => (
    <Box padding="4" borderWidth="1" borderRadius="small">
        <div className="mb-4">
            <Heading size="small" level="3">
                <FormattedMessage id={PunchFormPaneler.OPPLYSINGER_OM_SOKNAD} />
            </Heading>
        </div>

        <Alert size="small" variant="info">
            <FormattedMessage id="skjema.mottakelsesdato.informasjon" />
        </Alert>

        <div className="input-row">
            <NewDateInput
                value={soknad.mottattDato}
                id="soknad-dato"
                errorMessage={getErrorMessage('mottattDato')}
                label={<FormattedMessage id="skjema.mottakelsesdato" />}
                {...changeAndBlurUpdatesSoknad((selectedDate: any) => ({
                    mottattDato: selectedDate,
                }))}
                dataTestId="mottattDato"
            />

            <div>
                <TextField
                    id="soknad-klokkeslett"
                    value={soknad.klokkeslett || ''}
                    type="time"
                    className="klokkeslett"
                    label={<FormattedMessage id="skjema.mottatt.klokkeslett" />}
                    {...changeAndBlurUpdatesSoknad((event: any) => ({
                        klokkeslett: event.target.value,
                    }))}
                    error={getErrorMessage('klokkeslett')}
                />
            </div>
        </div>

        <LegacyJaNeiIkkeRelevantRadioGroup
            className="horizontalRadios"
            name="signatur"
            legend={<FormattedMessage id="ident.signatur.etikett" />}
            checked={signert || undefined}
            onChange={(_, value) => setSignaturAction(value || null)}
        />

        {signert === JaNeiIkkeRelevant.NEI && (
            <Alert size="small" variant="warning">
                <FormattedMessage id="skjema.usignert.info" />
            </Alert>
        )}
    </Box>
);
export default OpplysningerOmSoknad;
