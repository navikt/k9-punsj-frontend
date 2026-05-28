import React from 'react';

import { FormattedMessage, IntlShape } from 'react-intl';
import { Alert, Box, Heading, TextField, VStack } from '@navikt/ds-react';
import DatovelgerControlled from 'app/components/skjema/Datovelger/DatovelgerControlled';
import { LegacyJaNeiIkkeRelevantRadioGroup } from 'app/components/legacy-form-compat/radio';
import { JaNeiIkkeRelevant } from '../../../../models/enums/JaNeiIkkeRelevant';
import { PunchFormPaneler } from '../../../../models/enums/PunchFormPaneler';
import intlHelper from '../../../../utils/intlUtils';
import { OMPKSSoknad } from '../../types/OMPKSSoknad';

interface Props {
    intl: IntlShape;
    changeAndBlurUpdatesSoknad: (event: any) => any;
    getErrorMessage: (attribute: string, indeks?: number) => any;
    setSignaturAction: (signert: JaNeiIkkeRelevant | null) => void;
    signert: JaNeiIkkeRelevant | null;
    soknad: OMPKSSoknad;
}

const OpplysningerOmOMPKSSoknad: React.FC<Props> = ({
    intl,
    changeAndBlurUpdatesSoknad,
    getErrorMessage,
    setSignaturAction,
    signert,
    soknad,
}: Props) => (
    <Box
        padding="space-16"
        borderWidth="1"
        borderRadius="2"
        className="opplysninger-om-soknaden-panel opplysningerOmOMPKSSoknad"
    >
        <VStack gap="space-16">
            <Heading size="small" level="3">
                <FormattedMessage id={PunchFormPaneler.OPPLYSINGER_OM_SOKNAD} />
            </Heading>

            <Alert size="small" variant="info">
                <FormattedMessage id={'skjema.mottakelsesdato.informasjon'} />
            </Alert>

            <div className="input-row">
                <DatovelgerControlled
                    value={soknad.mottattDato}
                    id="soknad-dato"
                    errorMessage={getErrorMessage('mottattDato')}
                    label={intlHelper(intl, 'skjema.mottakelsesdato')}
                    {...changeAndBlurUpdatesSoknad((selectedDate: any) => ({
                        mottattDato: selectedDate,
                    }))}
                />
                <div>
                    <TextField
                        value={soknad.klokkeslett || ''}
                        type="time"
                        className="klokkeslett"
                        label={intlHelper(intl, 'skjema.mottatt.klokkeslett')}
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
                legend={intlHelper(intl, 'ident.signatur.etikett')}
                checked={signert || undefined}
                onChange={(_, value) => setSignaturAction(value || null)}
            />

            {signert === JaNeiIkkeRelevant.NEI && (
                <Alert size="small" variant="warning">
                    <FormattedMessage id={'skjema.usignert.info'} />
                </Alert>
            )}
        </VStack>
    </Box>
);
export default OpplysningerOmOMPKSSoknad;
