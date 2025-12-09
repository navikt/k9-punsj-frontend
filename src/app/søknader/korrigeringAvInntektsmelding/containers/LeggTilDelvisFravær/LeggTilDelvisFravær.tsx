import React, { useRef } from 'react';

import { ErrorMessage, Field, FieldArray, FieldProps, useFormikContext } from 'formik';
import { FormattedMessage, useIntl } from 'react-intl';
import { Alert, Box, Button, Fieldset, TextField } from '@navikt/ds-react';
import { PlusCircleIcon, TrashIcon } from '@navikt/aksel-icons';

import usePrevious from 'app/hooks/usePrevious';
import DatoMedTimetall from 'app/models/types/DatoMedTimetall';
import PanelProps from 'app/models/types/korrigeringAvInntektsmelding/Paneler';
import intlHelper from 'app/utils/intlUtils';
import EkspanderbartPanel from '../../../../components/EkspanderbartPanel';
import {
    KorrigeringAvInntektsmeldingFormFields,
    KorrigeringAvInntektsmeldingFormValues,
} from '../../types/KorrigeringAvInntektsmeldingFormFieldsValues';
import useFocus from '../../../../hooks/useFocus';
import DatovelgerFormik from 'app/components/skjema/Datovelger/DatovelgerFormik';

import './LeggTilDelvisFravær.less';

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
            <Box className="listepanel delvisFravaer">
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

                                <Box
                                    padding="4"
                                    borderWidth="1"
                                    borderRadius="small"
                                    className="delvisFravaer__inputContainer"
                                >
                                    {values[KorrigeringAvInntektsmeldingFormFields.DagerMedDelvisFravær]?.map(
                                        (value: DatoMedTimetall, index: number) => {
                                            const fieldName = `${KorrigeringAvInntektsmeldingFormFields.DagerMedDelvisFravær}.${index}`;

                                            return (
                                                <div className="flex flex-wrap" key={fieldName}>
                                                    <div className="input-row">
                                                        <Field name={`${fieldName}.dato`}>
                                                            {({ field }: FieldProps) => (
                                                                <DatovelgerFormik
                                                                    {...field}
                                                                    className="dateInput"
                                                                    label={intlHelper(intl, 'skjema.dato')}
                                                                />
                                                            )}
                                                        </Field>

                                                        <div className="ml-2">
                                                            <Field name={`${fieldName}.timer`}>
                                                                {({ field, meta }: FieldProps) => (
                                                                    <TextField
                                                                        {...field}
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
                                            );
                                        },
                                    )}
                                </Box>
                            </Fieldset>

                            <div className="flex flex-wrap">
                                <button
                                    id="leggTilDag"
                                    className="leggtilperiode"
                                    type="button"
                                    onClick={() => {
                                        push({ dato: '', timer: '' });
                                    }}
                                >
                                    <div className="leggtilperiodeIcon">
                                        <PlusCircleIcon title="leggTill" fontSize="2rem" color="#0067C5" />
                                    </div>

                                    <FormattedMessage id="skjema.dag.legg_til" />
                                </button>
                            </div>
                        </>
                    )}
                </FieldArray>
            </Box>
        </EkspanderbartPanel>
    );
};

export default LeggTilDelvisFravær;
