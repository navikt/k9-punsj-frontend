import React from 'react';

import { Button } from '@navikt/ds-react';
import { TrashIcon } from '@navikt/aksel-icons';
import { useField, useFormikContext } from 'formik';

import { IArbeidstidPeriodeMedTimer, IPeriode } from 'app/models/types/Periode';
import PeriodevelgerControlled from 'app/components/timefoering/PeriodevelgerControlled';
import TimerMedDesimaler from 'app/components/timefoering/TimerMedDesimaler';
import UtregningArbeidstidDesimaler from 'app/components/timefoering/UtregningArbeidstidDesimaler';

interface Props {
    name: string;
    soknadsperioder: IPeriode[];
    remove: () => void;
}

const FraværPeriode = ({ name, remove }: Props) => {
    const formik = useFormikContext();
    const [normalField, normalMeta] = useField(`${name}.jobberNormaltTimerPerDag`);
    const [fraværField, fraværMeta] = useField<IArbeidstidPeriodeMedTimer['fraværTimerPerDag']>(
        `${name}.fraværTimerPerDag`,
    );

    return (
        <div className="mt-4">
            <div className="flex items-start">
                <PeriodevelgerControlled name={`${name}.periode`} />
                <div className="ml-4 mt-7">
                    <Button
                        icon={<TrashIcon fontSize="1.5rem" color="#C30000" title="slett" />}
                        size="small"
                        variant="tertiary"
                        onClick={remove}
                    />
                </div>
            </div>
            <div className="mt-6 flex gap-8">
                <div>
                    <TimerMedDesimaler
                        label="Normal arbeidstid"
                        value={normalField.value ?? ''}
                        onChange={(v) => formik.setFieldValue(`${name}.jobberNormaltTimerPerDag`, v)}
                        onBlur={() => formik.setFieldTouched(`${name}.jobberNormaltTimerPerDag`)}
                        error={normalMeta.touched && normalMeta.error ? normalMeta.error : ''}
                    />
                    <div className="mt-1">
                        <UtregningArbeidstidDesimaler arbeidstid={normalField.value ?? ''} />
                    </div>
                </div>
                <div>
                    <TimerMedDesimaler
                        label="Faktisk fravær"
                        value={fraværField.value ?? ''}
                        onChange={(v) => formik.setFieldValue(`${name}.fraværTimerPerDag`, v)}
                        onBlur={() => formik.setFieldTouched(`${name}.fraværTimerPerDag`)}
                        error={fraværMeta.touched && fraværMeta.error ? fraværMeta.error : ''}
                    />
                    <div className="mt-1">
                        <UtregningArbeidstidDesimaler
                            arbeidstid={fraværField.value ?? ''}
                            normalArbeidstid={normalField.value ?? ''}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FraværPeriode;
