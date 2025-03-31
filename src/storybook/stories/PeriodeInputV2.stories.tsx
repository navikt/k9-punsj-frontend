import React, { useState } from 'react';
import { Formik } from 'formik';
import { Button, HStack } from '@navikt/ds-react';
import PeriodeInputV2 from 'app/components/periode-inputV2/PeriodeInputV2';
import { IPeriode } from 'app/models/types/Periode';

const meta = {
    title: 'Components/PeriodeInputV2',
    component: PeriodeInputV2,
    parameters: {
        layout: 'centered',
    },
};

export default meta;

const PeriodeInputV2WithFormik = ({ initialValues }: { initialValues?: IPeriode }) => {
    const [submittedValues, setSubmittedValues] = useState<IPeriode | null>(null);

    return (
        <Formik
            initialValues={{
                periode: initialValues || { fom: null, tom: null },
            }}
            onSubmit={(values) => {
                setSubmittedValues(values.periode);
            }}
        >
            {({ values, setFieldValue, handleSubmit }) => (
                <form onSubmit={handleSubmit}>
                    <PeriodeInputV2
                        periode={values.periode}
                        onChange={(periode) => setFieldValue('periode', periode)}
                        onBlur={(periode) => setFieldValue('periode', periode)}
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittedValues(periode);
    };

    return (
        <form onSubmit={handleSubmit}>
            <PeriodeInputV2
                periode={periode}
                onChange={setPeriode}
                onBlur={(periodeValue) => setPeriode(periodeValue)}
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

    const handleSubmit = () => {
        setSubmittedValues(periode);
    };

    return (
        <div>
            <PeriodeInputV2
                periode={periode}
                onChange={setPeriode}
                onBlur={(periodeValue) => setPeriode(periodeValue)}
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

export const Default = {
    render: () => <PeriodeInputV2WithFormik />,
};

export const WithInitialValues = {
    render: () => (
        <PeriodeInputV2WithFormik
            initialValues={{
                fom: '2024-01-01',
                tom: '2024-12-31',
            }}
        />
    ),
};

export const WithoutFormik = {
    render: () => <PeriodeInputV2WithoutFormik />,
};

export const WithoutFormikWithInitialValues = {
    render: () => (
        <PeriodeInputV2WithoutFormik
            initialValues={{
                fom: '2024-01-01',
                tom: '2024-12-31',
            }}
        />
    ),
};

export const Simple = {
    render: () => <PeriodeInputV2Simple />,
};

export const SimpleWithInitialValues = {
    render: () => (
        <PeriodeInputV2Simple
            initialValues={{
                fom: '2024-01-01',
                tom: '2024-12-31',
            }}
        />
    ),
};
