import { AddCircle } from '@navikt/ds-icons';
import { Button, Heading, Panel } from '@navikt/ds-react';
import DatoInputFormik from 'app/components/formikInput/DatoInputFormik';
import RadioFormik from 'app/components/formikInput/RadioFormik';
import RadioGroupFormik from 'app/components/formikInput/RadioGroupFormik';
import { Field, FieldArray, FieldProps, useFormikContext } from 'formik';
import React from 'react';
import VerticalSpacer from 'app/components/VerticalSpacer';
import Fravaersperiode from './Fravaersperiode';
import { fravaersperiodeInitialValue } from '../initialValues';
import { aktivitetsFravær } from '../konstanter';
import { FravaersperiodeType, IOMPUTSoknad } from '../types/OMPUTSoknad';
import './arbeidsforhold.less';

export default function Frilanser() {
    const { values } = useFormikContext<IOMPUTSoknad>();
    const {
        opptjeningAktivitet: { frilanser },
    } = values;
    return (
        <div className="arbeidsforhold-container">
            <Panel border>
                <Heading size="small" level="5">
                    Frilanser
                </Heading>
                <VerticalSpacer twentyPx />

                <DatoInputFormik
                    label="Når startet søker som frilanser?"
                    name="opptjeningAktivitet.frilanser.startdato"
                />
                <VerticalSpacer twentyPx />

                <Field name="opptjeningAktivitet.frilanser.jobberFortsattSomFrilans">
                    {({ field, form }: FieldProps<string>) => (
                        <RadioGroupFormik
                            legend="Jobber søker fortsatt som frilanser?"
                            size="small"
                            name={field.name}
                            value={field.value ? 'ja' : 'nei'}
                        >
                            <RadioFormik
                                name={field.name}
                                value="ja"
                                onChange={() => form.setFieldValue(field.name, true)}
                            >
                                Ja
                            </RadioFormik>
                            <RadioFormik
                                name={field.name}
                                value="nei"
                                onChange={() => form.setFieldValue(field.name, false)}
                                checked
                            >
                                Nei
                            </RadioFormik>
                        </RadioGroupFormik>
                    )}
                </Field>
                <VerticalSpacer twentyPx />

                {!frilanser.jobberFortsattSomFrilans && (
                    <>
                        <DatoInputFormik
                            label="Når sluttet søker som frilanser?"
                            name="opptjeningAktivitet.frilanser.sluttdato"
                        />
                        <VerticalSpacer twentyPx />
                    </>
                )}
                <hr />
                <Heading size="small">Informasjon om fraværsperioder</Heading>
                <FieldArray
                    name="opptjeningAktivitet.frilanser.fravaersperioder"
                    render={(arrayHelpers) => (
                        <>
                            {frilanser.fravaersperioder?.map((fravaersperiode, fravaersperiodeIndex) => (
                                <Field name={`opptjeningAktivitet.frilanser.fravaersperioder[${fravaersperiodeIndex}]`}>
                                    {({ field }: FieldProps<FravaersperiodeType>) => (
                                        <Fravaersperiode
                                            name={field.name}
                                            antallFravaersperioder={frilanser.fravaersperioder?.length}
                                            slettPeriode={() => arrayHelpers.remove(fravaersperiodeIndex)}
                                        />
                                    )}
                                </Field>
                            ))}
                            <Button
                                variant="tertiary"
                                size="small"
                                onClick={() =>
                                    arrayHelpers.push({
                                        ...fravaersperiodeInitialValue,
                                        aktivitetsFravær: aktivitetsFravær.FRILANSER,
                                    })
                                }
                            >
                                <AddCircle />
                                Legg til periode
                            </Button>
                        </>
                    )}
                />
            </Panel>
        </div>
    );
}
