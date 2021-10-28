/* eslint-disable react/jsx-props-no-spreading */
import AddCircleSvg from 'app/assets/SVG/AddCircleSVG';
import BinSvg from 'app/assets/SVG/BinSVG';
import { PeriodInput } from 'app/components/period-input/PeriodInput';
import { IPeriode } from 'app/models/types';
import intlHelper from 'app/utils/intlUtils';
import { ErrorMessage, Field, FieldArray, FieldProps, useFormikContext } from 'formik';
import Panel from 'nav-frontend-paneler';
import * as React from 'react';
import { Row } from 'react-bootstrap';
import { useIntl } from 'react-intl';
import { KorrigeringAvInntektsmeldingFormValues } from './KorrigeringAvInntektsmeldingForm';

export interface IPeriodepanelerProps {
    name: string;
}

/** Variant av periodepanel som baserer seg på Formik */
export const Periodepanel: React.FunctionComponent<IPeriodepanelerProps> = (props: IPeriodepanelerProps) => {
    const intl = useIntl();
    const { name } = props;
    const { values, setFieldValue } = useFormikContext<KorrigeringAvInntektsmeldingFormValues>();
    return (
        <Panel className="periodepanel">
            <FieldArray name={name}>
                {({ push, remove }) => (
                    <>
                        {values[name]?.map((value: IPeriode, index: number) => {
                            const fieldName = `${name}.${index}`;
                            return (
                                // eslint-disable-next-line react/no-array-index-key
                                <Row noGutters key={index}>
                                    <div className="periodepanel-input">
                                        <Field name={fieldName}>
                                            {({ field }: FieldProps) => (
                                                <PeriodInput
                                                    onChange={(period) => {
                                                        setFieldValue(fieldName, period);
                                                    }}
                                                    periode={field.value}
                                                    intl={intl}
                                                    errorMessage={<ErrorMessage name={fieldName} />}
                                                    // errorMessageFom={getErrorMessage!(`[${i}].periode.fom`)}
                                                    // errorMessageTom={getErrorMessage!(`[${i}].periode.tom`)}
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
                                            {intlHelper(intl, 'skjema.liste.fjern')}
                                        </button>
                                    </div>
                                </Row>
                            );
                        })}

                        <Row noGutters>
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
                                {intlHelper(intl, 'skjema.periodepanel.legg_til')}
                            </button>
                        </Row>
                    </>
                )}
            </FieldArray>
        </Panel>
    );
};
