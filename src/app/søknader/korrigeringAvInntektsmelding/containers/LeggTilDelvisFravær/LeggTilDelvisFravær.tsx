import React, { useRef } from 'react';

import { PlusCircleIcon, TrashIcon } from '@navikt/aksel-icons';
import { Alert, Box, Button, Fieldset, Heading, TextField, VStack } from '@navikt/ds-react';
import FieldErrorMessages from 'app/components/skjema/FieldErrorMessages';
import { FieldArray, useField, useFormikContext } from 'formik';
import { FormattedMessage, useIntl } from 'react-intl';

import DatovelgerFormik from 'app/components/skjema/Datovelger/DatovelgerFormik';
import usePrevious from 'app/hooks/usePrevious';
import DatoMedTimetall from 'app/models/types/DatoMedTimetall';
import PanelProps from 'app/models/types/korrigeringAvInntektsmelding/Paneler';
import intlHelper from 'app/utils/intlUtils';
import EkspanderbartPanel from '../../../../components/EkspanderbartPanel';
import useFocus from '../../../../hooks/useFocus';
import {
    KorrigeringAvInntektsmeldingFormFields,
    KorrigeringAvInntektsmeldingFormValues,
} from '../../types/KorrigeringAvInntektsmeldingFormFieldsValues';
import { delvisFravaerDatoFieldId, delvisFravaerTimerFieldId } from '../formFieldIds';

interface DelvisFravaerRadProps {
    fieldName: string;
    index: number;
    onRemove: () => void;
}

const DelvisFravaerRad = ({ fieldName, index, onRemove }: DelvisFravaerRadProps) => {
    const intl = useIntl();
    const { submitCount } = useFormikContext<KorrigeringAvInntektsmeldingFormValues>();
    const datoFieldName = `${fieldName}.dato`;
    const timerFieldName = `${fieldName}.timer`;
    const datoFieldId = delvisFravaerDatoFieldId(index);
    const timerFieldId = delvisFravaerTimerFieldId(index);
    const datoErrorId = `${datoFieldId}-error`;
    const timerErrorId = `${timerFieldId}-error`;
    const [, datoMeta] = useField(datoFieldName);
    const [timerField, timerMeta] = useField(timerFieldName);
    const [datoLocalError, setDatoLocalError] = React.useState<string | undefined>(undefined);
    const datoErrorMessage =
        datoLocalError ||
        ((datoMeta.touched || submitCount > 0) && typeof datoMeta.error === 'string' ? datoMeta.error : undefined);
    const timerErrorMessage =
        (timerMeta.touched || submitCount > 0) && typeof timerMeta.error === 'string' ? timerMeta.error : undefined;

    return (
        <Box padding="space-16" borderRadius="8" background="neutral-soft">
            <div className="flex flex-col gap-2">
                <div className="flex items-end gap-4 flex-wrap">
                    <div className="flex gap-4 flex-wrap">
                        <DatovelgerFormik
                            name={datoFieldName}
                            className="dateInput"
                            id={datoFieldId}
                            label={intlHelper(intl, 'skjema.dato')}
                            visFeilmelding={false}
                            errorAriaDescribedBy={datoErrorMessage ? datoErrorId : undefined}
                            onErrorMessageChange={setDatoLocalError}
                        />

                        <TextField
                            {...timerField}
                            id={timerFieldId}
                            label={<FormattedMessage id="skjema.perioder.timer" />}
                            className="w-12"
                            error={!!timerErrorMessage}
                            aria-describedby={timerErrorMessage ? timerErrorId : undefined}
                        />
                    </div>

                    <div className="flex self-stretch items-end">
                        <Button
                            id="slett"
                            className="slett-knapp-med-icon-for-input"
                            type="button"
                            onClick={onRemove}
                            variant="tertiary"
                            icon={<TrashIcon title="slett" />}
                            data-color="danger"
                        >
                            <FormattedMessage id="skjema.liste.fjern_dag" />
                        </Button>
                    </div>
                </div>

                <FieldErrorMessages
                    items={[
                        {
                            id: datoErrorId,
                            label: intlHelper(intl, 'skjema.dato'),
                            message: datoErrorMessage,
                            ariaDescribedBy: datoFieldId,
                        },
                        {
                            id: timerErrorId,
                            label: intlHelper(intl, 'skjema.perioder.timer'),
                            message: timerErrorMessage,
                            ariaDescribedBy: timerFieldId,
                        },
                    ]}
                />
            </div>
        </Box>
    );
};

const LeggTilDelvisFravær: React.FC<PanelProps> = ({ isPanelOpen, togglePanel }): JSX.Element => {
    const intl = useIntl();

    const { values } = useFormikContext<KorrigeringAvInntektsmeldingFormValues>();

    const datoInputRef = useRef<HTMLInputElement>(null);
    const currentListLength = values[KorrigeringAvInntektsmeldingFormFields.DagerMedDelvisFravær]?.length;
    const previousListLength = usePrevious(currentListLength);

    useFocus(currentListLength, previousListLength, datoInputRef);

    return (
        <EkspanderbartPanel
            label={intlHelper(intl, 'omsorgspenger.korrigeringAvInntektsmelding.leggTilDelvisFravær.checkbox')}
            isPanelOpen={isPanelOpen}
            togglePanel={togglePanel}
        >
            <Box padding="space-16" borderRadius="8" borderWidth="1" className="listepanel pb-6">
                <FieldArray name={KorrigeringAvInntektsmeldingFormFields.DagerMedDelvisFravær}>
                    {({ push, remove }) => (
                        <>
                            <Fieldset
                                legend={
                                    <Heading size="small" level="3">
                                        <FormattedMessage id="omsorgspenger.korrigeringAvInntektsmelding.leggTilDelvisFravær.legend" />
                                    </Heading>
                                }
                                className="korrigering__skjemagruppe"
                            >
                                <Alert size="small" variant="info" className="korrigering__infostripe">
                                    <FormattedMessage id="omsorgspenger.korrigeringAvInntektsmelding.leggTilDelvisFravær.info" />
                                </Alert>

                                <div className="periodepanel">
                                    <VStack gap="space-16">
                                        {values[KorrigeringAvInntektsmeldingFormFields.DagerMedDelvisFravær]?.map(
                                            (value: DatoMedTimetall, index: number) => {
                                                const fieldName = `${KorrigeringAvInntektsmeldingFormFields.DagerMedDelvisFravær}.${index}`;

                                                return (
                                                    <DelvisFravaerRad
                                                        key={fieldName}
                                                        fieldName={fieldName}
                                                        index={index}
                                                        onRemove={() => {
                                                            remove(index);
                                                        }}
                                                    />
                                                );
                                            },
                                        )}

                                        <div className="flex flex-wrap">
                                            <Button
                                                id="leggTilDag"
                                                type="button"
                                                onClick={() => {
                                                    push({ dato: '', timer: '' });
                                                }}
                                                icon={<PlusCircleIcon title="leggTill" fontSize="2rem" color="#0067C5" />}
                                                size="small"
                                                variant="tertiary"
                                            >
                                                <FormattedMessage id="skjema.dag.legg_til" />
                                            </Button>
                                        </div>
                                    </VStack>
                                </div>
                            </Fieldset>
                        </>
                    )}
                </FieldArray>
            </Box>
        </EkspanderbartPanel>
    );
};

export default LeggTilDelvisFravær;
