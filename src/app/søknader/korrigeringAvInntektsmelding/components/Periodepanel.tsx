import React, { useRef } from 'react';

import { ErrorMessage, Field, FieldArray, FieldProps, FormikValues, useFormikContext } from 'formik';
import { FormattedMessage, useIntl } from 'react-intl';
import { Box } from '@navikt/ds-react';
import AddCircleSvg from 'app/assets/SVG/AddCircleSVG';
import { TrashIcon } from '@navikt/aksel-icons';
import { PeriodInput } from 'app/components/period-input/PeriodInput';
import usePrevious from 'app/hooks/usePrevious';
import { IPeriode } from 'app/models/types';

import {
    KorrigeringAvInntektsmeldingFormFields,
    KorrigeringAvInntektsmeldingFormValues,
} from '../types/KorrigeringAvInntektsmeldingFormFieldsValues';
import useFocus from '../../../hooks/useFocus';

export interface IPeriodepanelerProps {
    name:
        | KorrigeringAvInntektsmeldingFormFields.PerioderMedRefusjonskrav
        | KorrigeringAvInntektsmeldingFormFields.Trekkperioder;

    textFjern?: string;
    textLeggTil?: string;
}

/** Variant av periodepanel som baserer seg på Formik */
export const Periodepanel: React.FC<IPeriodepanelerProps> = ({
    name,
    textFjern,
    textLeggTil,
}: IPeriodepanelerProps) => {
    const intl = useIntl();

    const { values, setFieldValue } = useFormikContext<KorrigeringAvInntektsmeldingFormValues>();
    const fomInputRef = useRef<HTMLInputElement>(null);
    const currentListLength = values[name]?.length;
    const previousListLength = usePrevious(currentListLength);

    useFocus(currentListLength, previousListLength, fomInputRef);

    return (
        <Box padding="4" borderWidth="1" borderRadius="small" className="periodepanel">
            <FieldArray name={name}>
                {({ push, remove }) => (
                    <>
                        {values[name]?.map((value: IPeriode, index: number) => {
                            const fieldName = `${name}.${index}`;
                            const isLastElement =
                                previousListLength < currentListLength && index === currentListLength - 1;
                            return (
                                <div className="flex flex-wrap" key={index}>
                                    <div className="periodepanel-input">
                                        <Field name={fieldName}>
                                            {({ meta }: FieldProps<string, FormikValues>) => (
                                                <PeriodInput
                                                    onChange={(period) => {
                                                        setFieldValue(fieldName, period);
                                                    }}
                                                    periode={value}
                                                    intl={intl}
                                                    errorMessage={
                                                        meta.error ? <ErrorMessage name={fieldName} /> : undefined
                                                    }
                                                    fomInputRef={isLastElement ? fomInputRef : undefined}
                                                />
                                            )}
                                        </Field>

                                        <span className="mr-3" />

                                        <button
                                            id="slett"
                                            className="fjern"
                                            type="button"
                                            onClick={() => {
                                                remove(index);
                                            }}
                                        >
                                            <div className="slettIcon">
                                                <TrashIcon fontSize="2rem" color="#C30000" />
                                            </div>

                                            <FormattedMessage id={textFjern || 'skjema.liste.fjern_periode'} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}

                        <div className="flex flex-wrap">
                            <button
                                id="leggtilperiode"
                                className="leggtilperiode"
                                type="button"
                                onClick={() => {
                                    push({ fom: '', tom: '' });
                                }}
                            >
                                <div className="leggtilperiodeIcon">
                                    <AddCircleSvg title="leggtil" />
                                </div>

                                <FormattedMessage id={textLeggTil || 'skjema.periodepanel.legg_til_dag_periode'} />
                            </button>
                        </div>
                    </>
                )}
            </FieldArray>
        </Box>
    );
};
