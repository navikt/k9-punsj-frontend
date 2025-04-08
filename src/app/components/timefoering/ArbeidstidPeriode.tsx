import React, { useState } from 'react';

import { Field, FieldProps, useField, useFormikContext } from 'formik';
import { Button, Checkbox, ToggleGroup } from '@navikt/ds-react';
import { TrashIcon } from '@navikt/aksel-icons';

import { ArbeidstidPeriodeMedTimer, IPeriode, Periodeinfo } from 'app/models/types';
import { Tidsformat, timerMedDesimalerTilTimerOgMinutter, timerOgMinutterTilTimerMedDesimaler } from 'app/utils';
import PeriodeInputV2 from '../periode-inputV2/PeriodeInputV2';
import TimerMedDesimaler from './TimerMedDesimaler';
import TimerOgMinutter from './TimerOgMinutter';
import UtregningArbeidstid from './UtregningArbeidstid';
import UtregningArbeidstidDesimaler from './UtregningArbeidstidDesimaler';

const ArbeidstidPeriodeDesimaler = ({ name }: { name: string }) => {
    const formik = useFormikContext();

    const [normaltField, jobberNormaltPerDagMeta] = useField(`${name}.jobberNormaltTimerPerDag`);
    const [faktiskField, faktiskPerDagMeta] = useField(`${name}.faktiskArbeidTimerPerDag`);
    const errors =
        jobberNormaltPerDagMeta.touched && jobberNormaltPerDagMeta.error ? String(jobberNormaltPerDagMeta.error) : '';
    const faktiskErrors = faktiskPerDagMeta.touched && faktiskPerDagMeta.error ? String(faktiskPerDagMeta.error) : '';

    return (
        <div className="ml-4 mt-7">
            <div className="flex gap-8 mt-6">
                <div>
                    <TimerMedDesimaler
                        label="Normal arbeidstid"
                        onChange={(v) => formik.setFieldValue(`${name}.jobberNormaltTimerPerDag`, v)}
                        value={normaltField.value}
                        error={errors}
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
                        error={faktiskErrors}
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

const ArbeidstidPeriodeTimerOgMinutter = ({ name }: { name: string }) => {
    const formik = useFormikContext();

    const [normaltField, jobberNormaltPerDagMeta] = useField(`${name}.jobberNormaltPerDag`);
    const [faktiskField, faktiskPerDagMeta] = useField(`${name}.faktiskArbeidPerDag`);
    const errors =
        jobberNormaltPerDagMeta.touched && jobberNormaltPerDagMeta.error ? String(jobberNormaltPerDagMeta.error) : '';
    const faktiskErrors = faktiskPerDagMeta.touched && faktiskPerDagMeta.error ? String(faktiskPerDagMeta.error) : '';

    return (
        <div className="flex gap-4 mt-6">
            <div className="max-w-[11rem]">
                <TimerOgMinutter
                    label="Normal arbeidstid"
                    onChangeTimer={(v) => formik.setFieldValue(`${name}.jobberNormaltPerDag.timer`, v)}
                    onChangeMinutter={(v) => formik.setFieldValue(`${name}.jobberNormaltPerDag.minutter`, v)}
                    timer={String(normaltField.value.timer)}
                    minutter={String(normaltField.value.minutter)}
                    error={errors}
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
                    error={faktiskErrors}
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

interface Props {
    name: string;
    soknadsperioder: IPeriode[];

    remove: () => void;
}

// Typisering for feilmeldingsobjektet
interface ArbeidstidFormErrors {
    periode?: {
        fom?: string;
        tom?: string;
    };
}

const ArbeidstidPeriode = (props: Props) => {
    const formik = useFormikContext();

    const { name, soknadsperioder, remove } = props;

    const [useSøknadsperiode, setUseSøknadsperiode] = useState(false);

    const [søknadsPeriode, setSøknadsPeriode] = useState<IPeriode | undefined>(undefined);

    const [, periodeFomMeta] = useField(`${name}.periode.fom`);
    const [, periodeTomMeta] = useField(`${name}.periode.tom`);
    const [tidsformatField] = useField(`${name}.tidsformat`);
    const [normaltField] = useField(`${name}.jobberNormaltPerDag`);
    const [faktiskField] = useField(`${name}.faktiskArbeidPerDag`);
    const [normaltDesimalerField] = useField(`${name}.jobberNormaltTimerPerDag`);
    const [faktiskDesimalerField] = useField(`${name}.faktiskArbeidTimerPerDag`);
    const [periodeField] = useField(`${name}.periode`);

    // const currentPeriod = useSøknadsperiode ? soknadsperioder[0] : periodeField.value;

    console.log('Test periodeField:', periodeField.value);

    return (
        <Field name={name}>
            {({ meta }: FieldProps<Periodeinfo<ArbeidstidPeriodeMedTimer>>) => {
                // Eksplisitt typekonvertering for meta.error
                const errors = meta.error as unknown as ArbeidstidFormErrors;

                return (
                    <div className="mt-4">
                        <div className="flex items-start">
                            <PeriodeInputV2
                                periode={søknadsPeriode}
                                onChange={(periode: IPeriode) => {
                                    formik.setFieldValue(`${name}.periode`, periode);
                                    formik.setFieldTouched(`${name}.periode`, true);
                                }}
                                fomInputProps={{
                                    error: periodeFomMeta.touched && errors?.periode?.fom,
                                }}
                                tomInputProps={{
                                    error: periodeTomMeta.touched && errors?.periode?.tom,
                                }}
                            />

                            <div className="ml-4 mt-6">
                                <Button
                                    icon={<TrashIcon fontSize="2rem" color="#C30000" title="slett" />}
                                    variant="tertiary"
                                    onClick={remove}
                                />
                            </div>
                        </div>

                        {soknadsperioder.length === 1 && (
                            <Checkbox
                                checked={useSøknadsperiode}
                                onChange={(e) => {
                                    setUseSøknadsperiode(e.target.checked);
                                    if (e.target.checked) {
                                        setSøknadsPeriode(soknadsperioder[0]);
                                    } else {
                                        setSøknadsPeriode({ fom: '', tom: '' });
                                    }
                                }}
                            >
                                Velg hele søknadsperioden
                            </Checkbox>
                        )}

                        <div className="mt-6">
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

                        {tidsformatField.value === Tidsformat.Desimaler && (
                            <ArbeidstidPeriodeDesimaler name={`${name}`} />
                        )}
                    </div>
                );
            }}
        </Field>
    );
};

export default ArbeidstidPeriode;
