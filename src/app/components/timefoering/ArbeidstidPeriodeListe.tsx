import React, { useRef, useState } from 'react';

import { PlusCircleIcon } from '@navikt/aksel-icons';
import { Alert, Button, Checkbox, Heading } from '@navikt/ds-react';
import { FieldArray, Formik, FormikProps } from 'formik';
import * as yup from 'yup';

import { ArbeidstidPeriodeMedTimer, IArbeidstidPeriodeMedTimer, IPeriode, Periodeinfo } from 'app/models/types';
import { arbeidstimerPeriode } from 'app/rules/yup';
import { processArbeidstidPeriods } from 'app/utils/arbeidstidPeriodUtils';
import { checkPeriodsWithinSoknadsperioder, formatSoknadsperioder, checkPeriodOverlap } from 'app/utils/periodUtils';
// import { checkPeriodOverlap } from 'app/utils/periodUtils';

import ArbeidstidPeriode from './ArbeidstidPeriode';

const createValidationSchema = (soknadsperioder: IPeriode[]) =>
    // const createValidationSchema = () =>
    yup.object({
        perioder: yup
            .array()
            .of(arbeidstimerPeriode)
            .test('no-overlap', 'Perioder kan ikke overlappe hverandre', (periods) => {
                if (!periods) return true;
                return !checkPeriodOverlap(periods as Periodeinfo<IArbeidstidPeriodeMedTimer>[]);
            })
            .test(
                'within-soknadsperioder',
                `Arbeidstid må være innenfor søknadsperioder. Gyldig interval: [${formatSoknadsperioder(soknadsperioder)}]`,
                (periods) => {
                    if (!periods) return true;
                    return !checkPeriodsWithinSoknadsperioder(
                        periods as Periodeinfo<IArbeidstidPeriodeMedTimer>[],
                        soknadsperioder,
                    );
                },
            ),
    });

interface FormValues {
    perioder: Periodeinfo<IArbeidstidPeriodeMedTimer>[];
}

interface Props {
    arbeidstidPerioder: Periodeinfo<IArbeidstidPeriodeMedTimer>[];
    soknadsperioder: IPeriode[];

    lagre: (arbeidstidInfo: Periodeinfo<IArbeidstidPeriodeMedTimer>[]) => void;
    avbryt: () => void;
}

const ArbeidstidPeriodeListe = (props: Props) => {
    const formikRef = useRef<FormikProps<FormValues>>(null);
    const [filtrerHelg, setFiltrerHelg] = useState(false);

    const { arbeidstidPerioder, soknadsperioder } = props;
    const { lagre, avbryt } = props;

    const initialValues: { perioder: Periodeinfo<IArbeidstidPeriodeMedTimer>[] } = {
        perioder: [
            new ArbeidstidPeriodeMedTimer({
                periode: { fom: '', tom: '' },
                faktiskArbeidPerDag: { timer: '', minutter: '' },
                jobberNormaltPerDag: { timer: '', minutter: '' },
            }),
        ],
    };

    const handleSaveValues = (values?: { perioder: Periodeinfo<IArbeidstidPeriodeMedTimer>[] }) => {
        const currentValues = values || formikRef.current?.values;

        if (currentValues) {
            const processedPeriods = processArbeidstidPeriods(
                currentValues.perioder,
                arbeidstidPerioder,
                { filterWeekends: filtrerHelg }, // Kan endres til true hvis vi vil filtrere helger
            );

            lagre(processedPeriods);
        }
    };

    return (
        <Formik<FormValues>
            initialValues={initialValues}
            onSubmit={(values) => handleSaveValues(values)}
            validationSchema={createValidationSchema(soknadsperioder)}
            // validationSchema={createValidationSchema()}
            innerRef={formikRef}
            enableReinitialize
        >
            {({ handleSubmit, values, errors, touched }) => (
                <FieldArray
                    name="perioder"
                    render={(arrayHelpers) => (
                        <div>
                            <Heading level="1" size="medium">
                                Periode med jobb
                            </Heading>

                            {values.perioder && values.perioder.length > 0 ? (
                                values.perioder.map((periode, index) => (
                                    <div className="mb-8" key={index}>
                                        <ArbeidstidPeriode
                                            name={`perioder.${index}`}
                                            soknadsperioder={soknadsperioder}
                                            remove={() => arrayHelpers.remove(index)}
                                        />
                                    </div>
                                ))
                            ) : (
                                <div>Ingen perioder å vise</div>
                            )}

                            <div className="mt-4 mb-4">
                                <Checkbox
                                    onChange={() => {
                                        setFiltrerHelg(!filtrerHelg);
                                    }}
                                    checked={filtrerHelg}
                                >
                                    Filtrer helg
                                </Checkbox>
                            </div>
                            {touched.perioder && errors.perioder && typeof errors.perioder === 'string' && (
                                <Alert variant="error" className="mb-4">
                                    {errors.perioder}
                                </Alert>
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
                                    icon={<PlusCircleIcon />}
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
            )}
        </Formik>
    );
};

export default ArbeidstidPeriodeListe;
