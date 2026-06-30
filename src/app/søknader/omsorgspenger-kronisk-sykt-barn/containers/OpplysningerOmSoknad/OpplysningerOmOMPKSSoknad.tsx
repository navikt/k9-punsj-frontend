import React from 'react';

import { FormattedMessage, IntlShape } from 'react-intl';
import { Alert, Box, Heading, TextField, VStack } from '@navikt/ds-react';
import FieldErrorMessages from 'app/components/skjema/FieldErrorMessages';
import Datovelger from 'app/components/skjema/Datovelger/Datovelger';
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
    showValidationErrors: boolean;
}

const OpplysningerOmOMPKSSoknad: React.FC<Props> = ({
    intl,
    changeAndBlurUpdatesSoknad,
    getErrorMessage,
    setSignaturAction,
    signert,
    soknad,
    showValidationErrors,
}: Props) => {
    const [dateLocalError, setDateLocalError] = React.useState<string | undefined>(undefined);
    const [showDateError, setShowDateError] = React.useState(false);
    const [showTimeError, setShowTimeError] = React.useState(false);
    const mottattDatoErrorId = 'soknad-dato-error';
    const klokkeslettErrorId = 'soknad-klokkeslett-error';
    const dateFieldHandlers = changeAndBlurUpdatesSoknad((selectedDate: any) => ({
        mottattDato: selectedDate,
    }));
    const timeFieldHandlers = changeAndBlurUpdatesSoknad((event: any) => ({
        klokkeslett: event.target.value,
    }));
    const dateValidationMessage = showValidationErrors || showDateError ? getErrorMessage('mottattDato') : undefined;
    const timeValidationMessage = showValidationErrors || showTimeError ? getErrorMessage('klokkeslett') : undefined;
    const mottattDatoErrorMessage = dateLocalError || dateValidationMessage;
    const klokkeslettErrorMessage = timeValidationMessage;

    return (
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

            <div className="flex flex-col gap-2">
                <div className="input-row">
                    <Datovelger
                        value={soknad.mottattDato}
                        id="soknad-dato"
                        errorMessage={!!mottattDatoErrorMessage}
                        label={intlHelper(intl, 'skjema.mottakelsesdato')}
                        visFeilmelding={false}
                        errorAriaDescribedBy={mottattDatoErrorMessage ? mottattDatoErrorId : undefined}
                        onErrorMessageChange={setDateLocalError}
                        onChange={(selectedDate) => {
                            setShowDateError(false);
                            dateFieldHandlers.onChange(selectedDate);
                        }}
                        onBlur={(selectedDate) => {
                            setShowDateError(true);
                            dateFieldHandlers.onBlur(selectedDate);
                        }}
                    />
                    <div>
                        <TextField
                            id="soknad-klokkeslett"
                            value={soknad.klokkeslett || ''}
                            type="time"
                            className="klokkeslett"
                            label={intlHelper(intl, 'skjema.mottatt.klokkeslett')}
                            onChange={(event) => {
                                setShowTimeError(false);
                                timeFieldHandlers.onChange(event);
                            }}
                            onBlur={(event) => {
                                setShowTimeError(true);
                                timeFieldHandlers.onBlur(event);
                            }}
                            error={!!klokkeslettErrorMessage}
                            aria-describedby={klokkeslettErrorMessage ? klokkeslettErrorId : undefined}
                        />
                    </div>
                </div>
                <FieldErrorMessages
                    items={[
                        {
                            id: mottattDatoErrorId,
                            label: intlHelper(intl, 'skjema.mottakelsesdato'),
                            message: mottattDatoErrorMessage,
                            ariaDescribedBy: 'soknad-dato',
                        },
                        {
                            id: klokkeslettErrorId,
                            label: intlHelper(intl, 'skjema.mottatt.klokkeslett'),
                            message: klokkeslettErrorMessage,
                            ariaDescribedBy: 'soknad-klokkeslett',
                        },
                    ]}
                />
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
};
export default OpplysningerOmOMPKSSoknad;
