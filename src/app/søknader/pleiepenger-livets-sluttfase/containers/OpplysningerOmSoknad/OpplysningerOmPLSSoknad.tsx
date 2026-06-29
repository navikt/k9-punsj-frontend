import React from 'react';

import { FormattedMessage } from 'react-intl';
import { Alert, Box, Heading, TextField, VStack } from '@navikt/ds-react';

import { LegacyJaNeiIkkeRelevantRadioGroup } from 'app/components/legacy-form-compat/radio';
import DatovelgerControlled from 'app/components/skjema/Datovelger/DatovelgerControlled';
import { useDeferredExternalError } from 'app/components/skjema/useDeferredExternalError';
import { JaNeiIkkeRelevant } from '../../../../models/enums/JaNeiIkkeRelevant';
import { PunchFormPaneler } from '../../../../models/enums/PunchFormPaneler';
import { PLSSoknad } from '../../types/PLSSoknad';

interface Props {
    signert: JaNeiIkkeRelevant | null;
    soknad: PLSSoknad;

    changeAndBlurUpdatesSoknad: (event: any) => any;
    getErrorMessage: (attribute: string, indeks?: number) => any;
    setSignaturAction: (signert: JaNeiIkkeRelevant | null) => void;
    showFieldErrorsAfterSubmit: boolean;
}

const OpplysningerOmPLSSoknad: React.FC<Props> = ({
    signert,
    soknad,
    changeAndBlurUpdatesSoknad,
    getErrorMessage,
    setSignaturAction,
    showFieldErrorsAfterSubmit,
}) => {
    const klokkeslettFieldProps = changeAndBlurUpdatesSoknad((event: any) => ({
        klokkeslett: event.target.value,
    }));
    const { deferredError: klokkeslettError, markBlurred: markKlokkeslettBlurred } = useDeferredExternalError(
        getErrorMessage('klokkeslett'),
        showFieldErrorsAfterSubmit,
    );

    return (
        <Box padding="space-16" borderWidth="1" borderRadius="8" className="opplysninger-om-soknaden-panel">
            <VStack gap="space-16">
                <Heading size="small" level="3">
                    <FormattedMessage id={PunchFormPaneler.OPPLYSINGER_OM_SOKNAD} />
                </Heading>

                <Alert size="small" variant="info">
                    <FormattedMessage id="skjema.mottakelsesdato.informasjon" />
                </Alert>

                <div className="input-row">
                    <DatovelgerControlled
                        value={soknad.mottattDato}
                        id="soknad-dato"
                        errorMessage={getErrorMessage('mottattDato')}
                        showExternalErrorAfterSubmit={showFieldErrorsAfterSubmit}
                        label={<FormattedMessage id="skjema.mottakelsesdato" />}
                        {...changeAndBlurUpdatesSoknad((selectedDate: any) => ({
                            mottattDato: selectedDate,
                        }))}
                    />

                    <div>
                        <TextField
                            value={soknad.klokkeslett || ''}
                            type="time"
                            className="klokkeslett"
                            label={<FormattedMessage id="skjema.mottatt.klokkeslett" />}
                            {...klokkeslettFieldProps}
                            onBlur={(event) => {
                                markKlokkeslettBlurred();
                                klokkeslettFieldProps.onBlur(event);
                            }}
                            error={klokkeslettError}
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
            </VStack>
        </Box>
    );
};
export default OpplysningerOmPLSSoknad;
