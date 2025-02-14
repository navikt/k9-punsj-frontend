import React from 'react';

import { Field, FieldProps, useField, useFormikContext } from 'formik';
import { useIntl } from 'react-intl';
import { Button, Checkbox, ToggleGroup } from '@navikt/ds-react';
import { Delete } from '@navikt/ds-icons';

import { ArbeidstidPeriodeMedTimer, IPeriode, Periodeinfo } from 'app/models/types';
import { Tidsformat, timerMedDesimalerTilTimerOgMinutter, timerOgMinutterTilTimerMedDesimaler } from 'app/utils';
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

const ArbeidstidPeriode = ({ name, remove, soknadsperioder }: OwnProps) => {
    const formik = useFormikContext();
    const [, periodeFomMeta] = useField(`${name}.periode.fom`);
    const [, periodeTomMeta] = useField(`${name}.periode.tom`);
    const [tidsformatField] = useField(`${name}.tidsformat`);
    const [normaltField] = useField(`${name}.jobberNormaltPerDag`);
    const [faktiskField] = useField(`${name}.faktiskArbeidPerDag`);
    const [normaltDesimalerField] = useField(`${name}.jobberNormaltTimerPerDag`);
    const [faktiskDesimalerField] = useField(`${name}.faktiskArbeidTimerPerDag`);
    const intl = useIntl();
    const velgSoknadsperiode = (periode: IPeriode) => {
        formik.setFieldValue(`${name}.periode`, periode);
    };

    const nullstillPeriode = () => formik.setFieldValue(`${name}.periode`, { fom: '', tom: '' });

    return (
        <Field name={name}>
            {({ field, meta }: FieldProps<Periodeinfo<ArbeidstidPeriodeMedTimer>>) => (
                <div style={{ marginLeft: '1rem', marginTop: '1.875rem' }}>
                    <div className="flex items-end gap-4">
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
                        <Button icon={<Delete />} size="small" variant="tertiary" className="slett" onClick={remove} />
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
                    <div style={{ marginTop: '1.5625rem' }}>
                        <ToggleGroup
                            label="Hvordan vil du oppgi arbeidstid?"
                            defaultValue={Tidsformat.TimerOgMin}
                            size="small"
                            onChange={(v: Tidsformat) => {
                                formik.setFieldValue(`${name}.tidsformat`, v);
                                if (v === Tidsformat.Desimaler) {
                                    const normalDesimaler = timerOgMinutterTilTimerMedDesimaler({
                                        timer: normaltField.value.timer,
                                        minutter: normaltField.value.minutter,
                                    });
                                    const faktiskDesimaler = timerOgMinutterTilTimerMedDesimaler({
                                        timer: faktiskField.value.timer,
                                        minutter: faktiskField.value.minutter,
                                    });
                                    formik.setFieldValue(`${name}.jobberNormaltTimerPerDag`, normalDesimaler);
                                    formik.setFieldValue(`${name}.faktiskArbeidTimerPerDag`, faktiskDesimaler);
                                }

                                if (v === Tidsformat.TimerOgMin) {
                                    const normalTimerOgMinutter = timerMedDesimalerTilTimerOgMinutter(
                                        Number(normaltDesimalerField.value),
                                    );
                                    const faktiskTimerOgMinutter = timerMedDesimalerTilTimerOgMinutter(
                                        Number(faktiskDesimalerField.value),
                                    );
                                    formik.setFieldValue(`${name}.jobberNormaltPerDag`, {
                                        timer: normalTimerOgMinutter[0],
                                        minutter: normalTimerOgMinutter[1],
                                    });
                                    formik.setFieldValue(`${name}.faktiskArbeidPerDag`, {
                                        timer: faktiskTimerOgMinutter[0],
                                        minutter: faktiskTimerOgMinutter[1],
                                    });
                                }
                            }}
                            value={tidsformatField.value}
                        >
                            <ToggleGroup.Item value={Tidsformat.TimerOgMin}>Timer og minutter</ToggleGroup.Item>
                            <ToggleGroup.Item value={Tidsformat.Desimaler}>Desimaltall</ToggleGroup.Item>
                        </ToggleGroup>
                    </div>

                    {tidsformatField.value === Tidsformat.TimerOgMin && (
                        <ArbeidstidPeriodeTimerOgMinutter name={name} />
                    )}
                    {tidsformatField.value === Tidsformat.Desimaler && <ArbeidstidPeriodeDesimaler name={`${name}`} />}
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
        <div className="flex gap-4 mt-6">
            <div className="max-w-[11rem]">
                <TimerOgMinutter
                    label="Normal arbeidstid"
                    onChangeTimer={(v) => formik.setFieldValue(`${name}.jobberNormaltPerDag.timer`, v)}
                    onChangeMinutter={(v) => formik.setFieldValue(`${name}.jobberNormaltPerDag.minutter`, v)}
                    timer={String(normaltField.value.timer)}
                    minutter={String(normaltField.value.minutter)}
                    error={
                        jobberNormaltPerDagMeta.touched &&
                        (jobberNormaltPerDagMeta.error?.timer || jobberNormaltPerDagMeta?.error?.minutter)
                    }
                    onBlur={() => {
                        formik.setFieldTouched(`${name}.jobberNormaltPerDag`);
                    }}
                />
                <div className="mt-1">
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
                        (faktiskPerDagMeta.error?.timer || faktiskPerDagMeta?.error?.minutter)
                    }
                    onBlur={() => {
                        formik.setFieldTouched(`${name}.faktiskArbeidPerDag`);
                    }}
                />
                <div className="mt-1">
                    <UtregningArbeidstid arbeidstid={faktiskField.value} normalArbeidstid={normaltField.value} />
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
        <div className="ml-4 mt-7">
            <div className="flex gap-8 mt-6">
                <div>
                    <TimerMedDesimaler
                        label="Normal arbeidstid"
                        onChange={(v) => formik.setFieldValue(`${name}.jobberNormaltTimerPerDag`, v)}
                        value={normaltField.value}
                        error={
                            jobberNormaltPerDagMeta.touched && jobberNormaltPerDagMeta.error
                                ? jobberNormaltPerDagMeta.error
                                : ''
                        }
                        onBlur={() => formik.setFieldTouched(`${name}.jobberNormaltTimerPerDag`)}
                    />
                    <div className="mt-1">
                        <UtregningArbeidstidDesimaler arbeidstid={normaltField.value} />
                    </div>
                </div>
                <div>
                    <TimerMedDesimaler
                        label="Faktisk arbeidstid"
                        onChange={(v) => formik.setFieldValue(`${name}.faktiskArbeidTimerPerDag`, v)}
                        value={faktiskField.value}
                        error={faktiskPerDagMeta.touched && faktiskPerDagMeta.error ? faktiskPerDagMeta.error : ''}
                        onBlur={() => formik.setFieldTouched(`${name}.faktiskArbeidTimerPerDag`)}
                    />
                    <div className="mt-1">
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
