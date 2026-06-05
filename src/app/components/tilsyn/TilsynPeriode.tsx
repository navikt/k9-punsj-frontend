import React from 'react';

import { TrashIcon } from '@navikt/aksel-icons';
import { Button, Checkbox, ToggleGroup } from '@navikt/ds-react';
import { Field, FieldProps, useField, useFormikContext } from 'formik';
import { FormattedMessage } from 'react-intl';

import TilsynPeriodeDesimaler from 'app/components/tilsyn/TilsynPeriodeDesimaler';
import UtregningArbeidstid from 'app/components/timefoering/UtregningArbeidstid';
import PeriodevelgerFormik from 'app/components/skjema/Datovelger/PeriodevelgerFormik';
import { IOmsorgstid, IPeriode, Periodeinfo } from 'app/models/types';
import {
    Tidsformat,
    isTidsformat,
    timerMedDesimalerTilTimerOgMinutter,
    timerOgMinutterTilTimerMedDesimaler,
} from 'app/utils';
import TimerOgMinutter from '../timefoering/TimerOgMinutter';

interface Props {
    name: string;
    soknadsperioder: IPeriode[];

    remove: () => void;
}

const TilsynPeriode = ({ name, remove, soknadsperioder }: Props) => {
    const formik = useFormikContext();

    const [timerField, timerFieldMeta] = useField(`${name}.timer`);
    const [minutterField, minutterFieldMeta] = useField(`${name}.minutter`);
    const [tidsformatField] = useField(`${name}.tidsformat`);
    const [desimalerField] = useField(`${name}.perDagString`);

    const velgSoknadsperiode = (periode: IPeriode) => {
        formik.setFieldValue(`${name}.periode`, periode);
    };

    const nullstillPeriode = () => formik.setFieldValue(`${name}.periode`, { fom: '', tom: '' });

    // TODO: Midlertidig løsning. Det ternges å fikse PeriodeInput
    const visCheckbox = false;

    // TODO: Fix types i formik validering for å ungå warning meta.error?.periode?.fom

    return (
        <Field name={name}>
            {({ field }: FieldProps<Periodeinfo<IOmsorgstid>>) => {
                return (
                    <div className="mt-4">
                        <PeriodevelgerFormik
                            name={`${name}.periode`}
                            action={
                                <Button
                                    className="slett-knapp-med-icon-for-input"
                                    icon={<TrashIcon fontSize="1.5rem" color="#C30000" title="slett" />}
                                    variant="tertiary"
                                    type="button"
                                    onClick={remove}
                                />
                            }
                        />

                        {visCheckbox && soknadsperioder.length === 1 && (
                            <Checkbox
                                onClick={(event) =>
                                    event.currentTarget.checked
                                        ? velgSoknadsperiode(soknadsperioder[0])
                                        : nullstillPeriode()
                                }
                            >
                                <FormattedMessage id="tilsyn.periode.velgHeleSøknadsperiode.checkbox" />
                            </Checkbox>
                        )}

                        <div className="mt-6">
                            <ToggleGroup
                                label={<FormattedMessage id="tilsyn.periode.hvordanDuVillOppgiSpm.toggle.label" />}
                                size="small"
                                onChange={(v: string) => {
                                    if (!isTidsformat(v)) return;
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
                                        error={
                                            (timerFieldMeta.touched && timerFieldMeta.error) ||
                                            (minutterFieldMeta.touched && minutterFieldMeta.error)
                                                ? String(timerFieldMeta.error || minutterFieldMeta.error)
                                                : undefined
                                        }
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
