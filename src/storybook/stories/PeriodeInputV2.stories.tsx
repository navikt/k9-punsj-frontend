import React, { useState } from 'react';
import { Formik } from 'formik';
import { Button, HStack, Checkbox } from '@navikt/ds-react';
import PeriodeInputV2 from 'app/components/periode-inputV2/PeriodeInputV2';
import { IPeriode } from 'app/models/types/Periode';
import * as yup from 'yup';
import dayjs from 'dayjs';
import { formats } from 'app/utils';

const meta = {
    title: 'Components/PeriodeInputV2',
    component: PeriodeInputV2,
    parameters: {
        layout: 'centered',
    },
};

export default meta;

interface FormValues {
    periode: IPeriode;
}

const periodeSchema = yup.object({
    periode: yup.object({
        fom: yup.string().required().label('Fra og med'),
        tom: yup
            .string()
            .required()
            .test('tom-not-before-fom', 'Sluttdato kan ikke være før startdato', function (value) {
                const { fom } = this.parent;
                if (!fom || !value) return true; // Skip validation if either date is missing
                return dayjs(value, formats.YYYYMMDD).isSameOrAfter(dayjs(fom, formats.YYYYMMDD));
            })
            .label('Til og med'),
    }),
});

const PeriodeInputV2WithFormik = ({ initialValues }: { initialValues?: IPeriode }) => {
    const [submittedValues, setSubmittedValues] = useState<IPeriode | null>(null);

    return (
        <Formik<FormValues>
            initialValues={{
                periode: initialValues || { fom: null, tom: null },
            }}
            validationSchema={periodeSchema}
            onSubmit={(values) => {
                setSubmittedValues(values.periode);
            }}
        >
            {({ handleSubmit, values, setFieldValue, errors, touched }) => (
                <form onSubmit={handleSubmit}>
                    <PeriodeInputV2
                        periode={values.periode}
                        onChange={(periode) => setFieldValue('periode', periode)}
                        onBlur={(periode) => setFieldValue('periode', periode)}
                        fomInputProps={{
                            error: touched.periode?.fom && errors.periode?.fom,
                        }}
                        tomInputProps={{
                            error: touched.periode?.tom && errors.periode?.tom,
                        }}
                    />
                    <HStack wrap gap="4" justify="start" style={{ marginTop: '1rem' }}>
                        <Button type="submit">Send</Button>
                    </HStack>
                    <div style={{ marginTop: '20px' }}>
                        <h3>Current values:</h3>
                        <pre>{JSON.stringify(values.periode, null, 2)}</pre>
                        {submittedValues && (
                            <>
                                <h3>Submitted values:</h3>
                                <pre>{JSON.stringify(submittedValues, null, 2)}</pre>
                            </>
                        )}
                    </div>
                </form>
            )}
        </Formik>
    );
};

const PeriodeInputV2WithoutFormik = ({ initialValues }: { initialValues?: IPeriode }) => {
    const [periode, setPeriode] = useState<IPeriode>(initialValues || { fom: null, tom: null });
    const [submittedValues, setSubmittedValues] = useState<IPeriode | null>(null);
    const [errors, setErrors] = useState<{ fom?: string; tom?: string }>({});

    const validate = (values: IPeriode) => {
        const newErrors: { fom?: string; tom?: string } = {};

        if (!values.fom) {
            newErrors.fom = 'Fra og med er påkrevd';
        }

        if (!values.tom) {
            newErrors.tom = 'Til og med er påkrevd';
        } else if (values.fom && dayjs(values.tom, formats.YYYYMMDD).isBefore(dayjs(values.fom, formats.YYYYMMDD))) {
            newErrors.tom = 'Sluttdato kan ikke være før startdato';
        }

        return newErrors;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validationErrors = validate(periode);
        if (Object.keys(validationErrors).length === 0) {
            setSubmittedValues(periode);
        } else {
            setErrors(validationErrors);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <PeriodeInputV2
                periode={periode}
                onChange={(newPeriode) => {
                    setPeriode(newPeriode);
                    setErrors(validate(newPeriode));
                }}
                onBlur={(newPeriode) => {
                    setPeriode(newPeriode);
                    setErrors(validate(newPeriode));
                }}
                fomInputProps={{
                    error: errors.fom,
                }}
                tomInputProps={{
                    error: errors.tom,
                }}
            />
            <HStack wrap gap="4" justify="start" style={{ marginTop: '1rem' }}>
                <Button type="submit">Send</Button>
            </HStack>
            <div style={{ marginTop: '20px' }}>
                <h3>Current values:</h3>
                <pre>{JSON.stringify(periode, null, 2)}</pre>
                {submittedValues && (
                    <>
                        <h3>Submitted values:</h3>
                        <pre>{JSON.stringify(submittedValues, null, 2)}</pre>
                    </>
                )}
            </div>
        </form>
    );
};

const PeriodeInputV2Simple = ({ initialValues }: { initialValues?: IPeriode }) => {
    const [periode, setPeriode] = useState<IPeriode>(initialValues || { fom: null, tom: null });
    const [submittedValues, setSubmittedValues] = useState<IPeriode | null>(null);
    const [errors, setErrors] = useState<{ fom?: string; tom?: string }>({});

    const validate = (values: IPeriode) => {
        const newErrors: { fom?: string; tom?: string } = {};

        if (!values.fom) {
            newErrors.fom = 'Fra og med er påkrevd';
        }

        if (!values.tom) {
            newErrors.tom = 'Til og med er påkrevd';
        } else if (values.fom && dayjs(values.tom, formats.YYYYMMDD).isBefore(dayjs(values.fom, formats.YYYYMMDD))) {
            newErrors.tom = 'Sluttdato kan ikke være før startdato';
        }

        return newErrors;
    };

    const handleSubmit = () => {
        const validationErrors = validate(periode);
        if (Object.keys(validationErrors).length === 0) {
            setSubmittedValues(periode);
        } else {
            setErrors(validationErrors);
        }
    };

    return (
        <div>
            <PeriodeInputV2
                periode={periode}
                onChange={(newPeriode) => {
                    setPeriode(newPeriode);
                    setErrors(validate(newPeriode));
                }}
                onBlur={(newPeriode) => {
                    setPeriode(newPeriode);
                    setErrors(validate(newPeriode));
                }}
                fomInputProps={{
                    error: errors.fom,
                }}
                tomInputProps={{
                    error: errors.tom,
                }}
            />
            <HStack wrap gap="4" justify="start" style={{ marginTop: '1rem' }}>
                <Button onClick={handleSubmit}>Send</Button>
            </HStack>
            <div style={{ marginTop: '20px' }}>
                <h3>Current values:</h3>
                <pre>{JSON.stringify(periode, null, 2)}</pre>
                {submittedValues && (
                    <>
                        <h3>Submitted values:</h3>
                        <pre>{JSON.stringify(submittedValues, null, 2)}</pre>
                    </>
                )}
            </div>
        </div>
    );
};

const PeriodeInputV2WithPresetPeriod = () => {
    const [submittedValues, setSubmittedValues] = useState<IPeriode | null>(null);
    const [usePresetPeriod, setUsePresetPeriod] = useState(false);

    const presetPeriod = {
        fom: '2024-01-01',
        tom: '2024-12-31',
    };

    const currentPeriod = usePresetPeriod ? presetPeriod : { fom: null, tom: null };

    return (
        <Formik<FormValues>
            initialValues={{
                periode: currentPeriod,
            }}
            validationSchema={periodeSchema}
            onSubmit={(values) => {
                setSubmittedValues(values.periode);
            }}
            enableReinitialize
        >
            {({ handleSubmit, values, setFieldValue, errors, touched }) => (
                <form onSubmit={handleSubmit}>
                    <PeriodeInputV2
                        periode={currentPeriod}
                        onChange={(periode) => setFieldValue('periode', periode)}
                        onBlur={(periode) => setFieldValue('periode', periode)}
                        fomInputProps={{
                            error: touched.periode?.fom && errors.periode?.fom,
                        }}
                        tomInputProps={{
                            error: touched.periode?.tom && errors.periode?.tom,
                        }}
                    />
                    <HStack wrap gap="4" justify="start" style={{ marginTop: '1rem' }}>
                        <Checkbox
                            checked={usePresetPeriod}
                            onChange={(e) => {
                                setUsePresetPeriod(e.target.checked);
                                setFieldValue('periode', e.target.checked ? presetPeriod : { fom: null, tom: null });
                            }}
                        >
                            Bruk forhåndsinnstilt periode (01.01.2024 - 31.12.2024)
                        </Checkbox>
                    </HStack>
                    <HStack wrap gap="4" justify="start" style={{ marginTop: '1rem' }}>
                        <Button type="submit">Send</Button>
                    </HStack>
                    <div style={{ marginTop: '20px' }}>
                        <h3>Current values:</h3>
                        <pre>{JSON.stringify(values.periode, null, 2)}</pre>
                        {submittedValues && (
                            <>
                                <h3>Submitted values:</h3>
                                <pre>{JSON.stringify(submittedValues, null, 2)}</pre>
                            </>
                        )}
                    </div>
                </form>
            )}
        </Formik>
    );
};

export const Default = {
    name: 'Default',
    render: () => <PeriodeInputV2Simple />,
};

export const WithInitialValues = {
    name: 'With Initial Values',
    render: () => (
        <PeriodeInputV2Simple
            initialValues={{
                fom: '2024-01-01',
                tom: '2024-12-31',
            }}
        />
    ),
};

export const WithFormik = {
    name: 'With Formik',
    render: () => <PeriodeInputV2WithFormik />,
};

export const WithFormikAndInitialValues = {
    name: 'With Formik and Initial Values',
    render: () => (
        <PeriodeInputV2WithFormik
            initialValues={{
                fom: '2024-01-01',
                tom: '2024-12-31',
            }}
        />
    ),
};

export const WithForm = {
    name: 'With Form',
    render: () => <PeriodeInputV2WithoutFormik />,
};

export const WithFormAndInitialValues = {
    name: 'With Form and Initial Values',
    render: () => (
        <PeriodeInputV2WithoutFormik
            initialValues={{
                fom: '2024-01-01',
                tom: '2024-12-31',
            }}
        />
    ),
};

export const WithPresetPeriod = {
    name: 'With Preset Period',
    render: () => <PeriodeInputV2WithPresetPeriod />,
};
