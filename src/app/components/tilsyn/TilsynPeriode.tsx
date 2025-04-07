import React, { useState } from 'react';

import { Field, FieldProps, useField, useFormikContext } from 'formik';
import { FormattedMessage } from 'react-intl';
import { Button, Checkbox, ToggleGroup } from '@navikt/ds-react';
import { TrashIcon } from '@navikt/aksel-icons';

import { IOmsorgstid, IPeriode, Periodeinfo } from 'app/models/types';
import PeriodeInputV2 from '../periode-inputV2/PeriodeInputV2';
import TimerOgMinutter from '../timefoering/TimerOgMinutter';
import { Tidsformat, timerMedDesimalerTilTimerOgMinutter, timerOgMinutterTilTimerMedDesimaler } from 'app/utils';
import TilsynPeriodeDesimaler from 'app/components/tilsyn/TilsynPeriodeDesimaler';
import UtregningArbeidstid from 'app/components/timefoering/UtregningArbeidstid';

interface Props {
    name: string;
    soknadsperioder: IPeriode[];

    remove: () => void;
}

// Typisering for feilmeldingsobjektet
interface TilsynFormErrors {
    periode?: {
        fom?: string;
        tom?: string;
    };
    timer?: string;
    minutter?: string;
}

const TilsynPeriode = ({ name, remove, soknadsperioder }: Props) => {
    const formik = useFormikContext();

    const [useSøknadsperiode, setUseSøknadsperiode] = useState(false);

    const [, periodeFomMeta] = useField(`${name}.periode.fom`);
    const [, periodeTomMeta] = useField(`${name}.periode.tom`);
    const [tidsformatField] = useField(`${name}.tidsformat`);
    const [timerField] = useField(`${name}.timer`);
    const [minutterField] = useField(`${name}.minutter`);

    const [desimalerField] = useField(`${name}.perDagString`);
    const [periodeField] = useField(`${name}.periode`);

    const currentPeriod = useSøknadsperiode ? soknadsperioder[0] : periodeField.value;

    return (
        <Field name={name}>
            {({ field, meta }: FieldProps<Periodeinfo<IOmsorgstid>>) => {
                // Eksplisitt typekonvertering for meta.error
                const errors = meta.error as unknown as TilsynFormErrors;

                return (
                    <div className="mt-4">
                        <div className="flex items-start">
                            <PeriodeInputV2
                                periode={currentPeriod}
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
                                    const newPeriod = e.target.checked ? soknadsperioder[0] : { fom: null, tom: null };
                                    formik.setFieldValue(`${name}.periode`, newPeriod);
                                    formik.setFieldTouched(`${name}.periode`, true);
                                }}
                            >
                                <FormattedMessage id="tilsyn.periode.velgHeleSøknadsperiode.checkbox" />
                            </Checkbox>
                        )}

                        <div className="mt-6">
                            <ToggleGroup
                                label={<FormattedMessage id="tilsyn.periode.hvordanDuVillOppgiSpm.toggle.label" />}
                                size="small"
                                onChange={(v: Tidsformat) => {
                                    formik.setFieldValue(`${name}.tidsformat`, v);
                                    switch (v) {
                                        case Tidsformat.Desimaler: {
                                            const desimaler = timerOgMinutterTilTimerMedDesimaler({
                                                timer: timerField.value,
                                                minutter: minutterField.value,
                                            });
                                            formik.setFieldValue(`${name}.perDagString`, desimaler);
                                            break;
                                        }
                                        case Tidsformat.TimerOgMin: {
                                            const [timer, minutter] = timerMedDesimalerTilTimerOgMinutter(
                                                Number(desimalerField.value),
                                            );
                                            formik.setFieldValue(`${name}.timer`, timer);
                                            formik.setFieldValue(`${name}.minutter`, minutter);
                                            break;
                                        }
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
                                        error={(meta.touched && (errors?.timer || errors?.minutter)) || undefined}
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
                );
            }}
        </Field>
    );
};

export default TilsynPeriode;
