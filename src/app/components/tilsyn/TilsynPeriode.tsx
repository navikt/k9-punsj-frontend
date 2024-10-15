import { Field, FieldProps, useField, useFormikContext } from 'formik';
import React from 'react';
import { useIntl } from 'react-intl';

import { Checkbox, ToggleGroup } from '@navikt/ds-react';

import { IOmsorgstid, IPeriode, Periodeinfo } from 'app/models/types';

import Slett from '../buttons/Slett';
import { PeriodInput } from '../period-input/PeriodInput';
import TimerOgMinutter from '../timefoering/TimerOgMinutter';
import { Tidsformat, timerMedDesimalerTilTimerOgMinutter, timerOgMinutterTilTimerMedDesimaler } from 'app/utils';
import TilsynPeriodeDesimaler from 'app/components/tilsyn/TilsynPeriodeDesimaler';
import UtregningArbeidstid from 'app/components/timefoering/UtregningArbeidstid';

interface OwnProps {
    name: string;
    remove: () => void;
    soknadsperioder: IPeriode[];
}

const TilsynPeriode = ({ name, remove, soknadsperioder }: OwnProps) => {
    const formik = useFormikContext();
    const [timerField] = useField(`${name}.timer`);
    const [minutterField] = useField(`${name}.minutter`);
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
                <div className="mt-4">
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
                    <div className="mt-4">
                        <ToggleGroup
                            label="Hvordan vil du oppgi tid i omsorgstilbud?"
                            size="small"
                            onChange={(v: Tidsformat) => {
                                formik.setFieldValue(`${name}.tidsformat`, v);
                                switch (v) {
                                    case Tidsformat.Desimaler:
                                        const desimaler = timerOgMinutterTilTimerMedDesimaler({
                                            timer: timerField.value,
                                            minutter: minutterField.value,
                                        });
                                        formik.setFieldValue(`${name}.perDagString`, desimaler);
                                        break;
                                    case Tidsformat.TimerOgMin:
                                        const [timer, minutter] = timerMedDesimalerTilTimerOgMinutter(
                                            Number(desimalerField.value),
                                        );
                                        formik.setFieldValue(`${name}.timer`, timer);
                                        formik.setFieldValue(`${name}.minutter`, minutter);
                                        break;
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
                            <>
                                <TimerOgMinutter
                                    label="Tid i omsorgstilbud"
                                    onChangeTimer={(v) => formik.setFieldValue(`${name}.timer`, v)}
                                    onChangeMinutter={(v) => formik.setFieldValue(`${name}.minutter`, v)}
                                    timer={field.value.timer ?? ''}
                                    minutter={field.value.minutter ?? ''}
                                    error={meta.touched && (meta.error?.timer || meta.error?.minutter)}
                                    onBlur={() => {
                                        formik.setFieldTouched(`${name}.timer`);
                                        formik.setFieldTouched(`${name}.minutter`);
                                    }}
                                />
                                <div className="mt-1">
                                    <UtregningArbeidstid
                                        arbeidstid={{ timer: timerField.value, minutter: minutterField.value }}
                                    />
                                </div>
                            </>
                        )}
                        {tidsformatField.value === Tidsformat.Desimaler && <TilsynPeriodeDesimaler name={name} />}
                    </div>
                </div>
            )}
        </Field>
    );
};

export default TilsynPeriode;
