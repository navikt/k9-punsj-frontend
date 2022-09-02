import { ArbeidstidPeriodeMedTimer, Periodeinfo } from 'app/models/types';
import { Field, FieldProps, useField, useFormikContext } from 'formik';
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
    const [normaltField, jobberNormaltPerDagMeta] = useField(`${name}.jobberNormaltPerDag.timer`);
    const [faktiskField, faktiskPerDagMeta] = useField(`${name}.faktiskArbeidPerDag.timer`);
    const [periodeFomField, periodeFomMeta] = useField(`${name}.periode.fom`);
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
                            onBlur={() => {
                                formik.setFieldTouched(`${name}.periode.fom`);
                                formik.setFieldTouched(`${name}.periode.tom`);
                            }}
                            errorMessageFom={periodeFomMeta.touched && meta.error?.periode?.fom}
                            errorMessageTom={periodeFomMeta.touched && meta.error?.periode?.tom}
                        />
                        <Slett style={{ marginTop: '1.5rem', paddingLeft: '0.3125rem' }} onClick={remove} />
                    </div>
                    <div style={{ display: 'flex', marginTop: '1.5625rem', maxWidth: '9rem' }}>
                        <div style={{ margin: '0 4.5rem 1.075rem 0' }}>
                            <TimerOgMinutter
                                label="Normal arbeidstid"
                                onChangeTimer={(v) => formik.setFieldValue(`${name}.jobberNormaltPerDag.timer`, v)}
                                onChangeMinutter={(v) =>
                                    formik.setFieldValue(`${name}.jobberNormaltPerDag.minutter`, v)
                                }
                                timer={String(field.value.jobberNormaltPerDag.timer)}
                                minutter={String(field.value.jobberNormaltPerDag.minutter)}
                                error={
                                    jobberNormaltPerDagMeta.touched &&
                                    (meta.error?.jobberNormaltPerDag?.timer ||
                                        meta.error?.jobberNormaltPerDag?.minutter)
                                }
                                onBlur={() => {
                                    formik.setFieldTouched(`${name}.jobberNormaltTimerPerDag`);
                                    formik.setFieldTouched(`${name}.jobberNormaltMinutterPerDag`);
                                }}
                            />
                            <div style={{ marginTop: '1.0625rem', marginBottom: '3.5625rem' }}>
                                <UtregningArbeidstid arbeidstid={field.value.jobberNormaltPerDag} />
                            </div>
                        </div>
                        <div>
                            <TimerOgMinutter
                                label="Faktisk arbeidstid"
                                onChangeTimer={(v) => formik.setFieldValue(`${name}.faktiskArbeidPerDag.timer`, v)}
                                onChangeMinutter={(v) =>
                                    formik.setFieldValue(`${name}.faktiskArbeidPerDag.minutter`, v)
                                }
                                timer={String(field.value.faktiskArbeidPerDag.timer)}
                                minutter={String(field.value.faktiskArbeidPerDag.minutter)}
                                error={
                                    faktiskPerDagMeta.touched &&
                                    (meta.error?.faktiskArbeidPerDag?.timer ||
                                        meta.error?.faktiskArbeidPerDag?.minutter)
                                }
                                onBlur={() => {
                                    formik.setFieldTouched(`${name}.faktiskArbeidTimerPerDag`);
                                    formik.setFieldTouched(`${name}.faktiskArbeidMinutterPerDag`);
                                }}
                            />
                            <div style={{ marginTop: '0.8125rem', marginBottom: '2.5rem' }}>
                                <UtregningArbeidstid
                                    arbeidstid={field.value.faktiskArbeidPerDag}
                                    normalArbeidstid={field.value.jobberNormaltPerDag}
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
