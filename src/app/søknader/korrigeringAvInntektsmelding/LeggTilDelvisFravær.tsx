import React, { useRef } from 'react';

import { ErrorMessage, Field, FieldArray, FieldProps, useFormikContext } from 'formik';
import { FormattedMessage, useIntl } from 'react-intl';
import { Alert, Box, Fieldset, TextField } from '@navikt/ds-react';
import AddCircleSvg from 'app/assets/SVG/AddCircleSVG';
import BinSvg from 'app/assets/SVG/BinSVG';
import usePrevious from 'app/hooks/usePrevious';
import DatoMedTimetall from 'app/models/types/DatoMedTimetall';
import PanelProps from 'app/models/types/korrigeringAvInntektsmelding/Paneler';
import intlHelper from 'app/utils/intlUtils';
import EkspanderbartPanel from './EkspanderbartPanel';
import {
    KorrigeringAvInntektsmeldingFormFields,
    KorrigeringAvInntektsmeldingFormValues,
} from './KorrigeringAvInntektsmeldingFormFieldsValues';
import useFocus from './useFocus';
import NewDateInput from 'app/components/skjema/NewDateInput/NewDateInput';

import './LeggTilDelvisFravær.less';

const LeggTilDelvisFravær: React.FC<PanelProps> = ({ isPanelOpen, togglePanel }): JSX.Element => {
    const intl = useIntl();

    const { values, setFieldValue } = useFormikContext<KorrigeringAvInntektsmeldingFormValues>();

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
            <Box padding="4" borderWidth="1" borderRadius="small" className="listepanel delvisFravaer">
                <FieldArray name={KorrigeringAvInntektsmeldingFormFields.DagerMedDelvisFravær}>
                    {({ push, remove }) => (
                        <>
                            <Fieldset
                                legend={
                                    <h4 className="korrigering-legend">
                                        <FormattedMessage
                                            id={'omsorgspenger.korrigeringAvInntektsmelding.leggTilDelvisFravær.legend'}
                                        />
                                    </h4>
                                }
                                className="korrigering__skjemagruppe"
                            >
                                <Alert size="small" variant="info" className="korrigering__infostripe">
                                    <FormattedMessage
                                        id={'omsorgspenger.korrigeringAvInntektsmelding.leggTilDelvisFravær.info'}
                                    />
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
                                            const isLastElement =
                                                previousListLength < currentListLength &&
                                                index === currentListLength - 1;

                                            return (
                                                <div className="flex flex-wrap" key={fieldName}>
                                                    <div className="delvisFravaer__inputfelter">
                                                        <Field name={`${fieldName}.dato`}>
                                                            {({ field }: FieldProps) => (
                                                                <NewDateInput
                                                                    value={field.value}
                                                                    onChange={(dato) => {
                                                                        setFieldValue(field.name, dato);
                                                                    }}
                                                                    className="dateInput"
                                                                    label={intlHelper(intl, 'skjema.dato')}
                                                                    errorMessage={
                                                                        <ErrorMessage name={`${fieldName}.dato`} />
                                                                    }
                                                                    inputRef={isLastElement ? datoInputRef : undefined}
                                                                />
                                                            )}
                                                        </Field>

                                                        <Field name={`${fieldName}.timer`}>
                                                            {({ field, meta }: FieldProps) => (
                                                                <TextField
                                                                    {...field}
                                                                    label={
                                                                        <FormattedMessage
                                                                            id={'skjema.perioder.timer'}
                                                                        />
                                                                    }
                                                                    className="w-12"
                                                                    error={
                                                                        meta.error &&
                                                                        meta.touched && (
                                                                            <ErrorMessage name={`${fieldName}.timer`} />
                                                                        )
                                                                    }
                                                                />
                                                            )}
                                                        </Field>

                                                        <button
                                                            id="slett"
                                                            className="fjern"
                                                            type="button"
                                                            onClick={() => {
                                                                remove(index);
                                                            }}
                                                        >
                                                            <div className="slettIcon">
                                                                <BinSvg title="fjern" />
                                                            </div>

                                                            <FormattedMessage id={'skjema.liste.fjern_dag'} />
                                                        </button>
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
                                        <AddCircleSvg title="leggtil" />
                                    </div>

                                    <FormattedMessage id={'skjema.dag.legg_til'} />
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
