import { ArbeidstidPeriodeMedTimer, Periodeinfo } from 'app/models/types';
import { Field, FieldProps, useFormikContext } from 'formik';
import React from 'react';
import Slett from '../buttons/Slett';
import { PeriodInput } from '../period-input/PeriodInput';
import TimerOgMinutter from './TimerOgMinutter';
import UtregningArbeidstid from './UtregningArbeidstid';

interface OwnProps {
    name: string;
    remove: () => void;
}

const ArbeidstidPeriode = ({ name, remove }: OwnProps) => {
    const formik = useFormikContext();
    return (
        <Field name={name}>
            {({ field, meta }: FieldProps<Periodeinfo<ArbeidstidPeriodeMedTimer>>) => (
                <div style={{ marginLeft: '1rem', marginTop: '1.875rem' }}>
                    <div style={{ display: 'flex' }}>
                        <PeriodInput
                            periode={field.value.periode || {}}
                            onChange={(v) => {
                                formik.setFieldValue(`${name}.periode`, v);
                            }}
                            errorMessageFom={meta.error?.periode?.fom}
                            errorMessageTom={meta.error?.periode?.tom}
                        />
                        <Slett style={{ marginTop: '1.5rem', paddingLeft: '0.3125rem' }} onClick={remove} />
                    </div>
                    <div style={{ display: 'flex', marginTop: '1.5625rem' }}>
                        <div style={{ margin: '0 4.5rem 1.075rem 0' }}>
                            <TimerOgMinutter
                                label="Normal arbeidstid"
                                onChangeTimer={(v) => formik.setFieldValue(`${name}.jobberNormaltTimerPerDag`, v)}
                                timer={field.value.jobberNormaltTimerPerDag}
                                error={meta.error?.jobberNormaltTimerPerDag}
                                onBlur={() => formik.setFieldTouched(`${name}.jobberNormaltTimerPerDag`)}
                            />
                            <div style={{ marginTop: '1.0625rem', marginBottom: '3.5625rem' }}>
                                <UtregningArbeidstid arbeidstid={field.value.jobberNormaltTimerPerDag} />
                            </div>
                        </div>
                        <div>
                            <TimerOgMinutter
                                label="Faktisk arbeidstid"
                                onChangeTimer={(v) => formik.setFieldValue(`${name}.faktiskArbeidTimerPerDag`, v)}
                                timer={field.value.faktiskArbeidTimerPerDag}
                                error={meta.error?.faktiskArbeidTimerPerDag}
                                onBlur={() => formik.setFieldTouched(`${name}.faktiskArbeidTimerPerDag`)}
                            />
                            <div style={{ marginTop: '0.8125rem', marginBottom: '2.5rem' }}>
                                <UtregningArbeidstid
                                    arbeidstid={field.value.faktiskArbeidTimerPerDag}
                                    normalArbeidstid={field.value.jobberNormaltTimerPerDag}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Field>
    );
};

export default ArbeidstidPeriode;
