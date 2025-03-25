import React from 'react';

import { useField, useFormikContext } from 'formik';

import TimerMedDesimaler from 'app/components/timefoering/TimerMedDesimaler';
import UtregningArbeidstidDesimaler from 'app/components/timefoering/UtregningArbeidstidDesimaler';
import { IOmsorgstid } from 'app/models/types';
import { timerMedDesimalerTilTimerOgMinutter } from 'app/utils';

const TilsynPeriodeDesimaler = ({ name }: { name: string }) => {
    const formik = useFormikContext();
    const [field, meta] = useField<IOmsorgstid['perDagString']>(`${name}.perDagString`);

    return (
        <div className="mt-7">
            <TimerMedDesimaler
                label="Tid i omsorgstilbud"
                onChange={(v) => {
                    formik.setFieldValue(`${name}.perDagString`, v);
                    const [timer, minutter] = timerMedDesimalerTilTimerOgMinutter(Number(v));
                    formik.setFieldValue(`${name}.timer`, timer);
                    formik.setFieldValue(`${name}.minutter`, minutter);
                }}
                value={field.value}
                error={meta.touched && meta.error ? meta.error : ''}
                onBlur={() => formik.setFieldTouched(`${name}.perDagString`)}
            />

            <div className="mt-1">
                <UtregningArbeidstidDesimaler arbeidstid={field.value} />
            </div>
        </div>
    );
};

export default TilsynPeriodeDesimaler;
