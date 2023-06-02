import { Field, FieldProps, useField, useFormikContext } from 'formik';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';

import { Checkbox, ToggleGroup } from '@navikt/ds-react';

import { ArbeidstidPeriodeMedTimer, IPeriode, Periodeinfo } from 'app/models/types';

import Slett from '../buttons/Slett';
import { PeriodInput } from '../period-input/PeriodInput';
import TimerMedDesimaler from './TimerMedDesimaler';
import TimerOgMinutter from './TimerOgMinutter';
import UtregningArbeidstid from './UtregningArbeidstid';
import UtregningArbeidstidDesimaler from './UtregningArbeidstidDesimaler';

interface OwnProps {
    name: string;
    remove: () => void;
    soknadsperioder: IPeriode[];
}

enum Tidsformat {
    TimerOgMin = 'timerOgMin',
    Desimaler = 'desimaler',
}

const ArbeidstidPeriode = ({ name, remove, soknadsperioder }: OwnProps) => {
    const formik = useFormikContext();
    const [periodeFomField, periodeFomMeta] = useField(`${name}.periode.fom`);
    const [periodeTomField, periodeTomMeta] = useField(`${name}.periode.tom`);
    const [tidsformat, setTidsformat] = useState<Tidsformat>(Tidsformat.TimerOgMin);

    const intl = useIntl();
    const velgSoknadsperiode = (periode: IPeriode) => {
        formik.setFieldValue(`${name}.periode`, periode);
    };

    const resetArbeidstid = () => {
        formik.setFieldValue(
            `${name}`,
            new ArbeidstidPeriodeMedTimer({ periode: { fom: periodeFomField.value, tom: periodeTomField.value } }),
        );
    };

    useEffect(() => {
        resetArbeidstid();
    }, [tidsformat]);
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
                            errorMessageTom={periodeTomMeta.touched && meta.error?.periode?.tom}
                        />
                    </div>
                    <Slett style={{ marginTop: '0.5rem' }} onClick={remove} />
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
                    <div style={{ marginTop: '1.5625rem' }}>
                        <ToggleGroup
                            label="Hvordan vil du oppgi arbeidstid?"
                            defaultValue={Tidsformat.TimerOgMin}
                            size="small"
                            onChange={(v: Tidsformat) => {
                                setTidsformat(v as Tidsformat);
                            }}
                        >
                            <ToggleGroup.Item value={Tidsformat.TimerOgMin}>I timer og minutter</ToggleGroup.Item>
                            <ToggleGroup.Item value={Tidsformat.Desimaler}>I timer med desimaltall</ToggleGroup.Item>
                        </ToggleGroup>
                    </div>

                    {tidsformat === Tidsformat.TimerOgMin && <ArbeidstidPeriodeTimerOgMinutter name={`${name}`} />}
                    {tidsformat === Tidsformat.Desimaler && <ArbeidstidPeriodeDesimaler name={`${name}`} />}
                </div>
            )}
        </Field>
    );
};
const ArbeidstidPeriodeTimerOgMinutter = ({ name }: { name: string }) => {
    const formik = useFormikContext();
    const [normaltField, jobberNormaltPerDagMeta] = useField(`${name}.jobberNormaltPerDag`);
    const [faktiskField, faktiskPerDagMeta] = useField(`${name}.faktiskArbeidPerDag`);
    return (
        <div style={{ marginLeft: '1rem', marginTop: '1.875rem' }}>
            <div style={{ display: 'flex', marginTop: '1.5625rem', maxWidth: '9rem' }}>
                <div style={{ margin: '0 4.5rem 1.075rem 0' }}>
                    <TimerOgMinutter
                        label="Normal arbeidstid"
                        onChangeTimer={(v) => formik.setFieldValue(`${name}.jobberNormaltPerDag.timer`, v)}
                        onChangeMinutter={(v) => formik.setFieldValue(`${name}.jobberNormaltPerDag.minutter`, v)}
                        timer={String(normaltField.value.timer)}
                        minutter={String(normaltField.value.minutter)}
                        error={
                            jobberNormaltPerDagMeta.touched &&
                            (jobberNormaltPerDagMeta?.error?.timer || jobberNormaltPerDagMeta?.error?.minutter)
                        }
                        onBlur={() => {
                            formik.setFieldTouched(`${name}.jobberNormaltTimerPerDag`);
                            formik.setFieldTouched(`${name}.jobberNormaltMinutterPerDag`);
                        }}
                    />
                    <div style={{ marginTop: '1.0625rem', marginBottom: '3.5625rem' }}>
                        <UtregningArbeidstid arbeidstid={normaltField.value} />
                    </div>
                </div>
                <div>
                    <TimerOgMinutter
                        label="Faktisk arbeidstid"
                        onChangeTimer={(v) => formik.setFieldValue(`${name}.faktiskArbeidPerDag.timer`, v)}
                        onChangeMinutter={(v) => formik.setFieldValue(`${name}.faktiskArbeidPerDag.minutter`, v)}
                        timer={String(faktiskField.value.timer)}
                        minutter={String(faktiskField.value.minutter)}
                        error={
                            faktiskPerDagMeta.touched &&
                            (faktiskPerDagMeta.error?.timer || faktiskPerDagMeta.error?.minutter)
                        }
                        onBlur={() => {
                            formik.setFieldTouched(`${name}.faktiskArbeidTimerPerDag`);
                            formik.setFieldTouched(`${name}.faktiskArbeidMinutterPerDag`);
                        }}
                    />
                    <div style={{ marginTop: '0.8125rem', marginBottom: '2.5rem' }}>
                        <UtregningArbeidstid arbeidstid={faktiskField.value} normalArbeidstid={normaltField.value} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const ArbeidstidPeriodeDesimaler = ({ name }: { name: string }) => {
    const formik = useFormikContext();
    const [normaltField, jobberNormaltPerDagMeta] = useField(`${name}.jobberNormaltTimerPerDag`);
    const [faktiskField, faktiskPerDagMeta] = useField(`${name}.faktiskArbeidTimerPerDag`);

    return (
        <div style={{ marginLeft: '1rem', marginTop: '1.875rem' }}>
            <div style={{ display: 'flex', marginTop: '1.5625rem', maxWidth: '9rem' }}>
                <div style={{ margin: '0 4.5rem 1.075rem 0' }}>
                    <TimerMedDesimaler
                        label="Normal arbeidstid"
                        onChange={(v) => formik.setFieldValue(`${name}.jobberNormaltTimerPerDag`, v)}
                        timer={String(jobberNormaltPerDagMeta.value)}
                        error={jobberNormaltPerDagMeta.touched && faktiskPerDagMeta.error}
                        onBlur={() => {
                            formik.setFieldTouched(`${name}.jobberNormaltTimerPerDag`);
                        }}
                    />
                    <div style={{ marginTop: '1.0625rem', marginBottom: '3.5625rem' }}>
                        <UtregningArbeidstidDesimaler arbeidstid={normaltField.value} />
                    </div>
                </div>
                <div>
                    <TimerMedDesimaler
                        label="Faktisk arbeidstid"
                        onChange={(v) => formik.setFieldValue(`${name}.faktiskArbeidTimerPerDag`, v)}
                        timer={String(faktiskPerDagMeta.value)}
                        error={faktiskPerDagMeta.touched && faktiskPerDagMeta.error}
                        onBlur={() => {
                            formik.setFieldTouched(`${name}.faktiskArbeidTimerPerDag`);
                        }}
                    />
                    <div style={{ marginTop: '0.8125rem', marginBottom: '2.5rem' }}>
                        <UtregningArbeidstidDesimaler
                            arbeidstid={faktiskField.value}
                            normalArbeidstid={normaltField.value}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArbeidstidPeriode;
