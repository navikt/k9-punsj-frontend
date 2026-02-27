import React from 'react';

import { Button, ToggleGroup } from '@navikt/ds-react';
import { TrashIcon } from '@navikt/aksel-icons';
import { useField, useFormikContext } from 'formik';

import { IPeriode } from 'app/models/types/Periode';
import { Tidsformat, timerMedDesimalerTilTimerOgMinutter, timerOgMinutterTilTimerMedDesimaler } from 'app/utils';
import PeriodevelgerControlled from 'app/components/timefoering/PeriodevelgerControlled';
import TimerOgMinutter from 'app/components/timefoering/TimerOgMinutter';
import TimerMedDesimaler from 'app/components/timefoering/TimerMedDesimaler';
import UtregningArbeidstid from 'app/components/timefoering/UtregningArbeidstid';
import UtregningArbeidstidDesimaler from 'app/components/timefoering/UtregningArbeidstidDesimaler';

interface Props {
    name: string;
    soknadsperioder: IPeriode[];
    remove: () => void;
}

const FraværPeriode = ({ name, remove }: Props) => {
    const formik = useFormikContext();
    const submitted = formik.submitCount > 0;
    const [tidsformatField] = useField(`${name}.tidsformat`);
    const tidsformat: Tidsformat = tidsformatField.value ?? Tidsformat.TimerOgMin;

    const [normalTimerField] = useField(`${name}.jobberNormaltPerDag.timer`);
    const [normalMinField] = useField(`${name}.jobberNormaltPerDag.minutter`);
    const [fraværTimerField] = useField(`${name}.fraværPerDag.timer`);
    const [fraværMinField] = useField(`${name}.fraværPerDag.minutter`);
    const [normalDeciField, normalDeciMeta] = useField(`${name}.jobberNormaltTimerPerDag`);
    const [fraværDeciField, fraværDeciMeta] = useField(`${name}.fraværTimerPerDag`);

    const setNormalTimerMin = (timer: string, minutter: string) => {
        formik.setFieldValue(`${name}.jobberNormaltPerDag.timer`, timer);
        formik.setFieldValue(`${name}.jobberNormaltPerDag.minutter`, minutter);
        formik.setFieldValue(`${name}.jobberNormaltTimerPerDag`, timerOgMinutterTilTimerMedDesimaler({ timer, minutter }));
    };

    const setFraværTimerMin = (timer: string, minutter: string) => {
        formik.setFieldValue(`${name}.fraværPerDag.timer`, timer);
        formik.setFieldValue(`${name}.fraværPerDag.minutter`, minutter);
        formik.setFieldValue(`${name}.fraværTimerPerDag`, timerOgMinutterTilTimerMedDesimaler({ timer, minutter }));
    };

    const handleToggle = (v: Tidsformat) => {
        formik.setFieldValue(`${name}.tidsformat`, v);
        if (v === Tidsformat.Desimaler) {
            formik.setFieldValue(`${name}.jobberNormaltTimerPerDag`,
                timerOgMinutterTilTimerMedDesimaler({ timer: normalTimerField.value, minutter: normalMinField.value }));
            formik.setFieldValue(`${name}.fraværTimerPerDag`,
                timerOgMinutterTilTimerMedDesimaler({ timer: fraværTimerField.value, minutter: fraværMinField.value }));
        } else {
            const [nt, nm] = timerMedDesimalerTilTimerOgMinutter(Number(normalDeciField.value));
            const [ft, fm] = timerMedDesimalerTilTimerOgMinutter(Number(fraværDeciField.value));
            formik.setFieldValue(`${name}.jobberNormaltPerDag`, { timer: nt, minutter: nm });
            formik.setFieldValue(`${name}.fraværPerDag`, { timer: ft, minutter: fm });
        }
    };

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

            <div className="mt-4">
                <ToggleGroup label="Hvordan vil du oppgi tid?" size="small" value={tidsformat} onChange={handleToggle}>
                    <ToggleGroup.Item value={Tidsformat.TimerOgMin}>Timer og minutter</ToggleGroup.Item>
                    <ToggleGroup.Item value={Tidsformat.Desimaler}>Desimaltall</ToggleGroup.Item>
                </ToggleGroup>
            </div>

            {tidsformat === Tidsformat.TimerOgMin && (
                <div className="mt-4 flex gap-8">
                    <div>
                        <TimerOgMinutter
                            label="Normal arbeidstid"
                            timer={normalTimerField.value ?? ''}
                            minutter={normalMinField.value ?? ''}
                            onChangeTimer={(v) => setNormalTimerMin(v, normalMinField.value ?? '')}
                            onChangeMinutter={(v) => setNormalTimerMin(normalTimerField.value ?? '', v)}
                            onBlur={() => { formik.setFieldTouched(`${name}.jobberNormaltTimerPerDag`); }}
                            error={(submitted || normalDeciMeta.touched) && normalDeciMeta.error ? normalDeciMeta.error : undefined}
                        />
                        <div className="mt-1">
                            <UtregningArbeidstid arbeidstid={{ timer: normalTimerField.value ?? '', minutter: normalMinField.value ?? '' }} />
                        </div>
                    </div>
                    <div>
                        <TimerOgMinutter
                            label="Fravær"
                            timer={fraværTimerField.value ?? ''}
                            minutter={fraværMinField.value ?? ''}
                            onChangeTimer={(v) => setFraværTimerMin(v, fraværMinField.value ?? '')}
                            onChangeMinutter={(v) => setFraværTimerMin(fraværTimerField.value ?? '', v)}
                            onBlur={() => { formik.setFieldTouched(`${name}.fraværTimerPerDag`); }}
                            error={(submitted || fraværDeciMeta.touched) && fraværDeciMeta.error ? fraværDeciMeta.error : undefined}
                        />
                        <div className="mt-1">
                            <UtregningArbeidstid
                                arbeidstid={{ timer: fraværTimerField.value ?? '', minutter: fraværMinField.value ?? '' }}
                                normalArbeidstid={{ timer: normalTimerField.value ?? '', minutter: normalMinField.value ?? '' }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {tidsformat === Tidsformat.Desimaler && (
                <div className="mt-4 flex gap-8">
                    <div>
                        <TimerMedDesimaler
                            label="Normal arbeidstid"
                            value={normalDeciField.value ?? ''}
                            onChange={(v) => {
                                formik.setFieldValue(`${name}.jobberNormaltTimerPerDag`, v);
                                const [t, m] = timerMedDesimalerTilTimerOgMinutter(Number(v));
                                formik.setFieldValue(`${name}.jobberNormaltPerDag`, { timer: t, minutter: m });
                            }}
                            onBlur={() => formik.setFieldTouched(`${name}.jobberNormaltTimerPerDag`)}
                            error={(submitted || normalDeciMeta.touched) && normalDeciMeta.error ? normalDeciMeta.error : ''}
                        />
                        <div className="mt-1">
                            <UtregningArbeidstidDesimaler arbeidstid={normalDeciField.value ?? ''} />
                        </div>
                    </div>
                    <div>
                        <TimerMedDesimaler
                            label="Fravær"
                            value={fraværDeciField.value ?? ''}
                            onChange={(v) => {
                                formik.setFieldValue(`${name}.fraværTimerPerDag`, v);
                                const [t, m] = timerMedDesimalerTilTimerOgMinutter(Number(v));
                                formik.setFieldValue(`${name}.fraværPerDag`, { timer: t, minutter: m });
                            }}
                            onBlur={() => formik.setFieldTouched(`${name}.fraværTimerPerDag`)}
                            error={(submitted || fraværDeciMeta.touched) && fraværDeciMeta.error ? fraværDeciMeta.error : ''}
                        />
                        <div className="mt-1">
                            <UtregningArbeidstidDesimaler
                                arbeidstid={fraværDeciField.value ?? ''}
                                normalArbeidstid={normalDeciField.value ?? ''}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FraværPeriode;
