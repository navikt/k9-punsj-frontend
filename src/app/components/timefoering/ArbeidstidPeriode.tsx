import { Field, FieldProps, useField, useFormikContext } from 'formik';
import React from 'react';
import { useIntl } from 'react-intl';

import { Checkbox } from '@navikt/ds-react';

import { ArbeidstidPeriodeMedTimer, IPeriode, Periodeinfo } from 'app/models/types';

import Slett from '../buttons/Slett';
import { PeriodInput } from '../period-input/PeriodInput';
import TimerOgMinutter from './TimerOgMinutter';
import UtregningArbeidstid from './UtregningArbeidstid';

interface OwnProps {
    name: string;
    remove: () => void;
    soknadsperioder: IPeriode[];
}

const ArbeidstidPeriode = ({ name, remove, soknadsperioder }: OwnProps) => {
    const formik = useFormikContext();
    const [, jobberNormaltPerDagMeta] = useField(`${name}.jobberNormaltPerDag.timer`);
    const [, faktiskPerDagMeta] = useField(`${name}.faktiskArbeidPerDag.timer`);
    const [, periodeFomMeta] = useField(`${name}.periode.fom`);

    const intl = useIntl();
    const velgSoknadsperiode = (periode: IPeriode) => {
        formik.setFieldValue(`${name}.periode`, periode);
    };

    const nullstillPeriode = () => formik.setFieldValue(`${name}.periode`, { fom: '', tom: '' });
    return (
        <Field name={name}>
            {({ field, meta }: FieldProps<Periodeinfo<ArbeidstidPeriodeMedTimer>>) => (
                <div style={{ marginLeft: '1rem', marginTop: '1.875rem' }}>
                    <div style={{ display: 'flex' }}>
                        <PeriodInput
                            periode={field.value.periode || {}}
                            intl={intl}
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
                    {soknadsperioder.length === 1 && (
                        <Checkbox
                            onClick={(event) =>
                                (event.target as HTMLInputElement).checked
                                    ? velgSoknadsperiode(soknadsperioder[0])
                                    : nullstillPeriode()
                            }
                        >
                            Velg hele søknadsperioden
                        </Checkbox>
                    )}
                    <div className="flex gap-4 mt-6">
                        <div className="max-w-[11rem]">
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
                            <div className="mt-1 mb-14">
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
                            <div className="mt-1 mb-14">
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
