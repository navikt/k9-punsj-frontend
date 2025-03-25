import React from 'react';

import { Field, FieldProps, useField, useFormikContext } from 'formik';
import { FormattedMessage, useIntl } from 'react-intl';
import { Button, Checkbox, ToggleGroup } from '@navikt/ds-react';
import { Delete } from '@navikt/ds-icons';

import { IOmsorgstid, IPeriode, Periodeinfo } from 'app/models/types';
import { PeriodInput } from '../period-input/PeriodInput';
import TimerOgMinutter from '../timefoering/TimerOgMinutter';
import { Tidsformat, timerMedDesimalerTilTimerOgMinutter, timerOgMinutterTilTimerMedDesimaler } from 'app/utils';
import TilsynPeriodeDesimaler from 'app/components/tilsyn/TilsynPeriodeDesimaler';
import UtregningArbeidstid from 'app/components/timefoering/UtregningArbeidstid';

interface Props {
    name: string;
    soknadsperioder: IPeriode[];

    remove: () => void;
}

const TilsynPeriode = ({ name, remove, soknadsperioder }: Props) => {
    const intl = useIntl();

    const formik = useFormikContext();

    const [timerField] = useField(`${name}.timer`);
    const [minutterField] = useField(`${name}.minutter`);
    const [, periodeFomMeta] = useField(`${name}.periode.fom`);
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
            {({ field, meta }: FieldProps<Periodeinfo<IOmsorgstid>>) => {
                return (
                    <div className="mt-4">
                        <div className="flex">
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

                            <Button
                                icon={<Delete />}
                                size="small"
                                variant="tertiary"
                                className="mt-6 pl-1"
                                onClick={remove}
                            />
                        </div>

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

                        <div className="mt-4">
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
                );
            }}
        </Field>
    );
};

export default TilsynPeriode;
