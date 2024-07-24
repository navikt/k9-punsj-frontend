import { Field, FieldProps, useField, useFormikContext } from 'formik';
import React from 'react';
import { useIntl } from 'react-intl';

import { Checkbox, ToggleGroup } from '@navikt/ds-react';

import { IOmsorgstid, IPeriode, ITimerOgMinutter, ITimerOgMinutterString, Periodeinfo } from 'app/models/types';

import Slett from '../buttons/Slett';
import { PeriodInput } from '../period-input/PeriodInput';
import TimerOgMinutter from '../timefoering/TimerOgMinutter';
import { Tidsformat, timerMedDesimalerTilTimerOgMinutter, timerOgMinutterTilTimerMedDesimaler } from 'app/utils';
import TimerMedDesimaler from 'app/components/timefoering/TimerMedDesimaler';
import UtregningArbeidstidDesimaler from 'app/components/timefoering/UtregningArbeidstidDesimaler';

interface OwnProps {
    name: string;
    remove: () => void;
    soknadsperioder: IPeriode[];
}

const TilsynPeriodeDesimaler = ({ name }: { name: string }) => {
    const formik = useFormikContext();
    const [field, meta] = useField<IOmsorgstid['perDagString']>(`${name}.perDagString`);
    return (
        <div className="ml-4 mt-7">
            <div className="flex gap-8 mt-6">
                <div>
                    <TimerMedDesimaler
                        label="Tid i omsorgstilbud"
                        onChange={(v) => formik.setFieldValue(`${name}.perDagString`, v)}
                        value={field.value}
                        error={meta.touched && meta.error ? meta.error : ''}
                        onBlur={() => formik.setFieldTouched(`${name}.perDagString`)}
                    />
                    <div className="mt-1">
                        <UtregningArbeidstidDesimaler arbeidstid={field.value} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const TilsynPeriode = ({ name, remove, soknadsperioder }: OwnProps) => {
    const formik = useFormikContext();
    const [, timerOgMinutterMeta] = useField<ITimerOgMinutterString>(`${name}.perDag`);
    const [, periodeFomMeta] = useField(`${name}.periode.fom`);
    const [tidsformatField] = useField(`${name}.tidsformat`);
    const [desimalerField] = useField(`${name}.perDagString`);

    const intl = useIntl();

    const velgSoknadsperiode = (periode: IPeriode) => {
        formik.setFieldValue(`${name}.periode`, periode);
    };

    const nullstillPeriode = () => formik.setFieldValue(`${name}.periode`, { fom: '', tom: '' });
    return (
        <Field name={name}>
            {({ field, meta }: FieldProps<Periodeinfo<IOmsorgstid>>) => (
                <div style={{ marginLeft: '1rem', marginTop: '1.875rem' }}>
                    <div style={{ display: 'flex' }}>
                        <PeriodInput
                            periode={field.value.periode ?? {}}
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
                                event.currentTarget.checked
                                    ? velgSoknadsperiode(soknadsperioder[0])
                                    : nullstillPeriode()
                            }
                        >
                            Velg hele søknadsperioden
                        </Checkbox>
                    )}
                    <div style={{ marginTop: '1.5625rem' }}>
                        <div>
                            <ToggleGroup
                                label="Hvordan vil du oppgi tid i omsorgstilbud?"
                                size="small"
                                onChange={(v: Tidsformat) => {
                                    formik.setFieldValue(`${name}.tidsformat`, v);
                                    if (v === Tidsformat.Desimaler) {
                                        const desimaler = timerOgMinutterTilTimerMedDesimaler(
                                            timerOgMinutterMeta.value,
                                        );
                                        formik.setFieldValue(`${name}.perDagString`, desimaler);
                                    } else if (v === Tidsformat.TimerOgMin) {
                                        const timerOgMinutter = timerMedDesimalerTilTimerOgMinutter(
                                            Number(desimalerField.value),
                                        );
                                        formik.setFieldValue(`${name}.perDag`, {
                                            timer: timerOgMinutter[0],
                                            minutter: timerOgMinutter[1],
                                        });
                                    }
                                }}
                                value={tidsformatField.value}
                            >
                                <ToggleGroup.Item value={Tidsformat.TimerOgMin}>Timer og minutter</ToggleGroup.Item>
                                <ToggleGroup.Item value={Tidsformat.Desimaler}>Desimaltall</ToggleGroup.Item>
                            </ToggleGroup>
                        </div>
                        <div className="mt-6">
                            {tidsformatField.value === Tidsformat.TimerOgMin && (
                                <TimerOgMinutter
                                    label="Tid i omsorgstilbud"
                                    onChangeTimer={(v) => formik.setFieldValue(`${name}.perDag.timer`, v)}
                                    onChangeMinutter={(v) => formik.setFieldValue(`${name}.perDag.minutter`, v)}
                                    timer={field.value.perDag.timer ?? ''}
                                    minutter={field.value.perDag.minutter ?? ''}
                                    error={timerOgMinutterMeta.touched && (meta.error?.timer || meta.error?.minutter)}
                                    onBlur={() => {
                                        formik.setFieldTouched(`${name}.perDag.timer`);
                                        formik.setFieldTouched(`${name}.perDag.minutter`);
                                    }}
                                />
                            )}
                            {tidsformatField.value === Tidsformat.Desimaler && (
                                <TilsynPeriodeDesimaler name={`${name}`} />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Field>
    );
};

export default TilsynPeriode;
