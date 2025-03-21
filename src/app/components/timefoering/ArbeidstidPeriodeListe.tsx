import { FieldArray, Formik, FormikProps } from 'formik';
import React, { Fragment, useRef } from 'react';
import * as yup from 'yup';

import { AddCircle } from '@navikt/ds-icons';
import { Button, Heading } from '@navikt/ds-react';

import { ArbeidstidPeriodeMedTimer, IArbeidstidPeriodeMedTimer, IPeriode, Periodeinfo } from 'app/models/types';
import { arbeidstimerPeriode } from 'app/rules/yup';
import { formats, konverterPeriodeTilTimerOgMinutter } from 'app/utils';
import dayjs from 'dayjs';

import ArbeidstidPeriode from './ArbeidstidPeriode';

const schema = yup.object({
    perioder: yup.array().of(arbeidstimerPeriode),
});

export default function ArbeidstidPeriodeListe({
    arbeidstidPerioder,
    lagre,
    heading,
    avbryt,
    soknadsperioder,
}: {
    arbeidstidPerioder: Periodeinfo<IArbeidstidPeriodeMedTimer>[];
    heading: string;
    lagre: (arbeidstidInfo: Periodeinfo<IArbeidstidPeriodeMedTimer>[]) => void;
    avbryt: () => void;
    soknadsperioder: IPeriode[];
}) {
    const formikRef = useRef<FormikProps<{ perioder: Periodeinfo<IArbeidstidPeriodeMedTimer>[] }>>(null);

    const harEksisterendePerioder = Array.isArray(arbeidstidPerioder) && arbeidstidPerioder.length > 0;

    let initialPerioder: Periodeinfo<IArbeidstidPeriodeMedTimer>[] = [];

    if (harEksisterendePerioder) {
        initialPerioder = arbeidstidPerioder.map((p) => new ArbeidstidPeriodeMedTimer(p));
    } else {
        if (soknadsperioder.length === 1) {
            initialPerioder = [
                new ArbeidstidPeriodeMedTimer({
                    periode: soknadsperioder[0],
                    faktiskArbeidPerDag: { timer: '', minutter: '' },
                    jobberNormaltPerDag: { timer: '', minutter: '' },
                }),
            ];
        } else {
            initialPerioder = [
                new ArbeidstidPeriodeMedTimer({
                    periode: { fom: '', tom: '' },
                    faktiskArbeidPerDag: { timer: '', minutter: '' },
                    jobberNormaltPerDag: { timer: '', minutter: '' },
                }),
            ];
        }
    }

    const initialValues: { perioder: Periodeinfo<IArbeidstidPeriodeMedTimer>[] } = {
        perioder: initialPerioder.sort(
            (a, b) =>
                dayjs(a.periode?.fom, formats.YYYYMMDD).valueOf() - dayjs(b.periode?.fom, formats.YYYYMMDD).valueOf(),
        ),
    };

    const handleSaveValues = (values?: { perioder: Periodeinfo<IArbeidstidPeriodeMedTimer>[] }) => {
        const currentValues = values || formikRef.current?.values;

        if (currentValues) {
            const uniquePeriodsMap = new Map<string, IArbeidstidPeriodeMedTimer>();

            currentValues.perioder.forEach((period) => {
                if (!period || !period.periode || !period.jobberNormaltPerDag?.timer) {
                    return;
                }

                const start = dayjs(period.periode.fom, formats.YYYYMMDD);
                const end = dayjs(period.periode.tom, formats.YYYYMMDD);

                let isDuplicate = false;
                for (const [, existingPeriod] of uniquePeriodsMap.entries()) {
                    if (!existingPeriod.periode) continue;

                    const existingStart = dayjs(existingPeriod.periode.fom, formats.YYYYMMDD);
                    const existingEnd = dayjs(existingPeriod.periode.tom, formats.YYYYMMDD);

                    if (start.isSameOrAfter(existingStart) && end.isSameOrBefore(existingEnd)) {
                        isDuplicate = true;
                        break;
                    }
                    if (existingStart.isSameOrAfter(start) && existingEnd.isSameOrBefore(end)) {
                        const key = `${start.format(formats.YYYYMMDD)}-${end.format(formats.YYYYMMDD)}`;
                        uniquePeriodsMap.set(key, period);
                        isDuplicate = true;
                        break;
                    }
                }

                if (!isDuplicate) {
                    uniquePeriodsMap.set(`${start.format(formats.YYYYMMDD)}-${end.format(formats.YYYYMMDD)}`, period);
                }
            });

            const processedPeriods = Array.from(uniquePeriodsMap.values())
                .map((v) => konverterPeriodeTilTimerOgMinutter(v))
                .sort(
                    (a, b) =>
                        dayjs(a.periode.fom, formats.YYYYMMDD).valueOf() -
                        dayjs(b.periode.fom, formats.YYYYMMDD).valueOf(),
                );

            lagre(processedPeriods);
        }
    };

    return (
        <Formik
            initialValues={initialValues}
            onSubmit={(values) => handleSaveValues(values)}
            validationSchema={schema}
            innerRef={formikRef}
            enableReinitialize // Sikrer at Formik reinitialiseres når props endres
        >
            {({ handleSubmit, values }) => (
                <>
                    <Heading size="small">{heading}</Heading>
                    <FieldArray
                        name="perioder"
                        render={(arrayHelpers) => (
                            <div>
                                {values.perioder && values.perioder.length > 0 ? (
                                    values.perioder.map((periode, index) => (
                                        <Fragment key={index}>
                                            <ArbeidstidPeriode
                                                name={`perioder.${index}`}
                                                soknadsperioder={soknadsperioder}
                                                remove={() => arrayHelpers.remove(index)}
                                            />
                                        </Fragment>
                                    ))
                                ) : (
                                    <div>Ingen perioder å vise</div>
                                )}
                                <div className="mb-8 mt-4">
                                    <Button
                                        variant="tertiary"
                                        type="button"
                                        onClick={() => {
                                            arrayHelpers.push(
                                                new ArbeidstidPeriodeMedTimer({
                                                    periode: { fom: '', tom: '' },
                                                    faktiskArbeidPerDag: { timer: '', minutter: '' },
                                                    jobberNormaltPerDag: { timer: '', minutter: '' },
                                                }),
                                            );
                                        }}
                                        icon={<AddCircle />}
                                    >
                                        Legg til periode
                                    </Button>
                                </div>
                                <div style={{ display: 'flex' }}>
                                    <Button
                                        style={{ flexGrow: 1, marginRight: '0.9375rem' }}
                                        type="button"
                                        onClick={() => handleSubmit()}
                                    >
                                        Lagre
                                    </Button>

                                    <Button style={{ flexGrow: 1 }} variant="tertiary" onClick={avbryt} type="button">
                                        Avbryt
                                    </Button>
                                </div>
                            </div>
                        )}
                    />
                </>
            )}
        </Formik>
    );
}
