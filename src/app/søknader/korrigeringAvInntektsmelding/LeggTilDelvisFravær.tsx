import { ErrorMessage, Field, FieldArray, FieldProps, useFormikContext } from 'formik';
import React from 'react';
import { useIntl } from 'react-intl';

import { Alert, Fieldset, Panel, TextField } from '@navikt/ds-react';

import AddCircleSvg from 'app/assets/SVG/AddCircleSVG';
import BinSvg from 'app/assets/SVG/BinSVG';
import usePrevious from 'app/hooks/usePrevious';
import DatoMedTimetall from 'app/models/types/DatoMedTimetall';
import PanelProps from 'app/models/types/korrigeringAvInntektsmelding/Paneler';
import intlHelper from 'app/utils/intlUtils';

import DateInput from 'app/components/skjema/DateInput';
import EkspanderbartPanel from './EkspanderbartPanel';
import {
    KorrigeringAvInntektsmeldingFormFields,
    KorrigeringAvInntektsmeldingFormValues,
} from './KorrigeringAvInntektsmeldingFormFieldsValues';
import './LeggTilDelvisFravær.less';
import useFocus from './useFocus';

const LeggTilDelvisFravær: React.FC<PanelProps> = ({ isPanelOpen, togglePanel }): JSX.Element => {
    const intl = useIntl();
    const { values, setFieldValue } = useFormikContext<KorrigeringAvInntektsmeldingFormValues>();
    const datoInputRef = React.useRef<HTMLInputElement>(null);
    const currentListLength = values[KorrigeringAvInntektsmeldingFormFields.DagerMedDelvisFravær]?.length;
    const previousListLength = usePrevious(currentListLength);
    useFocus(currentListLength, previousListLength, datoInputRef);

    return (
        <EkspanderbartPanel
            label={intlHelper(intl, 'omsorgspenger.korrigeringAvInntektsmelding.leggTilDelvisFravær.checkbox')}
            isPanelOpen={isPanelOpen}
            togglePanel={togglePanel}
        >
            <Panel className="listepanel delvisFravaer">
                <FieldArray name={KorrigeringAvInntektsmeldingFormFields.DagerMedDelvisFravær}>
                    {({ push, remove }) => (
                        <>
                            <Fieldset
                                legend={
                                    <h4 className="korrigering-legend">
                                        {intlHelper(
                                            intl,
                                            'omsorgspenger.korrigeringAvInntektsmelding.leggTilDelvisFravær.legend',
                                        )}
                                    </h4>
                                }
                                className="korrigering__skjemagruppe"
                            >
                                <Alert size="small" variant="info" className="korrigering__infostripe">
                                    {intlHelper(
                                        intl,
                                        'omsorgspenger.korrigeringAvInntektsmelding.leggTilDelvisFravær.info',
                                    )}
                                </Alert>
                                <Panel className="delvisFravaer__inputContainer">
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
                                                                <DateInput
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
                                                                    label={intlHelper(intl, 'skjema.perioder.timer')}
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
                                                            {intlHelper(intl, 'skjema.liste.fjern_dag')}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        },
                                    )}
                                </Panel>
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
                                    {intlHelper(intl, 'skjema.dag.legg_til')}
                                </button>
                            </div>
                        </>
                    )}
                </FieldArray>
            </Panel>
        </EkspanderbartPanel>
    );
};

export default LeggTilDelvisFravær;
