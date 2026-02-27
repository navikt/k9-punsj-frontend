import React, { useRef } from 'react';

import { PlusCircleIcon } from '@navikt/aksel-icons';
import { Alert, Button, Heading } from '@navikt/ds-react';
import { FieldArray, Formik, FormikProps } from 'formik';
import * as yup from 'yup';

import { IArbeidstidPeriodeMedTimer, IPeriode, Periodeinfo } from 'app/models/types';
import {
    validatePeriodsWithinSoknadsperioder,
    formatSoknadsperioder,
    checkPeriodOverlap,
    processTilsynPeriods,
} from 'app/utils/periodUtils';
import { Tidsformat } from 'app/utils';

import VerticalSpacer from 'app/components/VerticalSpacer';
import FraværPeriode from './FraværPeriode';

const createValidationSchema = (soknadsperioder: IPeriode[]) =>
    yup.object({
        perioder: yup
            .array()
            .of(
                yup.object({
                    periode: yup.object({
                        fom: yup.string().required('Fra og med er påkrevd'),
                        tom: yup.string().required('Til og med er påkrevd'),
                    }),
                    jobberNormaltTimerPerDag: yup.string().required('Normal arbeidstid er påkrevd'),
                    fraværTimerPerDag: yup.string().required('Faktisk fravær er påkrevd'),
                }),
            )
            .test('no-overlap', 'Perioder kan ikke overlappe hverandre', (periods) => {
                if (!periods) return true;
                return !checkPeriodOverlap(periods as Periodeinfo<IArbeidstidPeriodeMedTimer>[]);
            })
            .test(
                'within-soknadsperioder',
                `Fravær må være innenfor søknadsperioder. Gyldig intervall: [${formatSoknadsperioder(soknadsperioder)}]`,
                (periods) => {
                    if (!periods) return true;
                    return !validatePeriodsWithinSoknadsperioder(
                        periods as Periodeinfo<IArbeidstidPeriodeMedTimer>[],
                        soknadsperioder,
                    );
                },
            ),
    });


const emptyPeriode: Periodeinfo<IArbeidstidPeriodeMedTimer> = {
    periode: { fom: '', tom: '' },
    fraværTimerPerDag: '',
    jobberNormaltTimerPerDag: '',
    fraværPerDag: { timer: '', minutter: '' },
    jobberNormaltPerDag: { timer: '', minutter: '' },
    tidsformat: Tidsformat.TimerOgMin,
};

interface FormValues {
    perioder: Periodeinfo<IArbeidstidPeriodeMedTimer>[];
}

interface Props {
    perioder: Periodeinfo<IArbeidstidPeriodeMedTimer>[];
    soknadsperioder: IPeriode[];
    lagre: (perioder: Periodeinfo<IArbeidstidPeriodeMedTimer>[]) => void;
    avbryt: () => void;
}

const FraværPeriodeListe = ({ perioder, soknadsperioder, lagre, avbryt }: Props) => {
    const formikRef = useRef<FormikProps<FormValues>>(null);

    const initialValues: FormValues = { perioder: [emptyPeriode] };

    const handleSave = (values?: FormValues) => {
        const current = values || formikRef.current?.values;
        if (!current) return;
        const processed = processTilsynPeriods(
            current.perioder as any,
            perioder as any,
        ) as Periodeinfo<IArbeidstidPeriodeMedTimer>[];
        lagre(processed);
    };

    return (
        <Formik<FormValues>
            initialValues={initialValues}
            onSubmit={handleSave}
            validationSchema={createValidationSchema(soknadsperioder)}
            innerRef={formikRef}
        >
            {({ handleSubmit, values, errors, touched }) => (
                <FieldArray
                    name="perioder"
                    render={(arrayHelpers) => (
                        <div>
                            <Heading level="1" size="medium">
                                Periode med fravær
                            </Heading>

                            {values.perioder.map((_, index) => (
                                <div className="mb-8" key={index}>
                                    <FraværPeriode
                                        name={`perioder.${index}`}
                                        soknadsperioder={soknadsperioder}
                                        remove={() => arrayHelpers.remove(index)}
                                    />
                                </div>
                            ))}

                            {touched.perioder && errors.perioder && typeof errors.perioder === 'string' && (
                                <Alert variant="error" size="small" className="mb-4">
                                    {errors.perioder}
                                </Alert>
                            )}

                            <VerticalSpacer sixteenPx />

                            <Button
                                variant="tertiary"
                                icon={<PlusCircleIcon />}
                                onClick={() => arrayHelpers.push({ ...emptyPeriode })}
                                size="small"
                            >
                                Legg til periode
                            </Button>

                            <VerticalSpacer sixteenPx />

                            <div className="flex gap-2">
                                <Button size="small" onClick={() => handleSubmit()}>
                                    Lagre
                                </Button>
                                <Button size="small" variant="secondary" onClick={avbryt}>
                                    Avbryt
                                </Button>
                            </div>
                        </div>
                    )}
                />
            )}
        </Formik>
    );
};

export default FraværPeriodeListe;
