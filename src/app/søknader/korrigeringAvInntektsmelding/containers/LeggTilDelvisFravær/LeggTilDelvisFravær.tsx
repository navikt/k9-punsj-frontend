import React, { useRef } from 'react';

import { PlusCircleIcon, TrashIcon } from '@navikt/aksel-icons';
import { Alert, Box, Button, Fieldset, TextField, VStack } from '@navikt/ds-react';
import { ErrorMessage, Field, FieldArray, FieldProps, useFormikContext } from 'formik';
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

import './LeggTilDelvisFravær.css';

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
            <Box
                padding="space-16"
                borderRadius="8"
                borderWidth="1"
                className="korrigering__panelsurface listepanel delvisFravaer"
            >
                <FieldArray name={KorrigeringAvInntektsmeldingFormFields.DagerMedDelvisFravær}>
                    {({ push, remove }) => (
                        <>
                            <Fieldset
                                legend={
                                    <h4 className="korrigering-legend">
                                        <FormattedMessage id="omsorgspenger.korrigeringAvInntektsmelding.leggTilDelvisFravær.legend" />
                                    </h4>
                                }
                                className="korrigering__skjemagruppe"
                            >
                                <Alert size="small" variant="info" className="korrigering__infostripe">
                                    <FormattedMessage id="omsorgspenger.korrigeringAvInntektsmelding.leggTilDelvisFravær.info" />
                                </Alert>

                                <VStack gap="space-16">
                                    {values[KorrigeringAvInntektsmeldingFormFields.DagerMedDelvisFravær]?.map(
                                        (value: DatoMedTimetall, index: number) => {
                                            const fieldName = `${KorrigeringAvInntektsmeldingFormFields.DagerMedDelvisFravær}.${index}`;

                                            return (
                                                <Box
                                                    key={fieldName}
                                                    padding="space-16"
                                                    borderRadius="8"
                                                    background="neutral-soft"
                                                >
                                                    <div className="flex flex-wrap">
                                                        <div className="input-row">
                                                            <DatovelgerFormik
                                                                name={`${fieldName}.dato`}
                                                                className="dateInput"
                                                                id={delvisFravaerDatoFieldId(index)}
                                                                label={intlHelper(intl, 'skjema.dato')}
                                                            />

                                                            <div className="ml-2">
                                                                <Field name={`${fieldName}.timer`}>
                                                                    {({ field, meta }: FieldProps) => (
                                                                        <TextField
                                                                            {...field}
                                                                            id={delvisFravaerTimerFieldId(index)}
                                                                            label={
                                                                                <FormattedMessage id="skjema.perioder.timer" />
                                                                            }
                                                                            className="w-12"
                                                                            error={
                                                                                meta.error &&
                                                                                meta.touched && (
                                                                                    <ErrorMessage
                                                                                        name={`${fieldName}.timer`}
                                                                                    />
                                                                                )
                                                                            }
                                                                        />
                                                                    )}
                                                                </Field>
                                                            </div>
                                                            <div className="ml-2">
                                                                <Button
                                                                    id="slett"
                                                                    className="slett-knapp-med-icon-for-input !mt-10"
                                                                    type="button"
                                                                    onClick={() => {
                                                                        remove(index);
                                                                    }}
                                                                    variant="tertiary"
                                                                    icon={<TrashIcon title="slett" />}
                                                                >
                                                                    <FormattedMessage id="skjema.liste.fjern_dag" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Box>
                                            );
                                        },
                                    )}
                                </VStack>
                            </Fieldset>

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
                        </>
                    )}
                </FieldArray>
            </Box>
        </EkspanderbartPanel>
    );
};

export default LeggTilDelvisFravær;
