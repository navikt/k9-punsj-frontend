import { Field, FieldProps, useField, useFormikContext } from 'formik';
import React from 'react';
import { useIntl } from 'react-intl';

import { Checkbox } from '@navikt/ds-react';

import { IPeriode, ITimerOgMinutter, Periodeinfo } from 'app/models/types';

import Slett from '../buttons/Slett';
import { PeriodInput } from '../period-input/PeriodInput';
import TimerOgMinutter from '../timefoering/TimerOgMinutter';

interface OwnProps {
    name: string;
    remove: () => void;
    soknadsperioder: IPeriode[];
}

const TilsynPeriode = ({ name, remove, soknadsperioder }: OwnProps) => {
    const formik = useFormikContext();
    const [_, tidMeta] = useField(`${name}.timer`);
    const [__, periodeFomMeta] = useField(`${name}.periode.fom`);

    const intl = useIntl();

    const velgSoknadsperiode = (periode: IPeriode) => {
        formik.setFieldValue(`${name}.periode`, periode);
    };

    const nullstillPeriode = () => formik.setFieldValue(`${name}.periode`, { fom: '', tom: '' });
    return (
        <Field name={name}>
            {({ field, meta }: FieldProps<Periodeinfo<ITimerOgMinutter>>) => (
                <div style={{ marginLeft: '1rem', marginTop: '1.875rem' }}>
                    <div style={{ display: 'flex' }}>
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
                            errorMessageTom={periodeFomMeta.touched && meta.error?.periode?.tom}
                        />
                        <Slett style={{ marginTop: '1.5rem', paddingLeft: '0.3125rem' }} onClick={remove} />
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
                    <div style={{ display: 'flex', marginTop: '1.5625rem' }}>
                        <div style={{ margin: '0 4.5rem 1.075rem 0' }}>
                            <TimerOgMinutter
                                label="Tid i omsorgstilbud"
                                onChangeTimer={(v) => formik.setFieldValue(`${name}.timer`, v)}
                                onChangeMinutter={(v) => formik.setFieldValue(`${name}.minutter`, v)}
                                timer={String(field.value.timer)}
                                minutter={String(field.value.minutter)}
                                error={tidMeta.touched && (meta.error?.timer || meta.error?.minutter)}
                                onBlur={() => {
                                    formik.setFieldTouched(`${name}.timer`);
                                    formik.setFieldTouched(`${name}.minutter`);
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </Field>
    );
};

export default TilsynPeriode;
